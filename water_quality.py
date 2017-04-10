#!/usr/bin/env python

# Python imports
import os
import json
import collections
import pprint
pp=pprint.pprint

# Project imports
import util

NAMESPACE = 'WaterQuality'

"""
WaterQuality data has 2 top-level categories -- CBI (historical) and present data. CBI data runs
from 1949 - 1982. Present data runs from 1982 to present.

CBI data is relatively simple compared to present data.
"""

# Fetch & read geographical attrs (e.g. HUC8, FIPS, etc.)
# http://data.chesapeakebay.net/api.json/WaterQuality/CbiGeographicalAttributes
geographical_types = util.download_and_jsonify(NAMESPACE, 'CbiGeographicalAttributes')
geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

for geographical_type_id in geographical_type_ids:
    # Use this URL to get attributes (station IDs)
    # http://data.chesapeakebay.net/api.json/WaterQuality/CBI/7-2-1949/8-13-1982/HUC12
    # Sample (abbreviated) response --
    #     [
    #         {
    #             "AvailableRecords": 16035,
    #             "HUC12": "020403040502",
    #             "HUC12Description": "020403040502-Atlantic Ocean",
    #             "HUCTwelveId": 20
    #         },
    #         {
    #             "AvailableRecords": 66,
    #             "HUC12": "020503061713",
    #             "HUC12Description": "Rock Run-Susquehanna River",
    #             "HUCTwelveId": 767
    #         },
    #         {
    #             "AvailableRecords": 171142,
    #             "HUC12": "020600010000",
    #             "HUC12Description": "Upper Chesapeake Bay",
    #             "HUCTwelveId": 768
    #         },
    #         {
    #             "AvailableRecords": 14,
    #             "HUC12": "020600020105",
    #             "HUC12Description": "Elk Neck-Upper Chesapeake Bay",
    #             "HUCTwelveId": 773
    #         }
    #     ]
    #
    attributes = util.download_and_jsonify(NAMESPACE,
                                           'CBI',
                                           util.HISTORICAL_START_DATE_M_D_YYYY,
                                           util.HISTORICAL_END_DATE_M_D_YYYY,
                                           geographical_type_id)

    attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)

    for attribute_id in attribute_ids:
        # e.g. https://data.chesapeakebay.net/api.JSON/WaterQuality/CBI/7-2-1949/8-13-1982/HUC12/20
        util.download(NAMESPACE,
                      'CBI',
                      util.HISTORICAL_START_DATE_M_D_YYYY,
                      util.HISTORICAL_END_DATE_M_D_YYYY,
                      geographical_type_id,
                      attribute_id)

# OK, done with historical data.
# Modern water quality data has 5 data types: Station Information, Monitoring Event Data,
# Water Quality Data, Light Attenuation Data, and Optical Density Data. Station info is
# significantly different from the rest, so it gets handled in its own loop.

# Each of the 5 data types requires some study to understand and download properly. I doubt
# they'll add new data types, but if they do, this code will break. That being the case, I
# check here to ensure that the data types are what I expect them to be, and fail loudly if not.
data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes')
data_types = sorted([d['DataTypeId'] for d in data_types])
expected_data_types = sorted(('Station', 'MonitorEvent', 'WaterQuality', 'LightAttenuation',
                              'OpticalDensity'))
if data_types != expected_data_types:
    print('Received data types: ' + ', '.join(data_types))
    print('Expected data types: ' + ', '.join(expected_data_types))
    raise ValueError('Unexpected or missing data type(s)')

# Fetch & read geographical types (e.g. HUC8, FIPS, etc.)
geographical_types = util.download_and_jsonify(NAMESPACE, 'GeographicalAttributes')
geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

# Handle WaterQuality/Station which is a bit different from its sibling data types.
for geographical_type_id in geographical_type_ids:
    attributes = util.download_and_jsonify(NAMESPACE, 'Station', geographical_type_id)

    attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)

    for attribute_id in attribute_ids:
        # e.g. https://data.chesapeakebay.net/api.JSON/WaterQuality/Station/HUC8/2
        util.download(NAMESPACE, 'Station', geographical_type_id, attribute_id)

