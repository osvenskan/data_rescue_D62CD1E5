#!/usr/bin/env python

# Python imports

# Project imports
import util
import util_date

NAMESPACE = 'PointSource'

DATE_RANGE = util_date.DATES[NAMESPACE]

"""
PointSource's top level category is called Data Types, and as of this writing there's only two
entries: Facility Information and Load Data.

Beneath that, there's a subdivision of Geographical attributes (FIPS, State, Facility).

Those two categories and (sometimes) a date range cover everything in PointSource.
"""


def extract_attribute_ids(geographical_type_id, attributes):
    """PointSource-specific version of util.extract_attribute_ids() (q.v.)"""
    id_name = 'NPDES' if geographical_type_id == 'Facility' else geographical_type_id
    return [attribute[id_name] for attribute in attributes]


# https://data.chesapeakebay.net/api.json/PointSource/DataTypes
data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes')
data_type_ids = sorted([d['DataTypeId'] for d in data_types])

# There are only 2 data types, and they're handled differently, so if they ever change, this
# code will break. If I'm going to fail, I want to fail early and loudly so let's check it here.
expected_data_type_ids = ['FacilityInformation', 'LoadData']
if data_type_ids != expected_data_type_ids:
    raise ValueError('Expected {}, got {}'.format(expected_data_type_ids, data_type_ids))


# https://data.chesapeakebay.net/api.json/PointSource/GeographicalAttributes
geographical_types = util.download_and_jsonify(NAMESPACE, 'GeographicalAttributes')
geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

# Data Type FacilityInformation
for geographical_type_id in geographical_type_ids:
    # e.g. https://data.chesapeakebay.net/api.json/PointSource/FacilityInformation/FIPS/
    attributes = util.download_and_jsonify(NAMESPACE, 'FacilityInformation', geographical_type_id)
    attribute_ids = extract_attribute_ids(geographical_type_id, attributes)
    for attribute_id in attribute_ids:
        # e.g. https://data.chesapeakebay.net/api.JSON/PointSource/FacilityInformation/Facility/DC0000094
        util.download(NAMESPACE, 'FacilityInformation', geographical_type_id, attribute_id)


# Data Type LoadData
for geographical_type_id in geographical_type_ids:
    # e.g. https://data.chesapeakebay.net/api.JSON/PointSource/LoadData/Sat%20Apr%2001%202017/Mon%20Apr%2010%202017/FIPS/
    attributes = util.download_and_jsonify(NAMESPACE,
                                           'LoadData',
                                           DATE_RANGE.start.url_format_for_geographic_type,
                                           DATE_RANGE.end.url_format_for_geographic_type,
                                           geographical_type_id)

    attribute_ids = extract_attribute_ids(geographical_type_id, attributes)
    for attribute_id in attribute_ids:
        # e.g. https://data.chesapeakebay.net/api.JSON/PointSource/LoadData/1-1-1970/4-14-2017/Facility/DC0000019
        # e.g. https://data.chesapeakebay.net/api.JSON/PointSource/LoadData/1-1-1970/4-10-2017/State/PA
        util.download(NAMESPACE,
                      'LoadData',
                      DATE_RANGE.start.url_format_for_attribute,
                      DATE_RANGE.end.url_format_for_attribute,
                      geographical_type_id,
                      attribute_id)
