import datetime
import collections

#END_DATE = datetime.datetime(2017, 3, 31)
END_DATE = (2017, 3, 31)

DateRange = collections.namedtuple('DateRange', ['start', 'end'])

class WaterQualityDate(datetime.date):
    @property
    def url_format(self):
        """Return m-d-yyyy, e.g. 2-14-2017 for Feb 14th 2017"""
        return '{}-{}-{}'.format(self.month, self.day, self.year)

class LivingResourcesDate(datetime.date):
    @property
    def url_format(self):
        """Return m-d-yyyy, e.g. 2-14-2017 for Feb 14th 2017"""
        return '{}-{}-{}'.format(self.month, self.day, self.year)

class FluorescenceDate(datetime.date):
    @property
    def url_format(self):
        """Return e.g. Tue Feb 14 2017"""
        return self.strftime('%a %b %d %Y')

class PointSourceDate(datetime.date):
    """PointSource makes things difficult by using 2 different date formats"""
    @property
    def url_format_for_geographic_type(self):
        """Return e.g. Tue Feb 14 2017"""
        return self.strftime('%a %b %d %Y')

    @property
    def url_format_for_attribute(self):
        """Return m-d-yyyy, e.g. 2-14-2017 for Feb 14th 2017"""
        return '{}-{}-{}'.format(self.month, self.day, self.year)


DATES = {}
DATES['WaterQualityHistorical'] = DateRange(start=WaterQualityDate(1949, 7, 2),
                                            end=WaterQualityDate(1982, 8, 13))

# "Modern" water quality data begins 16 Jan 1984. This is hardcoded in WaterQuality.js (line 232)
DATES['WaterQualityModern'] = DateRange(start=WaterQualityDate(1984, 1, 16),
                                        end=WaterQualityDate(*END_DATE))

DATES['LivingResources'] = DateRange(start=LivingResourcesDate(1984, 1, 16),
                                     end=LivingResourcesDate(*END_DATE))

# Fluorescence start date hardcoded in Fluorescence.js (line 24).
DATES['Fluorescence'] = DateRange(start=FluorescenceDate(1984, 8, 2),
                                  end=FluorescenceDate(*END_DATE))

# PointSource start date hardcoded in PointSource.js (onChangeStartDateDatePicker(), line 31).
DATES['PointSource'] = DateRange(start=PointSourceDate(1970, 1, 1),
                                 end=PointSourceDate(*END_DATE))

# URL_DATE_TO_FILENAME_MAP maps date range pairs in URL format to the same ranges in ISO (filename)
# format. It's meant to encapsulate date mapping mess so that util.url_to_filename() doesn't have
# to know very much at all about dates.
# The keys are a date range as it would appear in URL format, e.g. 1-16-1984/3-31-2017
# The values are the same date range expressed in filename-friendly format,
# e.g. 1984-01-16_to_2017-03-31.
URL_DATE_TO_FILENAME_MAP = {}
for category in ('WaterQualityHistorical', 'WaterQualityModern', 'LivingResources',
                 'Fluorescence', ):
    url_date = DATES[category].start.url_format + '/' + DATES[category].end.url_format
    URL_DATE_TO_FILENAME_MAP[url_date] = \
        DATES[category].start.isoformat() + '_to_' + DATES[category].end.isoformat()

# PointSource requires special handling.
url_date = DATES['PointSource'].start.url_format_for_geographic_type + '/' + \
           DATES['PointSource'].end.url_format_for_geographic_type
URL_DATE_TO_FILENAME_MAP[url_date] = \
    DATES['PointSource'].start.isoformat() + '_to_' + DATES['PointSource'].end.isoformat()

url_date = DATES['PointSource'].start.url_format_for_attribute + '/' + \
           DATES['PointSource'].end.url_format_for_attribute
URL_DATE_TO_FILENAME_MAP[url_date] = \
    DATES['PointSource'].start.isoformat() + '_to_' + DATES['PointSource'].end.isoformat()



