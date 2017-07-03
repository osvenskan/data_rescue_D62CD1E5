
var toxicsModel = new DataSource({

    onChangeStartDateDatePicker: function () {
        var model = this;
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        var pSandToxicStartDate = new Date("1/1/1970");

        if (sDate.getTime() < pSandToxicStartDate) {
            $("#divStartDateAlertPSandToxic").show("slow");
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
            $('#mediaTypeSelectionContainer').hide('slow');
        }
        else if (sDate.getTime() >= eDate.getTime()) {
            $("#divStartDateAlertPSandToxic").hide("slow");
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
            $('#mediaTypeSelectionContainer').hide('slow');
            
        }
        else {
            $("#divStartDateAlertPSandToxic").hide("slow");
            $("#divDateAlert").hide("slow");
            if (model.get("startDateValue") == null) {
                model.set("startDateValue", model.get("DEFAULT_START_DATE"));
            }
            model.set("geographicalAttributeValue", "");
            $("#dateRangeContainer ~ div").slideUp("fast");
            $("#geographicalAttributeContainer").show("slow");
        }
    },

    onChangeEndDateDatePicker: function () {
        var model = this;
        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        var pSandToxicStartDate = new Date("1/1/1970");
        if (sDate.getTime() < pSandToxicStartDate) {
            $("#divStartDateAlertPSandToxic").show("slow");
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
            $('#mediaTypeSelectionContainer').hide('slow');
        }
        else if (sDate.getTime() >= eDate.getTime()) {
            $("#divStartDateAlertPSandToxic").hide("slow");
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
            $('#mediaTypeSelectionContainer').hide('slow');
        }
        else {
            $("#divDateAlert").hide("slow");
            $("#divStartDateAlertPSandToxic").hide("slow");
            if (model.get("endDateValue") == null) {
                model.set("endDateValue", new Date());
            }

            model.set("geographicalAttributeValue", "");
            $("#dateRangeContainer ~ div").slideUp("fast");

            $("#geographicalAttributeContainer").show("slow");
        }
    },

    onChangeDataTypeDropDown: function (e) {
        var model = this;

        model.progressBarStart();

        model.set("startDateValue", "");
        model.set("endDateValue", "");
        model.set("radioChemicalByValue", "");
        model.set("geographicalAttributeValue", "");
        model.set("radioFormatValue", "Tab");
        $("#wrappedRadioContainer").css("visibility", "visible");
        model.set("radioWrappedValue", false);

        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');

        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("geographicalAttributeMultiSelectionSource", []);

        $("#mediaTypeSelection").multiSelect('deselect_all');
        $("#mediaTypeSelection").multiSelect('refresh');
        model.set("mediaTypeMultiSelectionValue", []);

        $("#referenceSelection").html('');
        $("#referenceSelection").multiSelect('refresh');

        model.set("referenceMultiSelectionValue", []);
        model.set("referenceMultiSelectionSource", []);

        $("#dataTypeContainer ~ div").slideUp("fast");
        switch (model.get("dataTypeValue")) {
            case "ChemicalContaminant":
                var toxicsDate = new Date(2000, 0, 1);
                model.set("startDateValue", new Date(toxicsDate.getYear() - 5, toxicsDate.getMonth(), toxicsDate.getDay()));
                model.set("endDateValue", toxicsDate);
                model.set("progressBarValue", 100);
                $("#dateRangeContainer").show("slow");
                $("#geographicalAttributeContainer").show("slow");
                break;
            case "Threshold":
                model.set("progressBarValue", 100);
                $("#mediaTypeSelectionContainer").show("slow");
                $("#formatContainer").show("slow");
                $("#submitButtonContainer").show("slow");
                $("#urlContainer").show("slow");
                break;
            case "ReferenceInformation":
                $.get("api.json/Toxics/ReferenceInformation/References", function (response) {


                    model.set("referenceMultiSelectionSource", response);
                    model._fillReferenceMultiSelect(response, "referenceSelection");
                    model.set("progressBarValue", 100);
                    $("#referenceSelectionContainer").show("slow");
                    $("#formatContainer").show("slow");
                    $("#submitButtonContainer").show("slow");
                    $("#urlContainer").show("slow");
                });

                break;
        }
    },

    onChangeGeographicaAttributeDropDown: function (e) {
        var model = this,
            geographicalAttributeListURI = model._createAPIURI(API + ".json", model.get("sourceValue"), model.get("dataTypeValue"), model.get("startDateValue"), model.get("endDateValue"), model.get("geographicalAttributeValue"));


        model.progressBarStart();

        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("radioFormatValue", "Tab");
        $("#wrappedRadioContainer").css("visibility", "visible");
        model.set("radioWrappedValue", false);
        //$("#mediaTypeSelection").html('');
        $("#mediaTypeSelection").multiSelect('deselect_all');
        $("#mediaTypeSelection").multiSelect('refresh');

        model.set("mediaTypeMultiSelectionValue", []);

        $("#geographicalAttributeContainer ~ div").slideUp("fast");

        $.get(geographicalAttributeListURI, function (response) {


            model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue"), "attributeSelection");

            $("#attributeSelectionContainer").show("slow");
            $("#mediaTypeSelectionContainer").show("slow");
            model.set("progressBarValue", 100);
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $("#urlContainer").show("slow");
        });
    },

    _fillGeoMultiSelect: function (response, geoTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            switch (geoTypeSelected) {
                case "HUC8":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUC8,
                        text: response[i].HUC8 + " - " + response[i].DESCRIPTION
                    });
                    break;
                case "FIPS":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].FIPS,
                        text: response[i].FIPS + " - " + response[i].NAME + " - " + response[i].STATE
                    });
                    break;
                case "CBSeg":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSEG_1985,
                        text: response[i].CBSEG_1985 + " - " + response[i].DESCRIPTION
                    });
                    break;
                case "CBPBasin":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].BASIN,
                        text: response[i].BASIN + " - " + response[i].CBP_BASIN
                    });
                    break;
            }
        }

    },

    _fillReferenceMultiSelect: function (response, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            $multiSelect.multiSelect('addOption', {
                value: response[i].REF_DOC_ID,
                text: response[i].REF_DOC_ID + " - " + response[i].TITLE
            });
        }
    },

    _fillMediaTypeMultiSelect: function (response, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            $multiSelect.multiSelect('addOption', {
                value: response[i].MEDIA_TYPE,
                text: response[i].MEDIA_SUB_TYPE + " - " + response[i].DESCRIPTION
            });
        }
    },

    _fillChemicalsMultiSelect: function (response, chemicalTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            switch (chemicalTypeSelected) {
                case "ChemicalClass":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CHEMICAL_CLASS,
                        text: response[i].CHEMICAL_CLASS + " - " + response[i].DESCRIPTION
                    });
                    break;
                case "ChemicalName":
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CAS_NUMBER,
                        text: response[i].CHEMICAL
                    });
                    break;
            }
        }
    }
});

