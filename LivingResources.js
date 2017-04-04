
var livingResourcesModel = new DataSource({

    onChangeProgramDropDown: function () {
        var model = this;

        model.set("dataTypeValue", "");
        model.set("projectValue", "");
        model.set("geographicalAttributeValue", "");
        model.set("geographicalAttributeMultiSelectionValue", "");
        model.progressBarStart();

        $("#projectContainer").find("i").data("kendoTooltip").options.content = model.get("interfaceText")[model.get("programValue").toString()]["project"];
        $("#projectContainer").find("i").data("kendoTooltip").refresh();

        $("#dataTypeContainer").find("i").data("kendoTooltip").options.content = model.get("interfaceText")[model.get("programValue").toString()]["dataType"];
        $("#dataTypeContainer").find("i").data("kendoTooltip").refresh();

        $("#geographicalAttributeContainer").find("i").data("kendoTooltip").options.content = model.get("interfaceText")[model.get("programValue").toString()]["geographicalAttribute"];
        $("#geographicalAttributeContainer").find("i").data("kendoTooltip").refresh();

        $("#programContainer ~ div").slideUp("fast");
        $.get("api.json/LivingResources/Projects/" + model.get("programValue"), function (response) {
            model.set("projectDropDownSource", response);
        });
        $.get("api.json/LivingResources/DataTypes/" + model.get("programValue"), function (response) {
            model.set("dataTypeDropDownSource", response);
            model.set("progressBarValue", 100);
            $("#dataTypeContainer").show('slow');
        });

    },

    onChangeDataTypeDropDown: function () {
        var model = this;

        $("#dataTypeContainer ~ div").slideUp("fast");
        model.set("projectValue", "");
        model.set("geographicalAttributeValue", "");
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.progressBarStart();

        if (model.get("dataTypeValue") == 'Station') {
            model.set("startDateValue", "");
            model.set("endDateValue", "");
            model.set("progressBarValue", 100);
            $('#geographicalAttributeContainer').show('slow');

        } else {
            model.set("startDateValue", model.get("DEFAULT_START_DATE"));
            model.set("endDateValue", new Date());
            var projectIdList = [];
            model.get("projectDropDownSource").forEach(function (i) {
                projectIdList.push(i.ProjectId);
            });
            var apiURI = API + '.json' + '/' + model.get("sourceValue") + '/' + model.get("programValue") + '/' + model.get("dataTypeValue") + '/' + "ProjectCounts/" + model.get("startDateValue").toDateString() + '/' + model.get("endDateValue").toDateString() + '/1/' + projectIdList.join();
            $.get(apiURI, function (response) {
                model.set("progressBarValue", 100);
                model.set("projectDropDownSource", response);
                $('#dateRangeContainer').show('slow');
                $('#projectContainer').show('slow');
            });
        }

        $.get("api.json/LivingResources/" + model.get("programValue") + "/GeographicalAttributes", function (response) {

            if (model.get("programValue") === "TidalPlankton") {
                model.set("geographicalAttributeDropDownSource", response[model.get("dataTypeValue")]);
            } else {
                model.set("geographicalAttributeDropDownSource", response);
            }
        });

    },

    onChangeStartDateDatePicker: function () {
        var model = this,
            projectIdList = [];
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        if (sDate.getTime() >= eDate.getTime()) {
            $("#divDateAlert").show("slow");
            model._setDefaultValues( "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#attributeSelectionContainer").hide("slow");
            $('#urlContainer').hide('slow');
            $("#projectContainer").hide("slow");
            $('#geographicalAttributeContainer').hide('slow');
        }
        else {
            $("#divDateAlert").hide("slow");
            $("#cbiGeographicalAttributeContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
            $("#dateRangeContainer ~ div").slideUp("fast");
            model.set("projectValue", "");
            model.set("geographicalAttributeValue", "");
            model.set("geographicalAttributeMultiSelectionValue", []);
            model.progressBarStart();

            model.get("projectDropDownSource").forEach(function (i) {
                projectIdList.push(i.ProjectId);
            });
            if (model.get("startDateValue") == null) {
                model.set("startDateValue", model.get("DEFAULT_START_DATE"));
            }
            var apiURI = API + '.json' + '/' + model.get("sourceValue") + '/' + model.get("programValue") + '/' + model.get("dataTypeValue") + '/' + "ProjectCounts/" + model.get("startDateValue").toDateString() + '/' + model.get("endDateValue").toDateString() + '/1/' + projectIdList.join();
            $.get(apiURI, function (response) {
                model.set("progressBarValue", 100);

                model.set("projectDropDownSource", response);

                $('#dateRangeContainer').show('slow');
                $('#projectContainer').show('slow');
            });
        }
    },

    onChangeEndDateDatePicker: function () {
        var model = this,
            projectIdList = [];
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        if (sDate.getTime() >= eDate.getTime()) {
            $("#divDateAlert").show("slow");
            model._setDefaultValues("projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#attributeSelectionContainer").hide("slow");
            $('#urlContainer').hide('slow');
            $("#projectContainer").hide("slow");
            $('#geographicalAttributeContainer').hide('slow');
        }
        else {
            $("#divDateAlert").hide("slow");
            $("#cbiGeographicalAttributeContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
            $("#dateRangeContainer ~ div").slideUp("fast");
            $("#dateRangeContainer ~ div").slideUp("fast");
            model.set("projectValue", "");
            model.set("geographicalAttributeValue", "");
            model.set("geographicalAttributeMultiSelectionValue", []);
            model.progressBarStart();

            model.get("projectDropDownSource").forEach(function (i) {
                projectIdList.push(i.ProjectId);
            });
            if (model.get("endDateValue") == null) {
                model.set("endDateValue", new Date());
            }
            var apiURI = API + '.json' + '/' + model.get("sourceValue") + '/' + model.get("programValue") + '/' + model.get("dataTypeValue") + '/' + "ProjectCounts/" + model.get("startDateValue").toDateString() + '/' + model.get("endDateValue").toDateString() + '/1/' + projectIdList.join();
            $.get(apiURI, function (response) {
                model.set("progressBarValue", 100);

                model.set("projectDropDownSource", response);
                $('#dateRangeContainer').show('slow');
                $('#projectContainer').show('slow');
            });
        }
    },

    onChangeProjectDropDown: function () {
        var model = this;
        $("#geographicalAttributeContainer ~ div").slideUp("fast");
        model.progressBarStart();
        model.set("geographicalAttributeValue", "");
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("progressBarValue", 100);



        $('#geographicalAttributeContainer').show('slow');
    },

    onChangeGeographicaAttributeDropDown: function () {
        var model = this;

        model.progressBarStart();
        $("#geographicalAttributeContainer ~ div").slideUp("fast");
        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        model.set("geographicalAttributeMultiSelectionSource", []);
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("checkboxBrowserDownloadValue", false);
        model.set("radioWrappedValue", false);
        model.set("radioFormatValue", "Tab");
        $("#wrappedRadioContainer").css("visibility", "visible");
        $('#input-api-url').val("");

        $("#wrappedRadioContainer").css("visibility", "visible");
        model.set("radioWrappedValue", false);

        var apiURI = model._createAPIURI(API + '.json', model.get("sourceValue"), model.get("programValue"), model.get("dataTypeValue"), model.get("startDateValue"), model.get("endDateValue"), model.get("projectValue"), model.get("geographicalAttributeValue"));

        $.get(apiURI, function (response) {


            model.set("geographicalAttributeMultiSelectionSource", response);

            model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), 'attributeSelection');

            model.set("progressBarValue", 100);

            $('#attributeSelectionContainer').show('slow');
            $('#formatContainer').show('slow');
            $('#submitButtonContainer').show('slow');
            $('#urlContainer').show('slow');
        });


    },

    _fillGeoMultiSelect: function (response, geoTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            switch (geoTypeSelected) {
                case "Agency":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].DataProviderId,
                        text: response[i].AgencyAcronym + " - " + response[i].AgencyFullName
                    });
                    break;
                case "HUC8":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUCEightId,
                        text: response[i].HUC8 + " - " + response[i].HUC8Description
                    });
                    break;
                case "HUC12":

                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUCTwelveId,
                        text: response[i].HUC12 + " - " + response[i].HUC12Description
                    });
                    break;
                case "FIPS":

                    $multiSelect.multiSelect('addOption', {
                        value: response[i].FIPSStateCountyCodeId,
                        text: response[i].FIPS + " - " + response[i].County_City + " - " + response[i].State
                    });
                    break;
                case "EcoRegion":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].EPALevelFourEcoregionId,
                        text: response[i].EcoRegion + " - " + response[i].EcoRegionDescription
                    });
                    break;
                case "CBSeg2003":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSegment2003Id,
                        text: response[i].CBSegment2003 + " - " + response[i].CBSegment2003Description
                    });
                    break;
                case "SegmentShed2009":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSegmentShed2009Id,
                        text: response[i].CBSegmentShed2009 + " - " + response[i].CBSegmentShed2009_Description
                    });
                    break;
                case "Station":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].MonitoringLocationId,
                        text: response[i].Station + " - " + response[i].StationDescription
                    });
                    break;
            }
        }

    }
});

