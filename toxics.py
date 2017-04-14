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

NAMESPACE = 'Toxics'

DATE_RANGE = util_date.DATES[NAMESPACE]

"""
Toxics's top level category is called Data Types, and as of this writing there's only three
entries: Chemical Contaminant Data, Threshold Data, and Reference Information.

"""

GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP = {'HUC8': 'HUC8',
                                      'FIPS': 'FIPS',
                                      'CBSeg': 'CBSEG_1985',
                                      'CBPBasin': 'BASIN',
                                      }

def extract_attribute_ids(geographical_type_id, attributes):
    """Toxics-specific version of util.extract_attribute_ids() (q.v.)"""
    id_name = GEOGRAPHICAL_TYPE_ATTRIBUTE_ID_MAP[geographical_type_id]
    return [attribute[id_name] for attribute in attributes]


# https://data.chesapeakebay.net/api.json/Toxics/DataTypes
data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes')
data_type_ids = sorted([d['DataTypeId'] for d in data_types])

# https://data.chesapeakebay.net/api.json/Toxics/MediaTypes
media_types = util.download_and_jsonify(NAMESPACE, 'MediaTypes')
media_type_ids = sorted([d['MEDIA_TYPE'] for d in media_types])
# Sample of media types:
# [{
#     "MEDIA_TYPE": "SED",
#     "MEDIA_SUB_TYPE": "SEDIMENT",
#     "DESCRIPTION": "SEDIMENT"
# }, {
#     "MEDIA_TYPE": "BIL",
#     "MEDIA_SUB_TYPE": "TISSUE",
#     "DESCRIPTION": "BILE FLUID ONLY"
# }, {
#     "MEDIA_TYPE": "FIL",
#     "MEDIA_SUB_TYPE": "TISSUE",
#     "DESCRIPTION": "FISH TISSUE-FILET"
# }]
# Fish filet and bile? Ick.


# All 3 data types are handled differently, so if they ever change, this code will break.
# If I'm going to fail, I want to fail early and loudly so let's check it here.
expected_data_type_ids = ['ChemicalContaminant', 'ReferenceInformation', 'Threshold']
if data_type_ids != expected_data_type_ids:
    raise ValueError('Expected {}, got {}'.format(expected_data_type_ids, data_type_ids))

# ChemicalContaminant is a good bit more complicated than the other 2 data types.
# e.g. https://data.chesapeakebay.net/api.json/Toxics/ChemicalContaminant/GeographicalAttributes
geographical_types = util.download_and_jsonify(NAMESPACE, 'ChemicalContaminant',
                                               'GeographicalAttributes')
geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

for geographical_type_id in geographical_type_ids:
    # https://data.chesapeakebay.net/api.json/Toxics/ChemicalContaminant/Fri%20Jan%2006%201995/Sat%20Jan%2001%202000/HUC8/
    attributes = util.download_and_jsonify(NAMESPACE,
                                           'ChemicalContaminant',
                                           DATE_RANGE.start.url_format_for_geographic_type,
                                           DATE_RANGE.end.url_format_for_geographic_type,
                                           geographical_type_id)

    attribute_ids = extract_attribute_ids(geographical_type_id, attributes)

    for attribute_id in attribute_ids:
        for media_type_id in media_type_ids:
            # https://data.chesapeakebay.net/api.JSON/Toxics/ChemicalContaminant/1-6-1995/1-1-2000/HUC8/02050306/SED
            util.download(NAMESPACE,
                          'ChemicalContaminant',
                          DATE_RANGE.start.url_format_for_attribute,
                          DATE_RANGE.end.url_format_for_attribute,
                          geographical_type_id,
                          attribute_id,
                          media_type_id)

# data type Threshold is very simple
for media_type_id in media_type_ids:
    # https://data.chesapeakebay.net/api.JSON/Toxics/Threshold/SED
    util.download(NAMESPACE, 'Threshold', media_type_id)

# data type ReferenceInformation is very simple
# https://data.chesapeakebay.net/api.json/Toxics/ReferenceInformation/References
references = util.download_and_jsonify(NAMESPACE, 'ReferenceInformation', 'References')
reference_ids = [d['REF_DOC_ID'] for d in references]
for reference_id in reference_ids:
    # https://data.chesapeakebay.net/api.JSON/Toxics/ReferenceInformation/R0000209
    util.download(NAMESPACE, 'ReferenceInformation', reference_id)
