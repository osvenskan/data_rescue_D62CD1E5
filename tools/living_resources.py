#!/usr/bin/env python

# Python imports
import collections

# Project imports
import util
import util_date

NAMESPACE = 'LivingResources'

DATE_RANGE = util_date.DATES[NAMESPACE]

"""
LivingResources data has 3 top-level categories (programs) -- Tidal Plankton Data, Tidal Benthic
Data, and Nontidal Benthic Data.
"""

# https://data.chesapeakebay.net/api.json/LivingResources/Programs
programs = util.download_and_jsonify(NAMESPACE, 'Programs')
program_ids = sorted([d['ProgramId'] for d in programs])
# [{
#     "ProgramId": "TidalPlankton",
#     "ProgramIdentifier": "TPD",
#     "ProgramName": "Tidal Plankton Data"
# }, {
#     "ProgramId": "TidalBenthic",
#     "ProgramIdentifier": "TBD",
#     "ProgramName": "Tidal Benthic Data"
# }, {
#     "ProgramId": "NontidalBenthic",
#     "ProgramIdentifier": "NBD",
#     "ProgramName": "Nontidal Benthic Data"
# }]

# Each of the 3 programs requires some study to understand and download properly. I doubt
# they'll add/delete/change programs, but if they do, this code might break. That being the case, I
# check here to ensure that the programs are what I expect them to be, and fail loudly if not.
expected_program_ids = sorted(('TidalPlankton', 'TidalBenthic', 'NontidalBenthic'))
if program_ids != expected_program_ids:
    print('Received programs: ' + ', '.join(program_ids))
    print('Expected programs: ' + ', '.join(expected_program_ids))
    raise ValueError('Unexpected or missing program(s)')

# Each of the 3 programs has a number of different data types. They all behave the same, except
# for /TidalPlankton/Station which requires special handling. I handle it here.

# https://data.chesapeakebay.net/api.json/LivingResources/TidalPlankton/GeographicalAttributes
geographical_types = util.download_and_jsonify(NAMESPACE, 'TidalPlankton', 'GeographicalAttributes')
# The last two elements of the DataTypes URL seem backwards to me but that's what they are.
# https://data.chesapeakebay.net/api.json/LivingResources/DataTypes/TidalPlankton
data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes', 'TidalPlankton')
data_type_ids = [d['DataTypeId'] for d in data_types]

# For TidalPlankton, geographical_types is a dicts of lists keyed by data type. Simplify.
# ref: LivingResources.js (line 67)
temp_geographical_types = collections.defaultdict(list)
for data_type_id in data_type_ids:
    temp_geographical_types[data_type_id] = [d['GeoTypeId'] for
                                             d in geographical_types[data_type_id]]
geographical_types = temp_geographical_types

# geographical_types is now a dict like this --
#     {'MonitorEvent': ['HUC8', 'HUC12', 'FIPS', 'CBSeg2003', 'Station'],
#      'Reported': ['HUC8', 'HUC12', 'FIPS', 'CBSeg2003', 'Station'],
#      'Station': ['HUC8', 'HUC12', 'FIPS', 'CBSeg2003', 'SegmentShed2009', 'Station']}

# First handle program == TidalPlankton, geo type == Station
for geographical_type_id in geographical_types['Station']:
    attributes = util.download_and_jsonify(NAMESPACE, 'TidalPlankton', 'Station',
                                           geographical_type_id)
    attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)
    attribute_ids = map(str, attribute_ids)
    if geographical_type_id == 'FIPS':
        # FIPS works differently than other geo types (why?) and requires POSTing data rather
        # than simple GETs.
        for attribute_id in attribute_ids:
            # e.g. https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/Station/FIPS
            util.post_single_attribute_id(attribute_id, NAMESPACE, 'TidalPlankton', 'Station',
                                          geographical_type_id)
    else:
        # e.g. https://data.chesapeakebay.net/api.json/LivingResources/TidalPlankton/Station/HUC8/
        for attribute_id in attribute_ids:
            # e.g. https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/Station/HUC8/20
            util.download(NAMESPACE, 'TidalPlankton', 'Station', geographical_type_id, attribute_id)


# Remove Station since it was handled above
data_type_ids = [data_type_id for data_type_id in data_type_ids if data_type_id != 'Station']

