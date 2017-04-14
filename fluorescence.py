#!/usr/bin/env python

# Python imports
import os
import json
import collections
import pprint
pp=pprint.pprint

# Project imports
import util
import util_date

NAMESPACE = 'Fluorescence'

DATE_RANGE = util_date.DATES[NAMESPACE]

"""
Fluorescence's top level category is called Data Types, and as of this writing there's only two
entries: Horizontal and Vertical Fluorescence Data.

Beneath that, there's a subdivision of Geographical attributes (HUC8, FIPS, etc.).

Those two categories and a date range cover everything in Fluorescence.
"""

# https://data.chesapeakebay.net/api.json/Fluorescence/DataTypes
data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes')
data_type_ids = [d['DataTypeId'] for d in data_types]

# https://data.chesapeakebay.net/api.json/Fluorescence/GeographicalAttributes
geographical_types = util.download_and_jsonify(NAMESPACE, 'GeographicalAttributes')
geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

for data_type_id in data_type_ids:
    for geographical_type_id in geographical_type_ids:
        # e.g. https://data.chesapeakebay.net/api.json/Fluorescence/Vertical/Thu%20Aug%2002%201984/Mon%20Apr%2010%202017/HUC8/
        attributes = util.download_and_jsonify(NAMESPACE, data_type_id,
                                               DATE_RANGE.start.url_format,
                                               DATE_RANGE.end.url_format,
                                               geographical_type_id)
        # The attributes in this file look very similar to the same files you find in Water Quality
        # and Living Resources. They're used differently, however. Instead of using the
        # attribute IDs defined in util.GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP, fluorescence uses
        # the value of the geographical_type_id.
        # For instance, using this sample data --
        #     [{
        #         "HUCEightId": 76,
        #         "HUC8": "02050306  ",
        #         "HUC8Description": "LOWER SUSQUEHANNA"
        #     }, {
        #         "HUCEightId": 77,
        #         "HUC8": "02060001  ",
        #         "HUC8Description": "UPPER CHESAPEAKE BAY"
        #     }, {
        #         "HUCEightId": 78,
        #         "HUC8": "02060002  ",
        #         "HUC8Description": "CHESTER-SASSAFRAS"
        #     }]
        # We want to extract the ids ('02050306', '02060001', '02060002').

        # Naturally there's one geographical_type_id that requires special handling
        # (rolls eyes and sighs heavily in dramatic fashion)
        id_name = 'CBSegment2003' if geographical_type_id == 'CBSeg2003' else geographical_type_id
        attribute_ids = [d[id_name].strip() for d in attributes]

        for attribute_id in attribute_ids:
            # e.g. https://data.chesapeakebay.net/api.JSON/Fluorescence/Vertical/8-2-1984/4-10-2017/HUC8/02060002
            path = '/'.join(())
            util.download(NAMESPACE,
                          data_type_id,
                          DATE_RANGE.start.url_format,
                          DATE_RANGE.end.url_format,
                          geographical_type_id,
                          attribute_id)