# Remove Station from the list of data types since it was just handled above.
data_types = [data_type for data_type in data_types if data_type != 'Station']
# All of the other data types (MonitorEvent, WaterQuality, LightAttenuation, and OpticalDensity)
# behave mostly the same (although WaterQuality is a little more complex) and are handled by the
# code below.
programs = util.download_and_jsonify(NAMESPACE, 'Programs')
projects_by_program = util.download_and_jsonify(NAMESPACE, 'ProjectsList')

for data_type in data_types:
    print('Starting data type "{}"...'.format(data_type))
    for program in programs:
        program_id = program['ProgramId']
        projects = projects_by_program[str(program_id)]
        project_ids = [project['ProjectId'] for project in projects]
        for project_id in project_ids:
            for geographical_type_id in geographical_type_ids:
                # geographical_type_id is something like HUC8, FIPS, etc.
                # https://data.chesapeakebay.net/api.json/WaterQuality/OpticalDensity/3-29-2012/3-29-2017/2/12/HUC8/
                attributes = util.download_and_jsonify(NAMESPACE,
                                                       data_type,
                                                       util.PRESENT_START_DATE_M_D_YYYY,
                                                       util.PRESENT_END_DATE_M_D_YYYY,
                                                       program_id,
                                                       project_id,
                                                       geographical_type_id)
                attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)

                if data_type == 'WaterQuality':
                    # The WaterQuality data type uses one more level of description than its
                    # sibling data types. That level is called the 'parameter' and it describes
                    # what element of water quality one is interested in. Examples include
                    # 'Whole 5-Day Biochemical Oxygen Demand' (BOD5W) or 'Dissolved Inorganic
                    # Nitrogen' (DIN).
                    # For reasons I don't understand, the list of valid params for a given
                    # geographical type and list of stations is fetched from the remote server
                    # as the response to a POST. Maybe because constructing a URL containing
                    # all the attribute ids would be too long in some cases?

                    # From line 178 of WaterQuality.js
                    parameters = util.post_attribute_ids(NAMESPACE, path + '/Parameters',
                                                         attribute_ids)

                    # Parameters is a list of dicts; here's an example of one --
                    #    {'HUCEightId': 20,
                    #      'ProgramId': 2,
                    #      'ProjectId': 12,
                    #      'SubstanceIdentificationDescription': 'Whole 5-Day Biochemical Oxygen Demand',
                    #      'SubstanceIdentificationId': 12,
                    #      'SubstanceIdentificationName': 'BOD5W'}

                    # ProgramId and ProjectId are the same for every entry.

                    # I want to create a dict that maps geo type ids to a list of the valid
                    # parameter ids (i.e. SubstanceIdentificationId) for that geo type. The
                    # function _createParameterList() in WaterQuality.js does more or less the
                    # same thing.
                    key_name = util.GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP[geographical_type_id]
                    # key_name is something like 'HUCEightId'
                    parameters_temp = collections.defaultdict(list)
                    for parameter in parameters:
                        parameter_id = parameter['SubstanceIdentificationId']
                        parameters_temp[parameter[key_name]].append(parameter_id)

                    parameters = parameters_temp
                else:
                    parameters = {}

                for attribute_id in attribute_ids:
                    path = [NAMESPACE,
                            data_type,
                            util.PRESENT_START_DATE_M_D_YYYY,
                            util.PRESENT_END_DATE_M_D_YYYY,
                            program_id,
                            project_id,
                            geographical_type_id,
                            attribute_id]
                    if data_type == 'WaterQuality':
                        # WaterQuality uses an extra param as described above.
                        parameter_ids = parameters[attribute_id]

                        for parameter_id in parameter_ids:
                            # e.g. https://data.chesapeakebay.net/api.JSON/WaterQuality/OpticalDensity/3-29-2012/3-29-2017/2/12/HUC8/20/119
                            util.download(*(path + [str(parameter_id)]))
                    else:
                        # e.g. https://data.chesapeakebay.net/api.JSON/WaterQuality/OpticalDensity/3-29-2012/3-29-2017/2/12/HUC8/20
                        util.download(*path)