# https://data.chesapeakebay.net/api.json/LivingResources/Projects/TidalPlankton
projects = util.download_and_jsonify(NAMESPACE, 'Projects', 'TidalPlankton')
project_ids = [str(d['ProjectId']) for d in projects]

# At this point, data_type_ids should be just ('MonitorEvent', 'Reported')
for data_type_id in data_type_ids:
    for project_id in project_ids:
        for geographical_type_id in geographical_types[data_type_id]:
            # e.g. https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/MonitorEvent/1-16-1984/4-4-2017/9/HUC12
            attributes = util.download_and_jsonify(NAMESPACE,
                                                   'TidalPlankton',
                                                   data_type_id,
                                                   DATE_RANGE.start.url_format,
                                                   DATE_RANGE.end.url_format,
                                                   project_id,
                                                   geographical_type_id)
            attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)
            attribute_ids = map(str, attribute_ids)

            for attribute_id in attribute_ids:
                # e.g. https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/MonitorEvent/1-16-1984/4-4-2017/9/HUC12/767
                util.download(NAMESPACE,
                              'TidalPlankton',
                              data_type_id,
                              DATE_RANGE.start.url_format,
                              DATE_RANGE.end.url_format,
                              project_id,
                              geographical_type_id,
                              attribute_id)

# OK, that takes care of all 3 TidalPlankton data types. Remove TidalPlankton since it's been
# handled.
program_ids = [program_id for program_id in program_ids if program_id != 'TidalPlankton']
# And now for the remaining programs. At this point, program_ids should be just this --
#    ('NontidalBenthic', 'TidalBenthic')
for program_id in program_ids:
    print('Starting program {}...'.format(program_id))
    # e.g. https://data.chesapeakebay.net/api.json/LivingResources/DataTypes/TidalBenthic
    data_types = util.download_and_jsonify(NAMESPACE, 'DataTypes', program_id)
    data_type_ids = [d['DataTypeId'] for d in data_types]

    # e.g. https://data.chesapeakebay.net/api.json/LivingResources/NontidalBenthic/GeographicalAttributes
    geographical_types = util.download_and_jsonify(NAMESPACE, program_id, 'GeographicalAttributes')
    geographical_type_ids = [d['GeoTypeId'] for d in geographical_types]

    for data_type_id in data_type_ids:
        print('Starting program {}, data type {}...'.format(program_id, data_type_id))
        # e.g. https://data.chesapeakebay.net/api.json/LivingResources/Projects/TidalBenthic
        projects = util.download_and_jsonify(NAMESPACE, 'Projects', program_id)
        project_ids = [str(d['ProjectId']) for d in projects]
        for project_id in project_ids:
            params = (program_id, data_type_id, project_id)
            print('Starting program {}, data type {}, project {}...'.format(*params))
            for geographical_type_id in geographical_type_ids:
                params = (program_id, data_type_id, project_id, geographical_type_id)
                print('Starting program {}, data type {}, project {}, geo type {}...'.format(*params))
                # geographical_type_id is something like HUC8, FIPS, etc.
                # https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/MonitorEvent/4-4-2012/4-4-2017/17/HUC12
                attributes = util.download_and_jsonify(NAMESPACE,
                                                       program_id,
                                                       data_type_id,
                                                       DATE_RANGE.start.url_format,
                                                       DATE_RANGE.end.url_format,
                                                       project_id,
                                                       geographical_type_id)
                attribute_ids = util.extract_attribute_ids(geographical_type_id, attributes)
                attribute_ids = map(str, attribute_ids)

                for attribute_id in attribute_ids:
                    if (NAMESPACE == 'LivingResources') and (program_id == 'TidalBenthic') and \
                       (data_type_id == 'WaterQuality') and (geographical_type_id == 'Station'):
                        # This is broken on the server side, skip for now.
                        pass
                    else:
                        # e.g. https://data.chesapeakebay.net/api.JSON/LivingResources/TidalPlankton/MonitorEvent/4-4-2012/4-4-2017/17/HUC12/781
                        util.download(NAMESPACE,
                                      program_id,
                                      data_type_id,
                                      DATE_RANGE.start.url_format,
                                      DATE_RANGE.end.url_format,
                                      project_id,
                                      geographical_type_id,
                                      attribute_id)
