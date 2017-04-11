#!/usr/bin/env python

# Python imports
import os
import json
import collections
import pprint
pp=pprint.pprint

# Project imports
import util

NAMESPACE = 'PointSource'

"""
PointSource's top level category is called Data Types, and as of this writing there's only two
entries: Facility Information and Load Data.

Beneath that, there's a subdivision of Geographical attributes (FIPS, State, Facility).

Those two categories and (sometimes) a date range cover everything in PointSource.
"""

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

    # The attributes in this file look very similar to the same files you find in Water Quality
    # and Living Resources. They're used differently, however. Instead of using the
    # attribute IDs defined in util.GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP, PointSource uses
    # the value of the geographical_type_id. (Fluorescence does the same.)
    # For instance, using this sample data --
    #     [{"FIPS": "24001",
    #       "County_City": "ALLEGANY",
    #       "State": "MD"
    #      }, {
    #       "FIPS": "24003",
    #       "County_City": "ANNE ARUNDEL",
    #       "State": "MD"
    #     }, {
    #       "FIPS": "24005",
    #       "County_City": "BALTIMORE",
    #       "State": "MD"
    #     }
    # We want to extract the ids ('24001', '24003', '24005').
    #
    # That's true except for the geo type 'Facility'.
    id_name = 'NPDES' if geographical_type_id == 'Facility' else geographical_type_id
    attribute_ids = [d[id_name].strip() for d in attributes]
    for attribute_id in attribute_ids:
        # e.g. https://data.chesapeakebay.net/api.JSON/PointSource/FacilityInformation/Facility/DC0000094
        util.download(NAMESPACE, 'FacilityInformation', geographical_type_id, attribute_id)





# for data_type_id in data_type_ids:
#     for geographical_type_id in geographical_type_ids:
#         https://data.chesapeakebay.net/api.json/PointSource/FacilityInformation/FIPS/

#         # e.g. https://data.chesapeakebay.net/api.json/Fluorescence/Vertical/Thu%20Aug%2002%201984/Mon%20Apr%2010%202017/HUC8/
#         attributes = util.download_and_jsonify(NAMESPACE, data_type_id,
#                                                util.FLUORESCENCE_START_DATE,
#                                                util.FLUORESCENCE_END_DATE,
#                                                geographical_type_id)
#         # The attributes in this file look very similar to the same files you find in Water Quality
#         # and Living Resources. They're used differently, however. Instead of using the
#         # attribute IDs defined in util.GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP, fluorescence uses
#         # the value of the geographical_type_id.
#         # For instance, using this sample data --
#         #     [{
#         #         "HUCEightId": 76,
#         #         "HUC8": "02050306  ",
#         #         "HUC8Description": "LOWER SUSQUEHANNA"
#         #     }, {
#         #         "HUCEightId": 77,
#         #         "HUC8": "02060001  ",
#         #         "HUC8Description": "UPPER CHESAPEAKE BAY"
#         #     }, {
#         #         "HUCEightId": 78,
#         #         "HUC8": "02060002  ",
#         #         "HUC8Description": "CHESTER-SASSAFRAS"
#         #     }]
#         # We want to extract the ids ('02050306', '02060001', '02060002').

#         # Naturally there's one geographical_type_id that requires special handling
#         # (rolls eyes and sighs heavily in dramatic fashion)
#         id_name = 'CBSegment2003' if geographical_type_id == 'CBSeg2003' else geographical_type_id
#         attribute_ids = [d[id_name].strip() for d in attributes]

#         for attribute_id in attribute_ids:
#             # e.g. https://data.chesapeakebay.net/api.JSON/Fluorescence/Vertical/8-2-1984/4-10-2017/HUC8/02060002
#             util.download(NAMESPACE, data_type_id,
#                           util.FLUORESCENCE_START_DATE, util.FLUORESCENCE_END_DATE,
#                           geographical_type_id, attribute_id)
