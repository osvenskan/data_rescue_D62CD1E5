import unittest
import datetime

import util

class TestUrlToFilename(unittest.TestCase):
    """Exercise util.url_to_filename()"""
    def test_url_to_filename(self):
        pairs = \
            [
             # HTTP
             ('http://data.chesapeakebay.net/api.json/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # HTTPS
             ('https://data.chesapeakebay.net/api.json/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Schemeless
             ('data.chesapeakebay.net/api.json/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Schemeless & domainless
             ('/api.json/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Schemeless & domainless
             ('/api.json/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Uppercase JSON
             ('/api.JSON/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Path only
             ('/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Historical date range
             ('/WaterQuality/CBI/7-2-1949/8-13-1982/2/12/HUC8/4/30',
              '../data/WaterQuality/CBI/1949-07-02_to_1982-08-13/2/12/HUC8/4/30.json'),

             # Modern date range already tested above buts lets test again anyway
             ('/WaterQuality/WaterQuality/1-16-1984/3-31-2017/2/12/HUC8/4/30',
              '../data/WaterQuality/WaterQuality/1984-01-16_to_2017-03-31/2/12/HUC8/4/30.json'),

             # Fluorescence date range
             ('/Fluorescence/Vertical/8-2-1984/3-31-2017/HUC8/02060002',
              '../data/Fluorescence/Vertical/1984-08-02_to_2017-03-31/HUC8/02060002.json'),

             # Short URL
             ('/WaterQuality/DataTypes',
              '../data/WaterQuality/DataTypes.json'),

             # Another shorty
             ('/WaterQuality/CBI/7-2-1949/8-13-1982/FIPS',
              '../data/WaterQuality/CBI/1949-07-02_to_1982-08-13/FIPS.json'),
             ]
        for url, expected_filename in pairs:
            with self.subTest(url=url, expected_filename=expected_filename):
                self.assertEqual(util.url_to_filename(url), expected_filename)
