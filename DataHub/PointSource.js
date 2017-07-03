
var nutrientPointSourceModel = new DataSource({

    onChangeDataTypeDropDown: function (e) {
        var model = this;
        model.progressBarStart();

        $("#dataTypeContainer ~ div").slideUp("fast");

        model.set("startDateValue", "");
        model.set("endDateValue", "");
        model.set("geographicalAttributeValue", "");
        model.set("geographicalAttributeMultiSelectionValue", []);
        model.set("radioFormatValue", "Tab");
        $("#wrappedRadioContainer").css("visibility", "visible");
        model.set("radioWrappedValue", false);

        if (model.get("dataTypeValue") == "LoadData") {
            model.set("startDateValue", model.get("DEFAULT_START_DATE"));
            model.set("endDateValue", new Date());
            $("#dateRangeContainer").show("slow");
        }
        model.set("progressBarValue", 100);
        $("#geographicalAttributeContainer").show("slow");
    },

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
        }
        else {
            $("#divStartDateAlertPSandToxic").hide("slow");
            $("#divDateAlert").hide("slow");
            if (model.get("endDateValue") == null) {
                model.set("endDateValue", new Date());
            }
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
        $("#wrappedRadioContainer").css("visibility", "visible");
        model.set("radioWrappedValue", false);

        if (model.get("dataTypeValue") == "FacilityInformation") {
            var apiUri = model._createAPIURI(API + '.json', model.get("sourceValue"), model.get("dataTypeValue"), model.get("geographicalAttributeValue"));

            $.get(apiUri, function (response) {
                model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue"), "attributeSelection");
                model.set("progressBarValue", 100);
                $("#attributeSelectionContainer").show("slow");
                $("#formatContainer").show("slow");
                $("#submitButtonContainer").show("slow");
                $('#urlContainer').show('slow');
            });
        } else {
            var apiUri = model._createAPIURI(API + '.JSON', model.get("sourceValue"), model.get("dataTypeValue"), model.get("startDateValue"), model.get("endDateValue"), model.get("geographicalAttributeValue"));

            $.get(apiUri, function (response) {

                model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), "attributeSelection");
                model.set("progressBarValue", 100);
                $("#attributeSelectionContainer").show("slow");
                $("#formatContainer").show("slow");
                $("#submitButtonContainer").show("slow");
                $('#urlContainer').show('slow');
            });
        }
    },

    _fillGeoMultiSelect: function (response, geoTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        switch (geoTypeSelected) {
            case "FIPS":
                for (var i in response) {
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].FIPS.trim(),
                        text: response[i].FIPS + " - " + response[i].County_City + " - " + response[i].State
                    });
                }
                break;
            case "State":
                for (var i in response) {
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].State.trim(),
                        text: response[i].State + " - " + response[i].NAME
                    });
                }
                break;
            case "Facility":
                var optionsList = "";
                for (var i in response) {
                    optionsList += "<option value=\"" + response[i].NPDES.trim() + "\">" + response[i].NPDES + " - " + response[i].FACILITY + "</option>";
                }
                $("#attributeSelection").html(optionsList);
                $multiSelect.multiSelect('refresh');

                break;
        }

    },
});

var model = nutrientPointSourceModel;

$(function () {
    kendo.bind($("#NutrientPointSourceModel"), nutrientPointSourceModel);

    var interfaceInfo = {
        "dataType": "<p><b>Facility Information</b> - contains information related to each of the wastewater treatment plants and industrial facilities such as receiving water, latitude and longitude, hydrologic unit (HUC8), and FIPS (state/county).</p><p><b>Load Data</b> - depending upon whether the user chooses monthly or annual concentrations, contains calculated average monthly effluent loads based upon monthly effluent flows and concentrations (flow*concentration*8.344=load) or calculated average annual effluent loads based upon total annual loads (total annual load/number of days in year=average annual load).If the user selects delivered loads based upon one of the watershed model scenarios (TN and TP only), transport factors are applied to the end-of-pipe loads.  The transport factors were calculated by dividing watershed model segment input loads from all sources into the amount of that load that is transported or delivered to the geologic fall line or tidal waters.The Tributary Strategy Run attempted to assess water quality conditions using point and nonpoint source loading inputs expected as a result of full implementation of the State's tributary strategies.  The 1997 Progress Run attempted to assess water quality conditions using point and nonpoint source loading inputs for the year 1997.</p>",
        "geographicalAttribute": "<p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p>"
    };

    //init tooltips
    nutrientPointSourceModel.set("interfaceText", interfaceInfo);

    $("#dataTypeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["dataType"];
    $("#dataTypeContainer").find("i").data("kendoTooltip").refresh();

    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["geographicalAttribute"];
    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").refresh();
    //override default display for dataType model
    $("#dataTypeContainer").css("display", "");
    //set navigation active
    $("#point-source").children().addClass("nav-selected");

    nutrientPointSourceModel.set("sourceDropDownSource", sourceDropDownValues);
    nutrientPointSourceModel.set("sourceValue", "PointSource");

    $("#attributeSelection").multiSelect({
        afterSelect: function (value) {
            nutrientPointSourceModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = nutrientPointSourceModel.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
            nutrientPointSourceModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
        }
    });

    $("#attributeSelectionContainer .multiselect-button").click(function () {
        if (nutrientPointSourceModel.get("geographicalAttributeMultiSelectionValue").length < $("#attributeSelection option").length) {
            nutrientPointSourceModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection option").each(function () {
                nutrientPointSourceModel.get("geographicalAttributeMultiSelectionValue").push($(this).val());
            });
            $("#attributeSelection").multiSelect("select_all");
        } else {
            nutrientPointSourceModel.set("geographicalAttributeMultiSelectionValue", []);
            $("#attributeSelection").multiSelect("deselect_all");
        }
    });

    $.get('api.json/PointSource/DataTypes', function (response) {
        nutrientPointSourceModel.set("dataTypeDropDownSource", response);
    });
    $.get('api.json/PointSource/GeographicalAttributes', function (response) {
        nutrientPointSourceModel.set("geographicalAttributeDropDownSource", response);
    });
});