var model = livingResourcesModel;

$(function () {
    kendo.bind($("#LivingResourcesModel"), livingResourcesModel);
    var model = livingResourcesModel;
    var interfaceInfo = {
        "program": "<p><b>Tidal Plankton Data</b> - The states of Maryland and Virginia, in cooperation with the US EPA Chesapeake Bay Program,have conducted baseline monitoring of the lower trophic levels in the Chesapeake Bay and its tidal tributaries since 1984. These programs are designed to give comprehensive spatial and temporal information on phytoplankton composition and abundance; picoplankton abundance; primary production rates; microzooplankton composition and abundance; and mesozooplankton composition, biomass and abundance.</p><p><b>Tidal Benthic Data</b> - Tidal Benthic Count, Biomass, and Sediment and Bottom Water Analyses Surveys collected at fixed and random sampling stations in the Chesapeake Bay and tidal tributaries since July 1984.</p><p><b>Nontidal Benthic Data</b> - The Chesapeake Bay Program Office (CBPO) has acquired historical and current benthicmacroinvertebrate, habitat, and water quality data for non-tidal streams and wadeable rivers from over 20 federal, state, regional, local, and academic monitoring programs throughout the Chesapeake Bay basin..</p>",
        "TidalPlankton": {
            "dataType": "<p><b>Station Information</b>: contains information related to each of the monitoring stations such as a description of location, latitude and longitude, hydrologic unit (HUC8), and FIPS (state/county).</p><p><b>Monitoring Event</b>: contains information related to sampling events such as weather, total depth, and pycnocline depth(s).</p><p><b>Reported Data</b>: contains project specific plankton component identification and abundance information. </p>",
            "project": "<p><b>Tidal Phytoplankton Monitoring Project</b>: contains identification and abundance information on the plant and some protist components of the plankton. Organisms identified in this data set include diatoms, dinoflagellates,cyanobacteria, and other assorted free living single celled plants greater than 1 micron in size.</p><p><b>Tidal Microzooplankton Monitoring Project</b>: contains identification and abundance information on the animal protist components of the plankton. Organisms identified in this data set include rotifera, tintinnids, sarcodinids and other assorted larval forms. Zooplankton in this category range in size from 200 to 44 microns in size. </p><p><b>Tidal Mesozooplankton Monitoring Project</b>: contains identification and abundance information on animal components of the plankton. Organisms identified in this data set include copepods, larval crustaceans, polychaete and fish, and other assorted free living animals. Zooplankton in this category range from 1 centimeter to 200 microns in size. </p><p><b>Tidal Picoplankton Monitoring Project</b>: contains abundance information on the plant, protist and bacterial components of the plankton. Organisms identified in this data set are single celled microheterotrophs less than 1 micron in size.</p><p><b>Tidal Primary Production Monitoring Project</b>: contains measurement of phytoplankton carbon fixation or primary production.</p>",
            "geographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>Subwatershed (HUC12)</b> - Within each HUC8, there are 12-digit hydrologic units known as subwatersheds that comprise the entire Chesapeake Bay watershed. <a href='http://water.usgs.gov/GIS/huc.html' target='_blank'>more info</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Segment</b> - In 1998, the Chesapeake Bay Program redefined its monitoring segmentation scheme to be based upon salinity regime. The following suffixes are associated with areas based upon salinity levels in parts per thousand (ppt): TF (tidal fresh) - 0.0 to 0.5 ppt, OH (oligohaline) - 0.5 to 5.0 ppt, MH (mesohaline) - 5.0 to 18.0 ppt, PH (polyhaline) - 18.0 to 35.0 ppt</p><p><a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentation_scheme_for_303d_listing_92_segments' target='_blank'>CBP Map</a></p><p><b>Monitoring SegmentShed (SegmentShed2009)</b> - A segmentshed is the discrete land area that drains into each of the 92 Bay Program segments that have TMDLs associated with them.<a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentsheds' target='_blank'>CBP Map</a>.</p><p><b>Monitoring Station</b> - Refers to the text identifier used to denote a CBP monitoring station.<a href='http://www.chesapeakebay.net/documents/3676/map_of_mainstem_and_tributary_monitoring_stations.pdf' target='_blank'>Map of CBP mainstream and tributary long-term monitoring stations</a></p>"
        },
        "TidalBenthic": {
            "dataType": "<p><b>Monitoring Event Data</b>: contains information related to all sampling events where either physical or biological samples were collected. </p><p><b>Sediment Data</b>: contains benthic sediment characterization data.</p><p><b>Biomass Data</b>: contains benthic biota biomass characterization data. </p><p><b>Taxonomic Data</b>: contains benthic taxonomic abundance and composition data. </p><p><b>Water Quality Data</b>: contains benthic water quality characterization data. </p><p><b>Indicator of Benthic Integrity (IBI) Data</b>: The Chesapeake Bay Benthic Index of Biotic Integrity (B-IBI) is a tool for the assessment of the benthic living resource conditions.  These technical indicators are calculated using biological monitoring data and provide an indication of how well the various Living Resources communities respond to environmental stresses.  The IBI metrics are intended to be used primarily to interpret and communicate monitoring results.  IBI values have been calculated only for data from the current Chesapeake Bay Monitoring Program (1984-1999).</p>",
            "project": "<p><b>Tidal Benthic Monitoring Project</b>: includes species abundance and composition counts, biomass determinations, sediment and water quality analyses.</p><p><b>Coastal Bays Benthic Monitoring Project</b>: includes species abundance and composition counts, biomass determinations, sediment and water quality analyses for a 2005 study in the Coastal Bays.</p><p><b>Historic Tidal Benthic Monitoring Project</b>: benthic sampling conducted between 1971 and 1984, prior to the beginning of the EPA Chesapeake Bay Environmental Monitoring Program.</p><p><b>Special Tidal Benthic Monitoring Project</b>: short-term special sampling conducted in tidal waters.</p>",
            "geographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>Subwatershed (HUC12)</b> - Within each HUC8, there are 12-digit hydrologic units known as subwatersheds that comprise the entire Chesapeake Bay watershed. <a href='http://water.usgs.gov/GIS/huc.html' target='_blank'>more info</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Segment</b> - In 1998, the Chesapeake Bay Program redefined its monitoring segmentation scheme to be based upon salinity regime. The following suffixes are associated with areas based upon salinity levels in parts per thousand (ppt): TF (tidal fresh) - 0.0 to 0.5 ppt, OH (oligohaline) - 0.5 to 5.0 ppt, MH (mesohaline) - 5.0 to 18.0 ppt, PH (polyhaline) - 18.0 to 35.0 ppt</p><p><a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentation_scheme_for_303d_listing_92_segments' target='_blank'>CBP Map</a></p><p><b>Monitoring SegmentShed (SegmentShed2009)</b> - A segmentshed is the discrete land area that drains into each of the 92 Bay Program segments that have TMDLs associated with them.<a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentsheds' target='_blank'>CBP Map</a>.</p><p><b>Monitoring Station</b> - Refers to the text identifier used to denote a CBP monitoring station.<a href='http://www.chesapeakebay.net/documents/3676/map_of_mainstem_and_tributary_monitoring_stations.pdf' target='_blank'>Map of CBP mainstream and tributary long-term monitoring stations</a></p>"
        },
        "NontidalBenthic": {
            "dataType": "<p><b>Monitoring Event</b>: contains information related to sampling events such as weather, total depth, pycnocline depth(s), and air temperature.</p><p><b>Habitat Assessment</b>: provides rapid assessments of habitat quality.</p><p><b>Taxonomic Counts</b>: consists of sample enumerations for benthic species composition and abundances.</p><p><b>Water Quality Data</b>: contains ambient measurements of water quality parameters.</p><p><b>Indicators and Calculated Metrics</b>: the Chesapeake Bay basin-wide Benthic Index of Biological Integrity, or “Chessie B-IBI,” is to evaluate macroinvertebrate community health in non-tidal streams and wadeable rivers in a uniform manner and in the context of the entire Chesapeake Bay basin.</p>",
            "project": "<p><b>Nontidal Benthic Monitoring Project</b>: includes taxonomic counts, habitat assessment, and water quality analyses conducted in wadeable nontidal waters in the Chesapeake Bay Watershed.</p>",
            "geographicalAttribute": "<p><b>Agency</b> - The agency code identifies the organization responsible for collecting, processing and providing the data to CBP.</p><p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>Subwatershed (HUC12)</b> - Within each HUC8, there are 12-digit hydrologic units known as subwatersheds that comprise the entire Chesapeake Bay watershed. <a href='http://water.usgs.gov/GIS/huc.html' target='_blank'>more info</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Eco Region</b> - EPA Level IV Ecoregions.<p><a href='ftp://ftp.epa.gov/wed/ecoregions/reg3/reg3_eco.pdf' target='_blank'>EPA Map</a></p></p>"
        },
    };
    //init tooltips
    livingResourcesModel.set("interfaceText", interfaceInfo);
    $("#programContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["program"];
    $("#programContainer").find("i").data("kendoTooltip").refresh();

    $("#living-resources").children().addClass("nav-selected");
    livingResourcesModel.set("sourceValue", "LivingResources");
    livingResourcesModel.set("sourceDropDownSource", sourceDropDownValues);
    $('#attributeSelection').multiSelect({
        afterSelect: function (value) {
            livingResourcesModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = model.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
            livingResourcesModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
        }
    });
    $("#attributeSelectionContainer .multiselect-button").click(function () {
        if (livingResourcesModel.get("geographicalAttributeMultiSelectionValue").length < $("#attributeSelection option").length) {
            livingResourcesModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection option").each(function () {
                livingResourcesModel.get("geographicalAttributeMultiSelectionValue").push($(this).val());
            });
            $("#attributeSelection").multiSelect("select_all");
        } else {
            livingResourcesModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection").multiSelect("deselect_all");
        }
    });
    $.get('api.json/LivingResources/Programs', function (response) {
        livingResourcesModel.set("programDropDownSource", response);
    });
});