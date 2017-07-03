
var fluorescenceModel = new DataSource({

    onChangeDataTypeDropDown: function (e) {
        var model = this;
        model.progressBarStart();

        model.set("geographicalAttributeValue", "");
        model.set("geographicalAttributeMultiSelectionValue", "");

        $("#dataTypeContainer ~ div").slideUp("fast");

        model.set("startDateValue", model.get("DEFAULT_START_DATE"));
        model.set("endDateValue", new Date());
        model.set("progressBarValue", 100);
        $("#dateRangeContainer").show("slow");
        $("#geographicalAttributeContainer").show("slow");
    },

    onChangeStartDateDatePicker: function (e) {
        var model = this;
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        var fluorescenceStartDate = new Date("8/2/1984");
        if (sDate.getTime() < fluorescenceStartDate) {
            $("#divStartDateAlertFluorescence").show("slow");
            $("#divDateAlert").hide("slow");
            model._setDefaultValues("programValue", "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#programContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#attributeSelectionContainer").hide("slow");
            $('#urlContainer').hide('slow');
            $("#projectContainer").hide("slow");
            $('#geographicalAttributeContainer').hide('slow');
        }
        else if (sDate.getTime() >= eDate.getTime()) {
            $("#divStartDateAlertFluorescence").hide("slow");
            $("#divDateAlert").show("slow");
            model._setDefaultValues("programValue", "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#programContainer").hide("slow");
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
            $("#divStartDateAlertFluorescence").hide("slow");
            $("#divDateAlert").hide("slow");
            if (model.get("startDateValue") == null) {
                model.set("startDateValue", model.get("DEFAULT_START_DATE"));
            }
            model.set("geographicalAttributeValue", "");
            $("#dateRangeContainer ~ div").slideUp("fast");

            $("#geographicalAttributeContainer").show("slow");
        }
    },

    onChangeEndDateDatePicker: function (e) {
        var model = this;

       
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        if (sDate.getTime() < fluorescenceStartDate) {
            $("#divStartDateAlertFluorescence").show("slow");
            $("#divDateAlert").hide("slow");
            model._setDefaultValues("programValue", "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#programContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#formatContainer").hide("slow");
            $("#submitButtonContainer").hide("slow");
            $("#attributeSelectionContainer").hide("slow");
            $('#urlContainer').hide('slow');
            $("#projectContainer").hide("slow");
            $('#geographicalAttributeContainer').hide('slow');
        }
        else if (sDate.getTime() >= eDate.getTime()) {
            $("#divStartDateAlertFluorescence").hide("slow");
            $("#divDateAlert").show("slow");
            model._setDefaultValues("programValue", "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
            $('#input-api-url').val("");
            $("#cbiGeographicalAttributeContainer").hide("slow");
            $("#programContainer").hide("slow");
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
            if (model.get("endDateValue") == null) {
                model.set("endDateValue", new Date());
            }
            $("#divStartDateAlertFluorescence").hide("slow");
            $("#divDateAlert").hide("slow");
            model.set("geographicalAttributeValue", "");
            $("#dateRangeContainer ~ div").slideUp("fast");
            $("#geographicalAttributeContainer").show("slow");
        }
    },

    onChangeGeographicaAttributeDropDown: function (e) {
        var model = this;

        model.progressBarStart();

        $("#geographicalAttributeContainer ~ div").slideUp("fast");


        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("radioFormatValue", "Tab");

        var apiURI = model._createAPIURI(API + '.json', model.get("sourceValue"), model.get("dataTypeValue"), model.get("startDateValue"), model.get("endDateValue"), model.get("geographicalAttributeValue"));

        $.get(apiURI, function (response) {
            model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), "attributeSelection");
            model.set("progressBarValue", 100);
            $("#attributeSelectionContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
        });
    },

    _fillGeoMultiSelect: function (response, geoTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            switch (geoTypeSelected) {
                case "HUC8":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUC8.trim(),
                        text: response[i].HUC8 + " - " + response[i].HUC8Description
                    });
                    break;
                case "FIPS":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].FIPS.trim(),
                        text: response[i].FIPS + " - " + response[i].County_City + " - " + response[i].State
                    });
                    break;
                case "CBSeg2003":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSegment2003.trim(),
                        text: response[i].CBSegment2003 + " - " + response[i].CBSegment2003Description
                    });
                    break;
            }
        }
    },
});

var model = fluorescenceModel;

$(function () {
    kendo.bind($("#FluorescenceModel"), fluorescenceModel);

    var interfaceInfo = {
        "dataType": "<p><b>Horizontal Fluorescence Data</b> - contains measurements of chlorophyll-a recorded at fixed intervals between monitoring stations at 0.5m depth.</p><p><b>Vertical Fluorescence Data</b> - contains measurements of chlorophyll-a recorded for the water column at fixed stations.</p>",
        "geographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Segment</b> - In 1998, the Chesapeake Bay Program redefined its monitoring segmentation scheme to be based upon salinity regime. The following suffixes are associated with areas based upon salinity levels in parts per thousand (ppt): TF (tidal fresh) - 0.0 to 0.5 ppt, OH (oligohaline) - 0.5 to 5.0 ppt, MH (mesohaline) - 5.0 to 18.0 ppt, PH (polyhaline) - 18.0 to 35.0 ppt</p><p><a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentation_scheme_for_303d_listing_92_segments' target='_blank'>CBP Map</a></p><p>"
    };

    //init tooltips
    fluorescenceModel.set("interfaceText", interfaceInfo);

    $("#dataTypeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["dataType"];
    $("#dataTypeContainer").find("i").data("kendoTooltip").refresh();

    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["geographicalAttribute"];
    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").refresh();

    //override default display for dataType model
    $("#dataTypeContainer").css("display", "");

    //set navigation active
    $("#fluorescence").children().addClass("nav-selected");

    //
    fluorescenceModel.set("sourceDropDownSource", sourceDropDownValues);
    fluorescenceModel.set("sourceValue", "Fluorescence");

    $("#attributeSelection").multiSelect({
        afterSelect: function (value) {
            fluorescenceModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = fluorescenceModel.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
            fluorescenceModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
        }
    });

    $("#attributeSelectionContainer .multiselect-button").click(function () {
        if (fluorescenceModel.get("geographicalAttributeMultiSelectionValue").length < $("#attributeSelection option").length) {
            fluorescenceModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection option").each(function () {
                fluorescenceModel.get("geographicalAttributeMultiSelectionValue").push($(this).val());
            });
            $("#attributeSelection").multiSelect("select_all");

        } else {
            fluorescenceModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection").multiSelect("deselect_all");
        }
    });

    $.get('api.json/Fluorescence/DataTypes', function (response) {
        fluorescenceModel.set("dataTypeDropDownSource", response);
    });
    $.get("api.json/Fluorescence/GeographicalAttributes", function (response) {
        fluorescenceModel.set("geographicalAttributeDropDownSource", response);

    });

});