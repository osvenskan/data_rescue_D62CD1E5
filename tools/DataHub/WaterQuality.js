var waterQualitySourceDropDown = [
    { "DataSourceName": "CBP Water Quality Data (1984 - present)", "DataSourceValue": "WaterQuality" },
    { "DataSourceName": "Historical CBI Water Quality Data (1949 - 1982)", "DataSourceValue": "CBIWaterQuality" }
];

var waterQualityModel = new DataSource({
    geographicalAttributeIdParameterDictionary: [],
    onChangeSourceDropDown: function () {
        var model = this;

        //reset progress to source stage
        $("#sourceContainer ~ div").slideUp("fast");
        model._setDefaultValues("dataTypeValue", "programValue", "projectValue", "geographicalAttributeValue", "geographicalAttributeMultiSelectionValue", "parameterMultiSelectionValue");
        $('#input-api-url').val("");

        //start progress bar
        model.progressBarStart();
        $("#divDateAlertWQPresent").hide("slow");
        $("#divStartDateAlertWQHistoric").hide("slow");
        $("#divEndDateAlertWQHistoric").hide("slow");
        $("#divDateAlert").hide("slow");
        //check if CBP or CBI water quality
        if (model.get("sourceValue") == "WaterQuality") {
            $("#dataTypeContainer").show("slow");
        } else {
            model.set("startDateValue", new Date(1949, 6,2));
            model.set("endDateValue", new Date(1982, 7, 13));
            model.set("radioFormatValue", "Tab");
            $("#dateRangeContainer").show("slow");
            $("#cbiGeographicalAttributeContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
        }
        model.set("progressBarValue", 100);
    },

    onChangeDataTypeDropDown: function () {
        var model = this,
            programIdList = [];

        //reset progres to dataType stage
        $("#dataTypeContainer ~ div").slideUp("fast");
        model._setDefaultValues("programValue","projectValue","geographicalAttributeValue","startDateValue","endDateValue");
        model.progressBarStart();
        $('#input-api-url').val("");

        //grab list of all project id's
        for (var i = 0; i < model.get("PROGRAM_LIST").length; i++) {
            programIdList.push(model.get("PROGRAM_LIST")[i].ProgramId);
        }

        //check for station datatype
        if (model.get("dataTypeValue") == "Station") {
            $("#geographicalAttributeContainer").show("slow");
            model.set("progressBarValue", 100);
        } else {
            model.set("endDateValue", new Date());
            //set initial startDateValue of 5 years prior to current date
            model.set("startDateValue", (new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate())));
            //WaterQuality/{dataTypeValue}/{startDateValue}/{endDateValue}/projectIdList
            $.get(model._getInterfaceURI() + programIdList.join(), function (response) {
                //calculate sum of all record counts for each project to add a All Programs select option
                var recordCountSum = 0;
                for (var i = 0; i < response.length; i++) {
                    recordCountSum += response[i].AvailableRecords;
                }
                //add All Programs option to response
                response.unshift({
                    AvailableRecords: recordCountSum,
                    Program: "All Programs",
                    ProgramAcronym: "",
                    ProgramId: programIdList.join()
                });

                //bind response to Program DropDown
                model.set("programDropDownSource", response);
                model.set("progressBarValue", 100);
                $("#programContainer").show("slow");
                $("#dateRangeContainer").show("slow");
            });
        }
    },

    onChangeProgramDropDown: function () {
        var model = this,
            tempProgramArray = model.get("programValue").toString().split(','),
            tempProjectArray = [];

        //reset progress to program stage
        $("#programContainer ~ div").slideUp("fast");
        model._setDefaultValues("geographicalAttributeValue", "projectValue", "geographicalAttributeMultiSelectionValue", "geographicalAttributeMultiSelectionSource", "geographicalAttributeIdParameterDictionary", "parameterMultiSelectionValue", "geographicalAttributeIdParameterDictionary");
        model.progressBarStart();
        
        //adds every programs associated project to list
        for (var i = 0; i < tempProgramArray.length; i++) {
            var projectList = model.get("PROJECT_LIST")[tempProgramArray[i]];
            for (var j = 0; j < projectList.length; j++) {
                tempProjectArray.push(projectList[j].ProjectId);
            }
        }
        
        //if all program option selected
        if (model.get("programValue") == "2,4,6") {
            model.set("projectValue", tempProjectArray.join());
            model.set("progressBarValue", 100);
            $("#geographicalAttributeContainer").show("slow");
        } else {
            //WaterQuality/{dataTypevalue}/{startDateValue}/{endDateValue}/{programValue}/{projectIdList}
            $.get(model._getInterfaceURI() + tempProjectArray.join(), function (response) {
                var recordCountSum = 0,
                    projectIdList = [];
                for (var i = 0; i < response.length; i++) {
                    recordCountSum += response[i].AvailableRecords;
                    projectIdList.push(response[i].ProjectId);
                }
                response.unshift({
                    AvailableRecords: recordCountSum,
                    Project: "All Projects",
                    ProjectAcronym: "",
                    ProjectId: projectIdList.join()
                });

                //dynamic interface insertion
                $("#projectContainer").find("i").data("kendoTooltip").options.content = model.get("interfaceText")[model.get("programValue").toString()];
                $("#projectContainer").find("i").data("kendoTooltip").refresh();

                model.set("projectDropDownSource", response);
                model.set("geographicalAttributeValue", "");
                model.set("progressBarValue", 100);

                //multi select restart
                $("#attributeSelection").html('');
                $("#attributeSelection").multiSelect('refresh');
                $('#parameterMultiSelect').multiSelect('deselect_all');
                $('#parameterMultiSelect').multiSelect('refresh');
                $("#projectContainer ~ div").slideUp("fast");
                $("#projectContainer").show("slow");

            });
        }
    },

    onChangeProjectDropDown: function () {
        var model = this;

        $("#projectContainer ~ div").slideUp("fast");
        model._setDefaultValues("geographicalAttributeValue");
        model.progressBarStart();

        $("#geographicalAttributeContainer").show("slow");
        model.set("progressBarValue", 100);
    },

    onChangeGeographicaAttributeDropDown: function () {
        var model = this;

        //reset progress to geographic attribute selection
        model.progressBarStart();
        $("#geographicalAttributeContainer ~ div").slideUp("fast");
        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        model._setDefaultValues("geographicalAttributeMultiSelectionValue", "geographicalAttributeMultiSelectionSource", "geographicalAttributeIdParameterDictionary", "parameterMultiSelectionValue", "geographicalAttributeIdParameterDictionary");
        
        model.set("radioFormatValue", "Tab");
        model.set("checkboxBrowserDownloadValue", false);
        model.set("radioWrappedValue", false);
        $("#wrappedRadioContainer").css("visibility", "visible");
        $('#parameterMultiSelect').find('option').remove();
        $('#parameterMultiSelect').multiSelect('refresh');
        $('#input-api-url').val("");
        

        if (model.get("dataTypeValue") == "WaterQuality") {
            $.get(model._getInterfaceURI(), function (response) {
                model.set("geographicalAttributeMultiSelectionSource", response);
                model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), "attributeSelection");
                $.post(model._getInterfaceURI() + "Parameters", { "parametersList": model._getGeographicalIDList(response).join() }, function (pResponse) {

                    var tempObject = model.get("geographicalAttributeIdParameterDictionary");
                    model.set("geographicalAttributeIdParameterDictionary", model._createParameterList(pResponse, tempObject));
                    model.set("progressBarValue", 100);
                    $("#attributeSelectionContainer").show("slow");
                    $("#parameterContainer").show("slow");
                    $("#formatContainer").show("slow");
                    $("#submitButtonContainer").show("slow");
                    $('#urlContainer').show('slow');
                });
            });
        } else {
            $.get(model._getInterfaceURI(), function (response) {
                if (response.length == 0) {
                    alert("No records for this query");
                } else {
                    model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), "attributeSelection");
                    model.set("geographicalAttributeMultiSelectionSource", response);

                    model.set("progressBarValue", 100);
                    model.set("radioFormatValue", "tab");
                    $("#attributeSelectionContainer").show("slow");
                    $("#formatContainer").show("slow");
                    $("#submitButtonContainer").show("slow");
                    $('#urlContainer').show('slow');
                }
            });
        }
    },

    onChangeCbiGeographicaAttributeDropDown: function () {
        var model = this;
        $('#input-api-url').val("");
        //reset progress to geographic attribute selection
        model.progressBarStart();
        $("#cbiGeographicalAttributeContainer ~ div").slideUp("fast");
        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        model._setDefaultValues("geographicalAttributeMultiSelectionValue", "geographicalAttributeMultiSelectionSource", "geographicalAttributeIdParameterDictionary", "parameterMultiSelectionValue", "geographicalAttributeIdParameterDictionary");
        model.set("radioFormatValue", "Tab");
        model.set("checkboxBrowserDownloadValue", false);
        model.set("radioWrappedValue", false);
        $("#wrappedRadioContainer").css("visibility", "visible");
        $('#input-api-url').val("");
        model._updateGeoAttributeMultiList();
    },

    onChangeStartDateDatePicker: function () {
        var model = this,
            programIdList = [];

        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        var wqPresentStartDate = new Date("1/16/1984");
        var wqHistoricStartDate = new Date("7/2/1949");
        var wqHistoricEndDate = new Date("8/13/1982");
        if (model.get("sourceValue") == "WaterQuality" && sDate.getTime() < wqPresentStartDate) {
            $("#divDateAlertWQPresent").show("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
        else if (model.get("sourceValue") == "CBIWaterQuality" && sDate.getTime() < wqHistoricStartDate) {
            $("#divDateAlertWQPresent").hide("slow");
            $("#divStartDateAlertWQHistoric").show("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
        else if (sDate.getTime() >= eDate.getTime()) {
            $("#divDateAlertWQPresent").hide("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").show("slow");
            onStartDateChangeHideDiv();
        }
        else {
            $("#divDateAlertWQPresent").hide("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            $("#cbiGeographicalAttributeContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
            if (model.get("sourceValue").toString() === "WaterQuality") {
                model.progressBarStart();
                for (var i = 0; i < model.get("PROGRAM_LIST").length; i++) {
                    programIdList.push(model.get("PROGRAM_LIST")[i].ProgramId);
                }
                $("#dateRangeContainer ~ div").slideUp("fast");
                model.set("programValue", "");
                model.set("projectValue", "");
                model.set("geographicalAttributeValue", "");
                model.set("geographicalAttributeMultiSelectionValue", []);
                model.set("parameterSelectionValue", "");

                if (model.get("startDateValue") == null) {
                    model.set("startDateValue", model.get("DEFAULT_START_DATE"));
                }
                $.get(model._getInterfaceURI() + programIdList.join(), function (response) {

                    var responseListLength = response.length,
                        recordCountSum = 0;
                    for (var i = 0; i < responseListLength; i++) {
                        recordCountSum += response[i].AvailableRecords;
                    }
                    response.unshift({
                        AvailableRecords: recordCountSum,
                        Program: "All Programs",
                        ProgramAcronym: "",
                        ProgramId: programIdList.join()
                    });
                    model.set("programDropDownSource", response);
                    model.set("progressBarValue", 100);

                    $("#programContainer").show("slow");
                });
            }
            else {
                model._updateGeoAttributeMultiList();
            }
        }
    },

    onChangeEndDateDatePicker: function (e) {
        var model = this,
            programIdList = [];

        var sDate = new Date($('#startDate').val());
        var eDate = new Date($('#endDate').val());
        var wqPresentStartDate = new Date("1/16/1984");

        var wqPresentStartDate = new Date("1/16/1984");
        var wqHistoricStartDate = new Date("7/2/1949");
        var wqHistoricEndDate = new Date("8/13/1982");

        if (model.get("sourceValue") == "WaterQuality" && eDate.getTime() < wqPresentStartDate) {
            $("#divDateAlertWQPresent").show("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
        else if (model.get("sourceValue") == "WaterQuality" && eStart.getTime() < wqPresentStartDate) {
            $("#divDateAlertWQPresent").show("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
        else if (model.get("sourceValue") == "CBIWaterQuality" && eDate.getTime() > wqHistoricEndDate) {
            $("#divDateAlertWQPresent").hide("slow");
            $("#divStartDateAlertWQHistoric").hide("slow");
            $("#divEndDateAlertWQHistoric").show("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
        else if (model.get("sourceValue") == "CBIWaterQuality" && sDate.getTime() < wqHistoricStartDate) {
            $("#divDateAlertWQPresent").hide("slow");
            $("#divStartDateAlertWQHistoric").show("slow");
            $("#divEndDateAlertWQHistoric").hide("slow");
            $("#divDateAlert").hide("slow");
            onStartDateChangeHideDiv();
        }
       else if (sDate.getTime() >= eDate.getTime()) {
           $("#divDateAlertWQPresent").hide("slow");
           $("#divStartDateAlertWQHistoric").hide("slow");
           $("#divEndDateAlertWQHistoric").hide("slow");
           $("#divDateAlert").show("slow");
           onStartDateChangeHideDiv();
        }
        else {
           $("#divDateAlertWQPresent").hide("slow");
           $("#divStartDateAlertWQHistoric").hide("slow");
           $("#divEndDateAlertWQHistoric").hide("slow");
           $("#divDateAlert").hide("slow");
            $("#cbiGeographicalAttributeContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
            if (model.get("sourceValue").toString() === "WaterQuality") {
                model.progressBarStart();
                for (var i = 0; i < model.get("PROGRAM_LIST").length; i++) {
                    programIdList.push(model.get("PROGRAM_LIST")[i].ProgramId);
                }

                $("#dateRangeContainer ~ div").slideUp("fast");

                model.set("programValue", "");
                model.set("projectValue", "");
                model.set("geographicalAttributeValue", "");
                model.set("geographicalAttributeMultiSelectionValue", []);
                model.set("parameterSelectionValue", "");

                if (model.get("startDateValue") == null) {
                    model.set("startDateValue", model.get("DEFAULT_START_DATE"));
                }
                $.get(model._getInterfaceURI() + programIdList.join(), function (response) {

                    var responseListLength = response.length,
                        recordCountSum = 0;
                    for (var i = 0; i < responseListLength; i++) {
                        recordCountSum += response[i].AvailableRecords;
                    }
                    response.unshift({
                        AvailableRecords: recordCountSum,
                        Program: "All Programs",
                        ProgramAcronym: "",
                        ProgramId: programIdList.join()
                    });
                    model.set("programDropDownSource", response);
                    model.set("progressBarValue", 100);

                    $("#programContainer").show("slow");
                });
            }
            else {
                model._updateGeoAttributeMultiList();
            }
        }
    },

    _fillGeoMultiSelect: function (response, geoTypeSelected, multiSelectId) {
        var $multiSelect = $('#' + multiSelectId);
        for (var i in response) {
            switch (geoTypeSelected) {
                case "HUC8":
                    if (response[i].HUCEightId == null) { response[i].HUCEightId = "null"; }
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUCEightId,
                        text: response[i].HUC8 + " - " + response[i].HUC8Description
                    });
                    break;
                case "HUC12":
                    if (response[i].HUCTwelveId == null) { response[i].HUCTwelveId = "null"; }

                    $multiSelect.multiSelect('addOption', {
                        value: response[i].HUCTwelveId,
                        text: response[i].HUC12 + " - " + response[i].HUC12Description
                    });
                    break;
                case "FIPS":
                    if (response[i].FIPSStateCountyCodeId == null) { response[i].FIPSStateCountyCodeId = "null"; }
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].FIPSStateCountyCodeId,
                        text: response[i].FIPS + " - " + response[i].County_City + " - " + response[i].State
                    });
                    break;
                case "CBSeg2003":
                    if (response[i].CBSegment2003Id == null) { response[i].CBSegment2003Id = "null"; }
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSegment2003Id,
                        text: response[i].CBSegment2003 + " - " + response[i].CBSegment2003Description
                    });
                    break;
                case "SegmentShed2009":
                    if (response[i].CBSegmentShed2009Id == null) { response[i].CBSegmentShed2009Id = "null"; }
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].CBSegmentShed2009Id,
                        text: response[i].CBSegmentShed2009 + " - " + response[i].CBSegmentShed2009_Description
                    });
                    break;
                case "Station":
                    if (response[i].MonitoringLocationId == null) { response[i].MonitoringLocationId = "null"; }
                    $multiSelect.multiSelect('addOption', {
                        value: response[i].MonitoringLocationId,
                        text: response[i].Station + " - " + response[i].StationDescription
                    });
                    break;
            }
        }

    },

    _getGeographicalIDList: function (geographicalList) {
        var model = this,
            geographicalAttributeIdList = [];

        switch (model.get("geographicalAttributeValue")) {
            case "HUC8":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].HUCEightId);
                }
                return geographicalAttributeIdList;
            case "HUC12":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].HUCTwelveId);
                }
                return geographicalAttributeIdList;
            case "FIPS":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].FIPSStateCountyCodeId);
                }
                return geographicalAttributeIdList;
            case "CBSeg2003":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].CBSegment2003Id);
                }
                return geographicalAttributeIdList;
            case "SegmentShed2009":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].CBSegmentShed2009Id);
                }
                return geographicalAttributeIdList;
            case "Station":
                for (var i in geographicalList) {
                    geographicalAttributeIdList.push(geographicalList[i].MonitoringLocationId);
                }
                return geographicalAttributeIdList;
        }
    },

    _createParameterList: function (pResponse, tempObject) {
        var model = this;
        switch (model.get("geographicalAttributeValue")) {
            case "HUC8":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].HUCEightId] == undefined) {
                        tempObject[pResponse[i].HUCEightId] = [];
                    }
                    tempObject[pResponse[i].HUCEightId][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
            case "HUC12":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].HUCTwelveId] == undefined) {
                        tempObject[pResponse[i].HUCTwelveId] = [];
                    }
                    tempObject[pResponse[i].HUCTwelveId][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
            case "FIPS":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].FIPSStateCountyCodeId] == undefined) {
                        tempObject[pResponse[i].FIPSStateCountyCodeId] = [];
                    }
                    tempObject[pResponse[i].FIPSStateCountyCodeId][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
            case "CBSeg2003":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].CBSegment2003Id] == undefined) {
                        tempObject[pResponse[i].CBSegment2003Id] = [];
                    }
                    tempObject[pResponse[i].CBSegment2003Id][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
            case "SegmentShed2009":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].CBSegmentShed2009Id] == undefined) {
                        tempObject[pResponse[i].CBSegmentShed2009Id] = [];
                    }
                    tempObject[pResponse[i].CBSegmentShed2009Id][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
            case "Station":
                for (var i = 0; i < pResponse.length; i++) {
                    if (tempObject[pResponse[i].MonitoringLocationId] == undefined) {
                        tempObject[pResponse[i].MonitoringLocationId] = [];
                    }
                    tempObject[pResponse[i].MonitoringLocationId][pResponse[i].SubstanceIdentificationId] = {
                        SubstanceIdentificationDescription: pResponse[i].SubstanceIdentificationDescription,
                        SubstanceIdentificationName: pResponse[i].SubstanceIdentificationName,
                    }
                }
                return tempObject;
        }
    },

    _updateGeoAttributeMultiList: function () {
        var model = this;
        $("#attributeSelection").html('');
        $("#attributeSelection").multiSelect('refresh');
        $('#input-api-url').val("");
        if (model.get("geographicalAttributeValue") != "") {
            $.get(model._getInterfaceURI(), function (response) {
                if (response.length == 0) {
                    alert("No records for this query");
                } else {
                    model._fillGeoMultiSelect(response, model.get("geographicalAttributeValue").toString(), "attributeSelection");
                    model.set("geographicalAttributeMultiSelectionSource", response);
                    $("#attributeSelectionContainer").show("slow");
                    model.set("progressBarValue", 100);
                    model.set("radioFormatValue", "tab");
                    $("#formatContainer").show("slow");
                    $("#submitButtonContainer").show("slow");
                    $('#urlContainer').show('slow');
                }
            });
        }
        else {
            model.set("progressBarValue", 100);
            model.set("radioFormatValue", "tab");
            $("#formatContainer").show("slow");
            $("#submitButtonContainer").show("slow");
            $('#urlContainer').show('slow');
        }
    }

});

