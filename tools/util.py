import os
import time
import urllib.request
import urllib.parse
import urllib.error
import datetime
import time
import json
import http.client

import util_date

HOST = 'data.chesapeakebay.net'

# The host accepts api.json and api.JSON in the URLs. Our convention is to always use lower case.
BASE_URL = '/api.json'

# POLITENESS_DELAY controls how long we'll wait between requests to be nice to the
# destination server. This data is organized into lots and lots of small files, and each file
# download pauses for the POLITENESS_DELAY, so adjusting this just a little can have a big
# effect on how long it takes to complete a set of downloads.
# As of August 2017, http://datahub.chesapeakebay.net/robots.txt doesn't exist, so the site itself
# gives us no guidance on what a polite crawl delay might be.
POLITENESS_DELAY = 0.5

# Connection attempt timeout, in seconds.
TIMEOUT = 60.0

# N_CONNECTION_RETRIES expresses the number of attempts at connecting after a timeout before
# giving up entirely.
N_CONNECTION_RETRIES = 3

# N_DOWNLOAD_RETRIES expresses the number of attempts at downloading a file despite errors
# (e.g. connection reset) before giving up entirely.
N_DOWNLOAD_RETRIES = 3

# JSON_INDENT controls whether or not the JSON written to disk will be formatted. Set to
# None to write JSON in the most compact format. Set to '\t' to pretty print. (See doc for the
# indent param to json.dump().)
JSON_INDENT = None

# GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP maps the 6 geographical types to the text strings of the IDs
# used to represent them in the JSON. This same map is hardcoded in the various JavaScript files
# so I feel pretty safe hardcoding it here.
# ref: _getGeographicalIDList() in WaterQuality.js (line 459)
# ref: _fillGeoMultiSelect() in LivingResources.js (line 229)
GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP = {'HUC8': 'HUCEightId',
                                      'HUC12': 'HUCTwelveId',
                                      'FIPS': 'FIPSStateCountyCodeId',
                                      'CBSeg2003': 'CBSegment2003Id',
                                      'SegmentShed2009': 'CBSegmentShed2009Id',
                                      'Station': 'MonitoringLocationId',
                                      'Agency': 'DataProviderId',
                                      'EcoRegion': 'EPALevelFourEcoregionId',
                                      }

# _http_connection is a global for use by this module only. Making it global allows us to keep
# the HTTP connection alive between requests which is more polite to the remote server.
_http_connection = None

def _connect_to_server():
    """Internal-use only function for establishing an HTTP connection to chesapeakebay.net"""
    connection = None

    # Connection timeouts are not frequent, but they happen often enough and it's a real
    # disappointment to find that the script you thought had been running for hours actually
    # died on a connection timeout. For that reason, I added some retries on connection
    # timeouts.
    n_retries = N_CONNECTION_RETRIES
    connected = False
    while not connected and n_retries:
        # Take a quick nap to give the remote server a moment to pull itself together.
        time.sleep(1)
        try:
            connection = http.client.HTTPConnection(HOST)
        except urllib.error.URLError as error:
            if isinstance(error.reason, TimeoutError) and n_retries:
                msg = 'Connection timed out after {} seconds; will retry {} times.'
                print(msg.format(TIMEOUT, n_retries))
                n_retries -= 1
            else:
                # Print timestamp so that I know when this died. It's useful when I'm
                # running this overnight.
                print(datetime.datetime.now().isoformat())
                raise
        else:
            connected = True

    return connection


def url_to_filename(url):
    """Given a URL to the chesapeakebay.net server, returns a corresponding filename. The URL can
    be whole or partial. The filename will always be in the data directory and is relative to
    the tools directory (i.e. the filename always starts with '../data/').

    This function strips the invariant parts from the start of the URL. It also translates dates
    in the URL into ISO format for improved parseability and legibility.

    Examples:
    https://data.chesapeakebay.net/api.JSON/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30 ==>
    ../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json

    http://data.chesapeakebay.net/api.JSON/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30 ==>
    ../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json

    This must be called *before* any special characters are URL-encoded (like the spaces in the
    fluorescence dates).
    """
    url = url.replace("api.JSON", "api.json")

    if url.startswith('http://'):
        url = url[7:]
    if url.startswith('https://'):
        url = url[8:]
    if url.startswith(HOST):
        url = url[len(HOST):]
    if url.startswith(BASE_URL):
        url = url[len(BASE_URL):]
    if url.startswith('/'):
        url = url[1:]

    for url_format, filename_format in util_date.URL_DATE_TO_FILENAME_MAP.items():
        if url_format in url:
            url = url.replace(url_format, filename_format)

    url += '.json'

    return os.path.join('..', 'data', url)


def extract_attribute_ids(geographical_type_id, attributes):
    """Given a list of dicts containing attribute ids, return a list of those IDs.

    The attributes come from a file like this one:
    https://data.chesapeakebay.net/api.json/WaterQuality/Station/HUC8/
    Same as:
    ../data/WaterQuality/Station/HUC8.json

    Here's a sample --
    [
        {
            "HUC8": "02050101",
            "HUC8Description": "Upper Susquehanna",
            "HUCEightId": 2
        },
        {
            "HUC8": "02050102",
            "HUC8Description": "Chenango",
            "HUCEightId": 3
        },
        {
            "HUC8": "02050103",
            "HUC8Description": "Owego-Wappasening",
            "HUCEightId": 4
        }
    ]

    For the data above, this function would return the HUCEightIds [2, 3, 4].
    """
    id_name = GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP[geographical_type_id]

    return [attribute[id_name] for attribute in attributes]


