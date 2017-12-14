import unittest
import datetime

import util
from util_date import END_DATE

end_date = datetime.date(*END_DATE)

END_DATE_MM_DD_YYYY = '{}-{}-{}'.format(end_date.month, end_date.day, end_date.year)
END_DATE_ISO = end_date.isoformat()
END_DATE_CTIME = end_date.ctime().replace('00:00:00 ', '')


class TestUrlToFilename(unittest.TestCase):
    """Exercise util.url_to_filename()"""
    def test_url_to_filename(self):
        pairs = \
            [
             # HTTP
             ('http://data.chesapeakebay.net/api.json/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # HTTPS
             ('https://data.chesapeakebay.net/api.json/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # Schemeless
             ('data.chesapeakebay.net/api.json/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # Schemeless & domainless
             ('/api.json/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # Uppercase JSON
             ('/api.JSON/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # Path only
             ('/LivingResources/TidalPlankton/Station/HUC8/20',
              '../data/LivingResources/TidalPlankton/Station/HUC8/20.json'),

             # Historical date range
             ('/WaterQuality/CBI/7-2-1949/8-13-1982/2/12/HUC8/4/30',
              '../data/WaterQuality/CBI/1949-07-02_to_1982-08-13/2/12/HUC8/4/30.json'),

             # Modern date range
             ('/WaterQuality/WaterQuality/1-16-1984/{}/2/12/HUC8/4/30'.format(END_DATE_MM_DD_YYYY),
              '../data/WaterQuality/WaterQuality/1984-01-16_to_{}/2/12/HUC8/4/30.json'.format(END_DATE_ISO)),

             # Fluorescence date range
             ('/Fluorescence/Vertical/Thu Aug 02 1984/{}/HUC8/02060002'.format(END_DATE_CTIME),
              '../data/Fluorescence/Vertical/1984-08-02_to_{}/HUC8/02060002.json'.format(END_DATE_ISO)),

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