function onStartDateChangeHideDiv() {
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
var model = waterQualityModel;

//INIT
$(function () {

    kendo.bind($("#WaterQualityModel"), waterQualityModel);

    //Tooltips
    var interfaceInfo = {
        "source": "<p><b>CBP Water Quality Data (1984 – present)</b> - The CBP Water Quality Monitoring dataset is a compilation of tidal data (mainbay and tributary stations for Maryland, Virginia, and the District of Columbia) as well as nontidal data throughout the watershed. The program was established in June 1984 as a long-term program of data collection and analysis to establish baseline water quality conditions in the Bay and to monitor changes in water quality conditions over time.</p><p><b>Historical CBI Water Quality Data (1949 – 1982)</b> - A dataset comprised of physical parameters and nutrient data collected by the Chesapeake Bay Institute of the Johns Hopkins University between 1949 and 1982.</p>",
        "dataType": "<p><b>Station Information</b> - contains information related to each of the monitoring stations such as a description of location, latitude and longitude, hydrologic unit (HUC8), and FIPS (state/county).</p><p><b>Monitoring Event Data</b> - contains information related to sampling events such as weather, total depth, pycnocline depth(s), and air temperature.</p><p><b>Water Quality Data</b> - contains physical and chemical parameter concentrations at specific depths within the water column.</p><p><b>Light Attenuation Data</b> - contains measurements of photosynthetically active radiation (PAR) at specific depths within the water column. These values are used to calculate the light attenuation coefficient (Kd) using the equation Kd=ln(PAR at surface - PAR at depth)/depth.</p><p><b>Optical Density Data</b> - contains spectrophotometric or fluorometric measurements of optical density at specific depths within the water column. These values are used to calculate monochromatic active chlorophyll-a (CHLA) and pheophytin (PHEO). They can also be used to calculate trichromatic chlorophyll-a, chlorophyll-b, and chlorophyll-c.</p>",
        "program": "<p>The CBP Water Quality dataset is divided into three major monitoring programs.</p><p><b>Nontidal Water Quality Monitoring</b> - This program represents the monitoring conducted in the nontidal regions of the Chesapeake Bay watershed.</p><p><b>Shallow Water Monitoring</b> - This program was developed in 2003 to assess water quality in the shallow waters; predominantly conducted in the shallow regions of the tidal tributaries.</p><p><b>Tidal Water Quality monitoring Program</b> - CBP long-term monitoring program comprised of the fixed-station sampling in the mainstem Bay and tidal tributary components.</p>",
        "geographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>Subwatershed (HUC12)</b> - Within each HUC8, there are 12-digit hydrologic units known as subwatersheds that comprise the entire Chesapeake Bay watershed. <a href='http://water.usgs.gov/GIS/huc.html' target='_blank'>more info</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Segment</b> - In 1998, the Chesapeake Bay Program redefined its monitoring segmentation scheme to be based upon salinity regime. The following suffixes are associated with areas based upon salinity levels in parts per thousand (ppt): TF (tidal fresh) - 0.0 to 0.5 ppt, OH (oligohaline) - 0.5 to 5.0 ppt, MH (mesohaline) - 5.0 to 18.0 ppt, PH (polyhaline) - 18.0 to 35.0 ppt</p><p><a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentation_scheme_for_303d_listing_92_segments' target='_blank'>CBP Map</a></p><p><b>Monitoring SegmentShed (SegmentShed2009)</b> - A segmentshed is the discrete land area that drains into each of the 92 Bay Program segments that have TMDLs associated with them.<a href='http://www.chesapeakebay.net/maps/map/chesapeake_bay_segmentsheds' target='_blank'>CBP Map</a>.</p><p><b>Monitoring Station</b> - Refers to the text identifier used to denote a CBP monitoring station.<a href='http://www.chesapeakebay.net/documents/3676/map_of_mainstem_and_tributary_monitoring_stations.pdf' target='_blank'>Map of CBP mainstream and tributary long-term monitoring stations</a></p>",
        "cbiGeographicalAttribute": "<p><b>Hydrologic Unit (HUC8)</b> - The United States Geological Survey has developed a system that assigns drainage areas throughout the nation to a particular region, subregion, accounting unit and cataloging unit. Cataloging units, or 8-digit hydrologic units (HUCs) as they are commonly called, delineate small to medium sized drainage areas. Within the Mid-Atlantic Region, there are four subregions (0205 – 0208) that are at least partially comprised of drainage areas within the Chesapeake Bay watershed.</p><p><a href='http://www.chesapeakebay.net/maps/map/hydrologic_unit_boundaries_huc_8' target='_blank'>CBP Map</a></p><p><b>Subwatershed (HUC12)</b> - Within each HUC8, there are 12-digit hydrologic units known as subwatersheds that comprise the entire Chesapeake Bay watershed. <a href='http://water.usgs.gov/GIS/huc.html' target='_blank'>more info</a></p><p><b>County/City (FIPS)</b> - the Federal Information Processing System (FIPS) assigns 5-digit codes to all counties and incorporated cities in the United States. The first two digits correspond to the state and the last three to the county or incorporated city within that state.</p><p><b>Monitoring Station</b> - Refers to the text identifier used to denote a CBP monitoring station.<a href='http://www.chesapeakebay.net/documents/3676/map_of_mainstem_and_tributary_monitoring_stations.pdf' target='_blank'>Map of CBP mainstream and tributary long-term monitoring stations</a></p>",
        "6": "<p><b>Tidal Mainstem Water Quality Monitoring Project</b> - Long-term fixed-station monitoring network conducted since 1984 in the Bay mainstem.</p><p><b>Tidal Non-Traditional Partners</b> - CBPs new endeavor to include non-CBP funded monitoring; primarily citizen monitoring projects.</p><p><b>Tidal Tributary Water Quality Monitoring</b> - Long-term fixed-station monitoring network conducted in the tidal tributaries.</p><p><b>Special Tidal Water Quality Monitoring</b> - Multi-year fixed-station studies conducted for special purposes in the tidal tributaries.</p>",
        "2": "<p><b>Nontidal Network Water Quality Monitoring (NTN)</b> - Network developed in 2004 to monitor in the nontidal portion of the Chesapeake Bay watershed using standardized sampling and analysis protocols.</p><p><b>Nontidal Out of Network Water Quality Monitoring (NTID)</b> - Sampling conducted in nontidal waters that does not use sampling protocols of the NTN.</p><p><b>Nontidal Special Water Quality Monitoring (NTSPECIAL)</b> - Short-term special sampling conducted in nontidal waters.</p><p><b>Nontidal Non-Traditional Partner Data (NTPART)</b> - Nontidal citizen monitoring activities.</p>",
        "4": "<p><b>Tidal Continuous Water Quality Monitoring (CMON)</b> - Network developed in 2004 to monitor in the nontidal portion of the Chesapeake Bay watershed using standardized sampling and analysis protocols.</p><p><b>Tidal Dataflow Water Quality Monitoring (DFLO)</b> - The longitudinal in-situ continuous monitoring calibration data are available in the database.</p><p>NOTE: The high frequency, semi-continuous data are available at these websites:</p><p>- <a href='http://mddnr.chesapeakebay.net/eyesonthebay/index.cfm' target='_blank'>MDDNR Eyes on the Bay</a></p><p>- <a href='http://web2/vims.edu/vecos/' target='_blank'>VIMS VECOS (Virginia Estaurine and Coastal Observing System)</a></p>"
    };

    //init tooltips
    waterQualityModel.set("interfaceText", interfaceInfo);
    $("#sourceContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["source"];
    $("#sourceContainer").find("i").data("kendoTooltip").refresh();

    $("#dataTypeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["dataType"];
    $("#dataTypeContainer").find("i").data("kendoTooltip").refresh();

    $("#programContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["program"];
    $("#programContainer").find("i").data("kendoTooltip").refresh();

    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["geographicalAttribute"];
    $("#geographicalAttributeContainer").find("i").data("kendoTooltip").refresh();

    $("#cbiGeographicalAttributeContainer").find("i").data("kendoTooltip").options.content = interfaceInfo["cbiGeographicalAttribute"];
    $("#cbiGeographicalAttributeContainer").find("i").data("kendoTooltip").refresh();

    //init progressbar
    waterQualityModel.progressBarStart();
    waterQualityModel.set("progressBarValue", 100);

    //bind sourceDropDown values to model
    waterQualityModel.set("sourceDropDownSource", waterQualitySourceDropDown);

    //set navigation active
    $("#water-quality").children().addClass("nav-selected");

    //init attribute multi-select events: onSelect, onDeselect
    $('#attributeSelection').multiSelect({
        afterSelect: function (value) {
            if (waterQualityModel.get("dataTypeValue") == "WaterQuality") {
                waterQualityModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
                var temp = model.get("geographicalAttributeIdParameterDictionary")[value[0]];
                for (var i in temp) {
                    if (model.get("parameterMultiSelectionSource")[i] == undefined) {
                        model.get("parameterMultiSelectionSource")[i] = 1;
                    } else {
                        model.get("parameterMultiSelectionSource")[i]++;
                    }
                    $('#parameterMultiSelect').multiSelect('addOption', {
                        value: i,
                        text: temp[i].SubstanceIdentificationName + " - " + temp[i].SubstanceIdentificationDescription
                    });
                }
                $("#parameterMultiSelect").multiSelect('refresh');
            } else {
                waterQualityModel.get("geographicalAttributeMultiSelectionValue").push(value[0]);
            }
        },
        afterDeselect: function (value) {
            var tempIndex;
            if (waterQualityModel.get("dataTypeValue") == "WaterQuality") {
                tempIndex = model.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
                waterQualityModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
                var temp = model.get("geographicalAttributeIdParameterDictionary")[value[0]];
                for (var i in temp) {
                    model.get("parameterMultiSelectionSource")[i]--;
                    if (model.get("parameterMultiSelectionSource")[i] < 1) {
                        $("#parameterMultiSelect").multiSelect('removeOption', {
                            value: parseInt(i)
                        });
                    }
                }
                $("#parameterMultiSelect").multiSelect('refresh');

            } else {
                tempIndex = model.get("geographicalAttributeMultiSelectionValue").indexOf(value[0]);
                waterQualityModel.get("geographicalAttributeMultiSelectionValue").splice(tempIndex, 1);
            }

        }
    });
    //select all button
    $("#attributeSelectionContainer .multiselect-button").click(function () {
        if (waterQualityModel.get("geographicalAttributeMultiSelectionValue").length < $("#attributeSelection option").length) {

            waterQualityModel.set("geographicalAttributeMultiSelectionValue", []);
            model.set("parameterMultiSelectionSource", []);
            $("#attributeSelection").multiSelect("deselect_all");

            $("#attributeSelection option").each(function () {
                var temp = model.get("geographicalAttributeIdParameterDictionary")[$(this).val()];
                for (var i in temp) {
                    if (model.get("parameterMultiSelectionSource")[i] == undefined) {
                        model.get("parameterMultiSelectionSource")[i] = 1;
                    } else {
                        model.get("parameterMultiSelectionSource")[i]++;
                    }
                    $('#parameterMultiSelect').multiSelect('addOption', {
                        value: i,
                        text: temp[i].SubstanceIdentificationName + " - " + temp[i].SubstanceIdentificationDescription
                    });
                }
                waterQualityModel.get("geographicalAttributeMultiSelectionValue").push($(this).val());
            });
            $("#parameterMultiSelect").multiSelect('refresh');

            $("#attributeSelection").multiSelect("select_all");
        } else {
            waterQualityModel.set("geographicalAttributeMultiSelectionValue", []);
            model.set("parameterMultiSelectionSource", []);
            $('#parameterMultiSelect').find('option').remove();
            $("#parameterMultiSelect").multiSelect('refresh');

            $("#attributeSelection").multiSelect("deselect_all");
        }
    });

    //init second level attribute multi-select events: onSelect, onDeselect
    $('#parameterMultiSelect').multiSelect({
        afterSelect: function (value) {
            waterQualityModel.get("parameterMultiSelectionValue").push(value[0]);
        },
        afterDeselect: function (value) {
            var tempIndex = model.get("parameterMultiSelectionValue").indexOf(value[0]);
            waterQualityModel.get("parameterMultiSelectionValue").splice(tempIndex, 1);
        }
    });
    //select all button
    $("#parameterContainer .multiselect-button").click(function () {
        if (waterQualityModel.get("parameterMultiSelectionValue").length < $("#parameterMultiSelect option").length) {
            waterQualityModel.set("parameterMultiSelectionValue", []);

            $("#parameterMultiSelect option").each(function () {
                waterQualityModel.get("parameterMultiSelectionValue").push($(this).val());
            });
            $("#parameterMultiSelect").multiSelect("select_all");
        } else {
            waterQualityModel.set("parameterMultiSelectionValue", []);
            $("#parameterMultiSelect").multiSelect("deselect_all");
        }
    });

    //bind static drop down values
    $.get('api.json/WaterQuality/DataTypes', function (resp) {
        waterQualityModel.set("dataTypeDropDownSource", resp);
    });
    $.get('api.json/WaterQuality/Programs', function (response) {
        waterQualityModel.set("PROGRAM_LIST", response);
    });
    $.get('api.json/WaterQuality/ProjectsList', function (response) {
        waterQualityModel.set("PROJECT_LIST", response);
    });
    $.get('api.json/WaterQuality/GeographicalAttributes', function (response) {
        waterQualityModel.set("geographicalAttributeDropDownSource", response);
    });
    $.get('api.json/WaterQuality/CbiGeographicalAttributes', function (response) {
        waterQualityModel.set("cbiGeographicalAttributeDropDownSource", response);
    });
});

