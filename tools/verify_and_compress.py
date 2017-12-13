#!/usr/bin/env python

'''This utility verifies that each file downloaded is valid JSON and that none contain a
specific known error string. It also compresses (gzips) each file to save space.
'''

import os
import json
import time
import gzip

n_files = 0

# POST_FAIL_MSG contains the magic string that I find in the JSON if I've attempted a GET
# where a POST is required.
POST_FAIL_MSG = '''{"Message":"The requested resource does not support http method 'GET'."}'''

# DATA_DIRECTORIES is ordered from smallest to largest to give the user a better sense of progress
DATA_DIRECTORIES = ('Fluorescence', 'Toxics', 'PointSource', 'LivingResources', 'WaterQuality', )

for data_directory in DATA_DIRECTORIES:
    print('Working on {}...'.format(data_directory))
    base_path = os.path.join('../data', data_directory)
    for dirpath, dirnames, filenames in os.walk(base_path):
        for filename in filenames:
            if filename.endswith('.json'):
                # JSON files need to be verified and compressed.
                filename = os.path.join(dirpath, filename)

                with open(filename, 'rb') as f:
                    data = f.read()

                # Verify that it's valid JSON
                content = json.loads(data)

                # Ensure the content isn't just a failure message.
                assert(content != POST_FAIL_MSG)

                # Compress original and write to disk
                with gzip.open(filename + '.gz', 'wb') as f:
                    f.write(data)

                # remove .json file
                os.remove(filename)

                n_files += 1
                if n_files % 10 == 0:
                    print('Verified and compressed {} files so far...'.format(n_files))

                time.sleep(0.001)
            # else:
            #     This file has already been verified and compressed or it isn't JSON data.