var model = toxicsModel;

$(function () {

    kendo.bind($("#ToxicsModel"), toxicsModel);
    var interfaceInfo = {
        "dataType": "<p><b>Chemical Contaminant</b> - measured chemical contaminant concentations in water, fish tissue, or sediment.</p><p><b>Threshold</b> - a list of criteria, standards, and thresholds that the Chesapeake Bay Program uses to interpret chemical concentration data.</p><p><b>Reference</b> - the publication source of the data. When downloading Chemical Contaminant or Threshold data, the REF_DOC_ID field relates to the reference information for the study.</p>",
        "geographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Segment</b> - In 1998, the Chesapeake Bay Program redefined its monitoring segmentation scheme to be based upon salinity regime. The following suffixes are associated with areas based upon salinity levels in parts per thousand (ppt): TF (tidal fresh) - 0.0 to 0.5 ppt, OH (oligohaline) - 0.5 to 5.0 ppt, MH (mesohaline) - 5.0 to 18.0 ppt, PH (polyhaline) - 18.0 to 35.0 ppt</p><p><a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentation_scheme_for_303d_listing_92_segments' target='_blank'>CBP Map</a></p><p>"
    }
    //init tooltips
    toxicsModel.set("interfaceText", interfaceInfo);

    $("#dataTypeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["dataType"];
    $("#dataTypeContainer").find("i").data("kendoTooltip").refresh();

    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["geographicalAttribute"];
    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").refresh();

    $("#dataTypeContainer").css("display", "");
    $("#toxics").children().addClass("nav-selected");

    toxicsModel.set("sourceDropDownSource", sourceDropDownValues);
    toxicsModel.set("sourceValue", "Toxics");

    $("#attributeSelection").multiSelect({
        afterSelect: function (value) {
            toxicsModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = toxicsModel.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
            toxicsModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
        }
    });

    $("#attributeSelectionContainer .multiselect-button").click(function () {
        if (toxicsModel.get("geographicalAttributeMultiSelectionValue").length < $("#attributeSelection option").length) {
            toxicsModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection option").each(function () {
                toxicsModel.get("geographicalAttributeMultiSelectionValue").push($(this).val());
            });
            $("#attributeSelection").multiSelect("select_all");

        } else {
            toxicsModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection").multiSelect("deselect_all");
        }
    });

    $("#mediaTypeSelection").multiSelect({
        afterSelect: function (value) {
            toxicsModel.get("mediaTypeMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = toxicsModel.get("mediaTypeMultiSelectionValue").indexOf(value[0]);
            toxicsModel.get("mediaTypeMultiSelectionValue").splice(tempIndex, 1);
        }
    });

    $("#mediaTypeSelectionContainer .multiselect-button").click(function () {
        if (toxicsModel.get("mediaTypeMultiSelectionValue").length < $("#mediaTypeSelection option").length) {
            toxicsModel.set("mediaTypeMultiSelectionValue", []);
            $("#mediaTypeSelection option").each(function () {
                toxicsModel.get("mediaTypeMultiSelectionValue").push($(this).val());
            });
            $("#mediaTypeSelection").multiSelect("select_all");

        } else {
            toxicsModel.set("mediaTypeMultiSelectionValue", []);
            $("#mediaTypeSelection").multiSelect("deselect_all");
        }
    });


    $("#referenceSelection").multiSelect({
        afterSelect: function (value) {
            toxicsModel.get("referenceMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = toxicsModel.get("referenceMultiSelectionValue").indexOf(value[0]);
            toxicsModel.get("referenceMultiSelectionValue").splice(tempIndex, 1);
        }
    });

    $("#referenceSelectionContainer .multiselect-button").click(function () {
        if (toxicsModel.get("referenceMultiSelectionValue").length < $("#referenceSelection option").length) {
            toxicsModel.set("referenceMultiSelectionValue", []);
            $("#referenceSelection option").each(function () {
                toxicsModel.get("referenceMultiSelectionValue").push($(this).val());
            });
            $("#referenceSelection").multiSelect("select_all");

        } else {
            toxicsModel.set("referenceMultiSelectionValue", []);
            $("#referenceSelection").multiSelect("deselect_all");
        }
    });

    $.get('api.json/Toxics/DataTypes', function (response) {
        toxicsModel.set("dataTypeDropDownSource", response);
    });

    $.get('api.json/Toxics/ChemicalContaminant/GeographicalAttributes', function (response) {
        toxicsModel.set("geographicalAttributeDropDownSource", response);
    });

    $.get('api.json/Toxics/MediaTypes', function (response) {
        toxicsModel._fillMediaTypeMultiSelect(response, "mediaTypeSelection");
        toxicsModel.set("mediaTypeMultiSelectionSource", response);
    });
});