def create_filename_directories(filename):
    """Given a filename, ensures the directories expressed in the filename exist, creating them
    if necessary.
    """
    # Create target directories if necessary.
    path = os.path.dirname(filename)
    # makedirs "will become confused" if '..' is present, so in case it is, normalize path.
    # ref: Python doc
    path = os.path.normpath(path)
    os.makedirs(path, exist_ok=True)


def post_attribute_ids(attribute_ids, *path_elements):
    """POSTs a list of attribute IDs to the URL specified and returns the JSON response.
    This is only used by water_quality.py
    """
    url = '/'.join([str(path_element) for path_element in path_elements])

    filename = url_to_filename(url)

    if os.path.exists(filename):
        print('{} already exists; skipping.'.format(filename))
        with open(filename, 'rb') as f:
            data = json.load(f)
    else:
        time.sleep(POLITENESS_DELAY)

        url = BASE_URL + '/' + urllib.parse.quote(url)
        print('POSTing to {}...'.format(url))
        # Construct params for POST
        data = {'parametersList': ','.join([str(attribute_id) for attribute_id in attribute_ids])}
        data = urllib.parse.urlencode(data)
        data = data.encode('utf-8')

        with urllib.request.urlopen('http://' + HOST + url, data) as f:
            data = f.read()

        check_for_error_in_content(data)

        print('Writing {}...'.format(filename))
        # Deserialize to accomplish 2 things -- first, test that what I got is valid JSON.
        # Second, so that I can write it to disk nicely formatted (which helps with debugging).
        data = json.loads(data)
        create_filename_directories(filename)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=JSON_INDENT)

    return data


def post_single_attribute_id(attribute_id, *path_elements):
    """POSTs a single attribute IDs to the URL specified and returns the JSON response.
    This is only used by living_resources.py.
    """
    # This is the only place where I can't make a 1:1 correspondence between the URL name and
    # the filename. The URL to which I POST the attribute_id doesn't vary, so here I apply the ugly
    # hack of constructing a fake URL that includes the attribute id, using that to generate a
    # filename, and then building the real URL later.
    fake_url = '/'.join([str(path_element)
                         for path_element
                         in list(path_elements) + [attribute_id]])

    filename = url_to_filename(fake_url)

    if os.path.exists(filename):
        print('{} already exists; skipping.'.format(filename))
        with open(filename, 'rb') as f:
            data = json.load(f)
    else:
        time.sleep(POLITENESS_DELAY)

        url = '/'.join([str(path_element) for path_element in path_elements])

        url = BASE_URL + '/' + urllib.parse.quote(url)
        print('POSTing to {}...'.format(url))
        # Construct params for POST
        data = {'geographicalAttributesList': attribute_id}
        data = urllib.parse.urlencode(data)
        data = data.encode('utf-8')

        with urllib.request.urlopen('http://' + HOST + url, data) as f:
            data = f.read()

        check_for_error_in_content(data)

        print('Writing {}...'.format(filename))
        # Deserialize to accomplish 2 things -- first, test that what I got is valid JSON.
        # Second, so that I can write it to disk nicely formatted (which helps with debugging).
        data = json.loads(data)
        create_filename_directories(filename)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=JSON_INDENT)

    return data


def download_and_jsonify(*path_elements):
    """Same as download(), but also JSONifies and returns the file contents."""
    filename = download(*path_elements)
    with open(filename, 'r') as f:
        the_json_data = json.load(f)
    return the_json_data


def download(*path_elements):
    """Given a variable number of args, combines those args into a URL, checks to see that the
    associated file exists, and if it does not, downloads it.
    """
    global _http_connection

    if not _http_connection:
        print("Reconnecting...")
        _http_connection = _connect_to_server()

    url = '/'.join([str(path_element) for path_element in path_elements])

    filename = url_to_filename(url)

    if os.path.exists(filename):
        print('{} already exists; skipping.'.format(filename))
    else:
        time.sleep(POLITENESS_DELAY)

        url = BASE_URL + '/' + urllib.parse.quote(url)
        print('Downloading {}...'.format(url))
        _http_connection.request('GET', url)
        response = _http_connection.getresponse()
        if response.status == 200:
            data = response.read()
            data_received = True
        else:
            raise ValueError("response.status == {}".format(response.status))

        check_for_error_in_content(data)

        create_filename_directories(filename)

        print('Writing {}...'.format(filename))
        # Deserialize to accomplish 2 things -- first, tests that what I got is valid JSON.
        # Second, so that I can write it to disk nicely formatted (which helps with debugging).
        data = json.loads(data)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=JSON_INDENT)

    return filename


def check_for_error_in_content(data):
    '''Given raw bytes from a download, scan them for the phrase that the chesapeakebay server
    emits when things go awry.
    '''
    if b"An error has occurred" in data:
        data = data.decode('utf-8')
        msg = 'The JSON returned indicates an error: \n\n' + data
        raise ValueError(msg)
