"use strict";

$(document).ajaxError(function (event, request, settings, error) {
    alert("Unknown error, cannot complete request.")
    model.set("progressBarValue", 100);
});

$(function () {
    $(".title-bar .navbar-button").click(function () {
        $(".nav-tree ul").addClass("nav-tree-active");
        $(".nav-tree ul").slideToggle(200);
    });
    $(window).resize(function (e) {
        if (e.target.innerWidth > 992) {
            $(".nav-tree ul").css("display", "block");
        } else {
            $(".nav-tree ul").css("display", "none");
            $(".nav-tree ul").removeClass("nav-tree-active");

        }
    });
});


var API = "api";

var sourceDropDownValues = [
    { "DataSourceName": "Living Resources", "DataSourceValue": "LivingResources" },
    { "DataSourceName": "Fluorescence Data", "DataSourceValue": "Fluorescence" },
    { "DataSourceName": "Nutrient Point Source Data", "DataSourceValue": "PointSource" },
    { "DataSourceName": "Toxics Data", "DataSourceValue": "Toxics" },
    { "DataSourceName": "CBP Water Quality Data (1984 - present)", "DataSourceValue": "WaterQuality" },
    { "DataSourceName": "Historical CBI Water Quality Data (1949 - 1982)", "DataSourceValue": "CBIWaterQuality" }
];

