## Intro

This a set of Python 3 scripts that I (Philip Semanchuk) wrote for the 2017 Chapel Hill Data Rescue event. They download data files from data.chesapeakebay.net. That site includes data going as far back as 1949. Data is still being added as of this writing (December 2017), so this data will never be complete. This initial data capture downloaded all data available up to and including 30 November, 2017. Note that some of the living resources data can't be downloaded (see below).


## REST API

The site provides a REST API (https://data.chesapeakebay.net/API) with pretty good documentation. (There are some quirks detailed below.)

The site also provides a JavaScript-enabled Web interface that mostly follows the API. Studying that site and its JavaScript helped me to understand what the API documentation didn't cover.

## Data Categories

The Web site, the API, and my code divide the data into five categories -- Water Quality, Living Resources, Fluorescence, Point Source, and Toxics. The first two are much bigger than the others.

 - Water Quality - 88516 files
 - Living Resources - 58048 files
 - Fluorescence - 174 files
 - Point Source - 12998 files
 - Toxics - 2397 files


## About the Code (Including How to Run It)

This code was written in Python 3.6 on a Mac. It might run with other Python versions but I haven't tested that. **It doesn't use any external packages.**

The code consists of one script for each category (`water_quality.py`, `toxics.py`, etc.). There's also some library files called `util.py` and `util_date.py`. The latter is especially important because it contains a constant called `END_DATE` that affects all scripts. It defines the end of the date range for which data will be downloaded. (There is no corresponding `START_DATE` constant. The scripts are harcoded to download to ask for data from the earliest date it's available. Sorry if that's inconvenient!)

Last but not least, the file `verify.py` performs two important tasks. First, once all the data is downloaded, it searches each JSON file for a string that indicates that there's a bug in one of my download scripts. (The bug was found and fixed, but it doesn't hurt to double check.) Second, it gzips each JSON file to save space.

An obvious improvement would be to fold the services of `verify.py` into `util.py`.

### Running the Scripts

First, adjust the `END_DATE` in `util_date.py` as described above. Then run each script one at a time from the `tools` directory by just typing `python3 <name_of_script>.py`, for instance --

	python3 fluorescence.py

The water quality script takes 2-3 days to complete if all goes well. Living resources is faster, but still takes a long time. Fluorescence is the shortest, so that's a good one with which to start.

I recommend not running the scripts simultaneously in order to be kind to the Chesapeake Bay Web server. If a script crashes while running due to a network hiccup, simply rerun it. It will pick up where it left off.

Once all the scripts are done, run `verify.py`.

## Useful Files for Debugging

During development, I frequently referred to the source code of the site itself (the HTML and JavaScript). Those files are in the `DataHub` directory.

## Quirks in the Service

### Bug in Living Resources

The living resources section of the site contains a bug when using the following parameters --
 - program id = Tidal Benthic
 - data type = Water Quality
 - geographical type = Station

Other params (start date, project, etc.) don't matter. Attempting to fetch data via the API with those params gives a 500 error. Attempting to fetch data via the Web site returns data in the form of Java stack trace.

I contacted the site owners about this and some other behavior and exchanged a few emails with them, but never got a resolution to this problem.

Needless to say, I can't download this data, and so `living_resources.py` is harcoded to skip this set of parameters.

### POST versus GET

This API breaks REST expectations in a couple of places. My guess is that the site creators originally intended for all resources to be GETable, but found that in some cases that wasn't practical due to the number of parameters they needed to send to the remote server. You don't need to care about this, but if you're interested, look in `water_quality.py` and `living_resources.py` for details.