var DataSource = kendo.data.ObservableObject.extend({

    PROGRAM_LIST: null,
    PROJECT_LIST: null,
    DEFAULT_START_DATE: new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate()),

    progressBarValue: 0,
    sourceValue: "",
    dataTypeValue: "",
    startDateValue: "",
    endDateValue: "",
    programValue: "",
    projectValue: "",
    geographicalAttributeValue: "",
    geographicalAttributeMultiSelectionValue: [],
    parameterMultiSelectionValue: [],
    mediaTypeMultiSelectionValue: [],
    referenceMultiSelectionValue: [],
    radioFormatValue: "",
    radioWrappedValue: false,
    checkboxBrowserDownloadValue: false,
    progressBarVisible: false,

    sourceDropDownSource: [],
    dataTypeDropDownSource: [],
    programDropDownSource: [],
    projectDropDownSource: [],
    geographicalAttributeDropDownSource: [],
    geographicalAttributeMultiSelectionSource: [],
    parameterMultiSelectionSource: [],
    mediaTypeMultiSelectionSource: [],
    referenceMultiSelectionSource: [],
    interfaceText: [],
    parameterMultiSelectionKeyValues: [],

    chemicalMultiSelectionValue: [],
    chemicalMultiSelectionSource: [],


    onChangeFormatRadio: function () {
        var model = this;
        if (model.get("radioFormatValue") == "Tab") {
            $("#wrappedRadioContainer").css("visibility", "visible");
        } else {
            $("#wrappedRadioContainer").css("visibility", "hidden");
            model.set("radioWrappedValue", false);
        }
    },

    onChangeWrappedCheckbox: function () {
        var model = this;
        if (model.get("radioWrappedValue")) {
            model.set("radioFormatValue", "tabw");
        } else {
            model.set("radioFormatValue", "tab");
        }
    },

    onClickSubmitButton: function (e) {
        var model = this,
            uri = model._getAPIURI();
        console.log(model._getAPIURI());

        if (model._queryParametersValid()) {
            var URL = window.location.href.split('/');
            $('#input-api-url').val(URL[0] + '//' + URL[2] + '/' + uri[0] + '/' + uri[1]);

            if (model.get("checkboxBrowserDownloadValue")) {
                var $form = model._createForm(uri[0], true);
                $("body").append($form);
                $form.submit();
                $form.remove();
            } else {
                var $form = model._createForm(uri[0], false);
                $("body").append($form);

                var token = new Date().getTime(); //use timestamp as the token value

                $('#download_token_value_id').val(token); //set the hidden field with the token value

                var inSixMinutes = new Date(new Date().getTime() + 6 * 60 * 1000);
                Cookies.set('fileUploadToken', token, { //set cookie
                    expires: inSixMinutes, //cookie expires in 6 minutes,which is 1 minute past the timeout
                    domain: '.chesapeakebay.net' //set the domain for the cookie
                });

                $form.submit();
                model.displayLoading("body", true); //DHUB-317 //needs to come afterthe $form.submit() or breaks IE11
                model.checkLoading(); //begin to check for cookie
                $form.remove();
            }
        }
    },

    /// <summary>
    /// DHUB-317 
    /// </summary>
    /// <param name="target">(jQuery object) The container which will be overlaid.</param>
    /// <param name="showLoading">(boolean) The flag, which indicates whether to show or hide the loading overlay.</param>
    displayLoading: function (target, showLoading) {
        kendo.ui.progress($(target), showLoading);    
    },

    /// <summary>
    /// DHUB-317 
    /// </summary>
    /// <param name="target">(jQuery object) The container which will be overlaid.</param>
    /// <param name="showLoading">(boolean) The flag, which indicates whether to show or hide the loading overlay.</param>
    checkLoading: function () {

        var downloadToken = $('#download_token_value_id').val();
        
        var fileDownloadCheckTimer = setInterval(function () {
            var cookieValue = Cookies.get('fileDownloadToken'); //check cookie for fileDownloadToken
            if (cookieValue == downloadToken) {
                clearInterval(fileDownloadCheckTimer); //clear the hidden field

                Cookies.remove('fileDownloadToken', { domain: '.chesapeakebay.net' }); //clears this cookie value for fileDownloadToken
                Cookies.remove('fileUploadToken', { domain: '.chesapeakebay.net' }); //clears this cookie value for fileUploadToken

                model.displayLoading("body", false); //stops the spinner and removes modal overlay
            }
        }, 1000);
    },

    _createAPIURI: function () {
        var apiURIString = "";
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i].getMonth) {
                arguments[i] = arguments[i].toDateString();
            }
            if (arguments[i]) {
                apiURIString += arguments[i] + '/';
            }
        }
        return apiURIString;
    },

    _createForm: function (action, isTargetWindowEnabled) {
        var model = this,
            fileName = model.get("sourceValue") + model.get("dataTypeValue") + model.get("geographicalAttributeValue"),
            $form = $("<form></form>").attr("method", "POST").attr("action", action + "?download=" + fileName).css("display", "none"),
            parameterList = {};

        if (isTargetWindowEnabled) {
            $form = $form.attr("target", "_blank").attr("action", action);
        }
        if (model.get("geographicalAttributeMultiSelectionValue").length > 0) {
            var $geographicalAttribute = $("<input/>").attr("name", "geographicalAttributesList").attr("value", model.get("geographicalAttributeMultiSelectionValue").join());
            parameterList["geographicalAttributesList"] = model.get("geographicalAttributeMultiSelectionValue").join();
            $form.append($geographicalAttribute);
        }
        if (model.get("parameterMultiSelectionValue").length > 0) {
            var $parameter = $("<input/>").attr("name", "parametersList").attr("value", model.get("parameterMultiSelectionValue").join());
            parameterList["parametersList"] = model.get("parameterMultiSelectionValue").join();
            $form.append($parameter);
        }
        if (model.get("mediaTypeMultiSelectionValue").length > 0) {
            var $mediaType = $("<input/>").attr("name", "mediaTypesList").attr("value", model.get("mediaTypeMultiSelectionValue").join());
            parameterList["mediaTypesList"] = model.get("mediaTypeMultiSelectionValue").join();
            $form.append($mediaType);
        }
        if (model.get("referenceMultiSelectionValue").length > 0) {
            var $reference = $("<input/>").attr("name", "referencesList").attr("value", model.get("referenceMultiSelectionValue").join());
            parameterList["referencesList"] = model.get("referenceMultiSelectionValue").join();
            $form.append($reference);
        }
        console.log('my form created: \n ' + JSON.stringify($form, null, 4));
        return $form;
    },

    _getQueryParameters: function () {
        var model = this,
            parameterList = {};

        if (model.get("geographicalAttributeMultiSelectionValue").length > 0) {
            parameterList["geographicalAttributesList"] = model.get("geographicalAttributeMultiSelectionValue").join();
        }
        if (model.get("parameterMultiSelectionValue").length > 0) {
            parameterList["parametersList"] = model.get("parameterMultiSelectionValue").join();
        }
        if (model.get("mediaTypeMultiSelectionValue").length > 0) {
            parameterList["mediaTypesList"] = model.get("mediaTypeMultiSelectionValue").join();
        }
        if (model.get("referenceMultiSelectionValue").length > 0) {
            parameterList["referencesList"] = model.get("referenceMultiSelectionValue").join();
        }
        return parameterList;
    },

    _queryParametersValid: function () {

        if (model.get("sourceValue") == "CBIWaterQuality") {
            return true;
        }

        if (model.get("dataTypeValue") === "WaterQuality" && model.get("sourceValue") === "WaterQuality") {
            if (model.get("geographicalAttributeMultiSelectionValue").length > 0 && model.get("parameterMultiSelectionValue").length > 0) {
                return true;
            }
        }
        else if (model.get("dataTypeValue") === "ChemicalContaminant") {
            if (model.get("geographicalAttributeMultiSelectionValue").length > 0 && model.get("mediaTypeMultiSelectionValue").length > 0) {
                return true;
            }
        }
        else {
            if (model.get("geographicalAttributeMultiSelectionValue").length > 0) {
                return true;
            }
            if (model.get("parameterMultiSelectionValue").length > 0) {
                return true;
            }
            if (model.get("mediaTypeMultiSelectionValue").length > 0) {
                return true;
            }
            if (model.get("referenceMultiSelectionValue").length > 0) {
                return true;
            }
        }
        return false;
    },

    _getAPIURI: function () {
        var model = this,
            uri = [],
            temp = [],
            dropDownValues = ["dataTypeValue", "startDateValue", "endDateValue", "programValue", "projectValue", "geographicalAttributeValue"],
            multiSelectValues = ["geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue", "mediaTypeMultiSelectionValue", "referenceMultiSelectionValue"],
            livingResourcesValues = ["programValue", "dataTypeValue", "startDateValue", "endDateValue", "projectValue", "geographicalAttributeValue"];

        temp.push("api." + model.get("radioFormatValue"));
        if (model.get("sourceValue") == "CBIWaterQuality") {
            //The CBI data is fetched from the Water quality controller. 
            temp.push("WaterQuality");
            temp.push("CBI")
        }
        else {
            temp.push(model.get("sourceValue"));
        }
        if (model.get("sourceValue") == "LivingResources") {
            livingResourcesValues.forEach(function (i, j) {
                if (model.get(i).getMonth) {
                    temp.push((model.get(i).getMonth() + 1) + '-' + model.get(i).getDate() + '-' + model.get(i).getFullYear());
                } else if (model.get(i)) {
                    temp.push(model.get(i));
                }
            });
        } else {
            dropDownValues.forEach(function (i, j) {
                if (model.get(i).getMonth) {
                    temp.push((model.get(i).getMonth() + 1) + '-' + model.get(i).getDate() + '-' + model.get(i).getFullYear());
                } else if (model.get(i)) {
                    temp.push(model.get(i));
                }
            });
        }
        uri.push(temp.join('/'));

        temp = [];
        multiSelectValues.forEach(function (i, j) {
            if (model.get(i).length > 0) {
                temp.push(model.get(i).join());
            }
        });
        uri.push(temp.join('/'));
        return uri;
    },

    _getInterfaceURI: function () {
        var model = this,
        uri = [],
        temp = [],
        dropDownValues = ["dataTypeValue", "startDateValue", "endDateValue", "programValue", "projectValue", "geographicalAttributeValue"],
        multiSelectValues = ["geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue", "mediaTypeMultiSelectionValue", "referenceMultiSelectionValue"],
        livingResourcesValues = ["programValue", "dataTypeValue", "startDateValue", "endDateValue", "projectValue", "geographicalAttributeValue"];

        temp.push("api.json");

        if (model.get("sourceValue") == "CBIWaterQuality") {
            //The CBI data is fetched from the Water quality controller. 
            temp.push("WaterQuality");
            temp.push("CBI")
        }
        else {
            temp.push(model.get("sourceValue"));
        }
        if (model.get("sourceValue") == "LivingResources") {
            livingResourcesValues.forEach(function (i, j) {
                if (model.get(i).getMonth) {
                    temp.push((model.get(i).getMonth() + 1) + '-' + model.get(i).getDate() + '-' + model.get(i).getFullYear());
                } else if (model.get(i)) {
                    temp.push(model.get(i));
                }
            });
        } else {
            dropDownValues.forEach(function (i, j) {
                if (model.get(i).getMonth) {
                    temp.push((model.get(i).getMonth() + 1) + '-' + model.get(i).getDate() + '-' + model.get(i).getFullYear());
                } else if (model.get(i)) {
                    temp.push(model.get(i));
                }
            });
        }
        uri.push(temp.join('/'));

        temp = [];
        multiSelectValues.forEach(function (i, j) {
            if (model.get(i).length > 0) {
                temp.push(model.get(i).join());
            }
        });
        uri.push(temp.join('/'));

        return uri.join('/');
    },

    _setDefaultValues: function () {
        var model = this;
        for (var i in arguments) {
            if (arguments[i] == "dataTypeValue") {
                model.set("dataTypeValue", "");
            }
            if (arguments[i] == "startDateValue") {
                model.set("startDateValue", "");
            }
            if (arguments[i] == "endDateValue") {
                model.set("endDateValue", "");
            }
            if (arguments[i] == "programValue") {
                model.set("programValue", "");
            }
            if (arguments[i] == "projectValue") {
                model.set("projectValue", "");
            }
            if (arguments[i] == "geographicalAttributeValue") {
                model.set("geographicalAttributeValue", "");
            }
            if (arguments[i] == "geographicalAttributeMultiSelectionValue") {
                model.set("geographicalAttributeMultiSelectionValue", []);
            }
            if (arguments[i] == "parameterMultiSelectionValue") {
                model.set("parameterMultiSelectionValue", []);
            }
            if (arguments[i] == "parameterMultiSelectionSource") {
                model.set("parameterMultiSelectionSource", []);
            }
            if (arguments[i] == "geographicalAttributeMultiSelectionSource") {
                model.set("geographicalAttributeMultiSelectionSource", []);
            }
            if (arguments[i] == "geographicalAttributeIdParameterDictionary") {
                model.set("geographicalAttributeIdParameterDictionary", []);
            }

        }
    },

    onDataBoundTemplateInit: function () {
        $(".disable").parent().click(false);
    },

    progressBarStart: function () {
        var model = this;
        model.set("progressBarValue", 0);
        var interval = setInterval(function () {
            if (model.get("progressBarValue") < 100) {
                model.set("progressBarValue", model.get("progressBarValue") + Math.random() * 1.1);
            } else {
                clearInterval(interval);
            }
        }, 800);
    },

    progressBarChange: function (e) {
        var model = this;
        model.set("progressBarVisible", true);
    },

    progressBarComplete: function (e) {
        var model = this;
        model.set("progressBarVisible", false);
    }
});