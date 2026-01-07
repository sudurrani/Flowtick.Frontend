
//Secret Key.
var secretKey = "$ASPcAwSNIgcPPEoTSa0ODw#";
//Secret Bytes.
var secretBytes = CryptoJS.enc.Utf8.parse(secretKey);

var swalSaveTitle = "";
var swalSaveText = "Are you sure you want to Save this record ?";
var swalSaveConfirmButtonText = "Confirm Save";
var swalSaveCancelButtonText = "Cancel";

var swalUpdateTitle = "";
var swalUpdateText = "Are you sure you want to Update this record ?";
var swalUpdateConfirmButtonText = "Confirm Update";
var swalUpdateCancelButtonText = "Cancel";

//Confirmation swal
var swalConfirmTitle = "";
var swalConfirmText = "Are you sure you want to Delete this record ?";
var swalConfirmButtonText = "Confirm Delete";
var swalConfirmCancelButtonText = "Cancel";

var updating = false;
var originalValue = '';

var baseUrl = 'http://192.168.100.10:55501/api/';
//var baseUrl = 'http://localhost:55500/api/';

// Set the options that I want
toastr.options = {
    "closeButton": true,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
$(function () {    
    //$('#btnListViewFullScreen').click(function () {
    $(document).on('click', '#btnListViewFullScreen', function () {
        let elem = document.documentElement; // Whole page        
        if (
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            // Enter fullscreen
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            $(this).find('i').removeClass('bi-arrows-angle-expand').addClass('bi-arrows-angle-contract');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            $(this).find('i').removeClass('bi-arrows-angle-contract').addClass('bi-arrows-angle-expand');
        }
    });
});
var apiRequest = function (options, dataType = 'JSON', isBockUI = true, isAsync = true) {
    if (isBockUI) {
        $('#loading-overlay').show();
    }
    var accessToken = localStorage.getItem('accessToken');
    var headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    
    var response = {};
    $.ajax({
        headers: headers,
        type: options.type,
        url: baseUrl + options.url,
        data: JSON.stringify(options.data),
        contentType: "application/json; charset=utf-8",
        dataType: 'JSON',
        //xhrFields: { withCredentials: false },
        //global: isBockUI,
        async: true,
        statusCode: {
            401: function () {
            }
        },
        success: function (data, textMessage, xhr) {
            console.log("✅ Success", options.url);
            //response = { data: (data['data'] ? data.data : data), request: xhr };
            response = {
                data: data?.data ?? data,
                request: xhr
            };

            //if (options.callBack) options.callBack(response, options);
        },
        error: function (xhr, status, error) {
            console.log("❌ Error", status, error);
            console.log("Response:", xhr.responseText);
            //debugger;
            if (xhr.status == 401)
                response = { data: null, request: xhr, error: xhr };
            else if (xhr.status == 409)
                response = { data: null, request: xhr, error: xhr.responseJSON.error };
            else if (xhr.status == 404)
                response = { data: null, request: xhr, error: xhr.responseJSON.error };
            
            else
                response = { data: null, request: xhr, error: xhr.responseJSON.errors };
        },
        complete: function () {
            $('#loading-overlay').hide();
            if (options.callBack) options.callBack(response, options);
        }
    });
}
function errorExtractor(error) {
    if (error.request.status == 401) {
        //alert(`You're not authorized or logged in`);
        swal.fire({
            title: `Logout`,
            type: "info",
            text: `Your session has been expired, would you like to re-login`,
            showCancelButton: true,
            confirmButtonText: 'Yes Re-Login',
            cancelButtonText: 'No',
            closeOnConfirm: false,
            closeOnCancel: true
        }).then(
            function (isConfirm) {
                if (isConfirm.value == true) {
                    infoToastr('Staying is blessing &#128519;', 'Thanks &#x270B;');
                    localStorage.clear();
                    redirectToAction('/Auth/Login?ID=', 0, '_blank');

                } else {
                    //swal.fire("Cancelled", "Your operation canceled :)", "error");
                    infoToastr(`We'd love to have you back &#128519;', 'Thanks &#x270B;`);
                }
            });
    }
    else if (error.request.status === 404) {
        infoToastr(error.error, 'info');
    }
    else if (error.request.status == 409) {
        infoToastr(error.error, 'Info');
    }
    //hanlde other generic status codes here
    //validation related status code will be handling in each request internall to show on fields
}
var ajaxRequest = function (options, dataType = 'JSON', isBockUI = true, isAsync = true) {
    $('#loading-overlay').show();
    

    $.ajax({
        //headers: headers,
        type: options.type,
        url: options.url,
        data: JSON.stringify(options.data),
        contentType: "application/json; charset=utf-8",
        dataType: (dataType == null ? 'JSON' : dataType),
        //xhrFields: { withCredentials: true },
        //global: isBockUI,
        async: isAsync,
        statusCode: {
            401: function () {
            }
        },
        success: function (data) {
            if (options.callBack !== '') {
                options.callBack(data, options);
            }
        },
        complete: function () {
            $('#loading-overlay').hide();
        }
    });
}
//var uploadFiles = function (inputID, entity, fKey) {
var uploadFiles = function (options) {
    var fileUpload = $('#' + options.inputID).get(0);
    var files = fileUpload.files;
    var fileData = new FormData();
    var fileSizeInMBs = 0;
    var headers = {};
    var token = $('input[name="__RequestVerificationToken"]').val();
    headers['__RequestVerificationToken'] = token;
    for (var i = 0; i < files.length; i++) {
        fileData.append(files[i].name, files[i]);
        fileSizeInMBs += Math.floor(files[i].size / 1000000);
    }
    var _url = (options.url == null ? '/RealEstate/File/Upload' : options.url);
    if (fileSizeInMBs >= 4) {
        for (var i = 0; i < files.length; i++) {
            var fileData = new FormData();
            fileData.append(files[i].name, files[i]);
            fileData.append('FKey', options.fKey);
            fileData.append('fKeyIdentifier', options.fKeyIdentifier);
            fileData.append('Entity', options.entity);
            fileData.append('FormData', options.formDataJSON);
            $.ajax({
                headers: headers,
                type: 'POST',
                url: _url,
                data: fileData,
                contentType: false,
                processData: false,
                dataType: "JSON",
                xhrFields: { withCredentials: true },
                statusCode: {
                    401: function () {
                    }
                },
                success: function (data) {
                    if (options.callBack !== '') {
                        options.callBack(data, options);
                    }

                },
                complete: function () {
                }
            });
        }
    }
    else {
        fileData.append('FKey', options.fKey);
        fileData.append('fKeyIdentifier', options.fKeyIdentifier);
        fileData.append('Entity', options.entity);
        fileData.append('FormData', options.formDataJSON);
        $.ajax({
            headers: headers,
            type: 'POST',
            url: _url,//'/RealEstate/File/Upload',
            data: fileData,
            contentType: false,
            processData: false,
            dataType: "JSON",
            xhrFields: { withCredentials: true },
            statusCode: {
                401: function () {
                }
            },
            success: function (data) {
                if (options.callBack !== '') {
                    options.callBack(data, options);
                }

            },
            complete: function () {
            }
        });
    }
}
function bindJQueryDropdownList(data, $combo, defaultOption = null, selectedValue = 0, selectedText = null, addNewOption = null) {
    defaultOption = defaultOption == null ? 'Select' : defaultOption;
    $combo.empty();
    if (defaultOption != 'Select') {

        var defaultoption = '';
        if (addNewOption != null) {
            '<option value="-1" style="background-color:green; color:white;"><span>+ Add New</span></option>';
            defaultoption += '<option value="0">' + '' + defaultOption + '' + '</option>';
            defaultoption += '<option value="-1" style="background-color:green; color:white;"><span>+ Add New</span></option>';
        }
        else {
            defaultoption = '<option value="0">' + '' + defaultOption + '' + '</option>';
        }

        $combo.append($(defaultoption));
    }

    isSelected = false;
    $.map(data, function (item) {
        if (item['Value'] != null || item['Value'] != undefined) {
            if (item.Value == selectedValue) {
                isSelected = true;
                $combo.append($('<option selected/>').val(item.Value).text(item.Text));
            }
            else if (item.Text == selectedText) {
                isSelected = true;
                $combo.append($('<option selected/>').val(item.Value).text(item.Text));
            }
            else {
                $combo.append($('<option />').val(item.Value).text(item.Text));
            }
        }
        else {

            if (item.ID == selectedValue) {
                isSelected = true;
                $combo.append($('<option selected/>').val(item.ID).text(item.Description));
            }
            else {
                $combo.append($('<option />').val(item.ID).text(item.Description));
            }
        }
    });
    if (!isSelected) {
        if (selectedValue != 0) {
            $combo.val(selectedValue).change();
        }

    }
    //Check if select has Multiple property
    const isMultiple = $combo.prop('multiple');
    if (isMultiple) {
        $combo.select2({
            width: "100%",
            templateResult: mutiSelectCheckboxFormat,
            closeOnSelect: false
        });
        $combo.on('select2:select select2:unselect', function (e) {
            setTimeout(function () {
                $combo.select2('close').select2('open');
            }, 1);
        });
    }
    let selectIdAttr = $combo.attr("id");
    if (addNewOption != null) {

        $combo.on('select2:open', function (e) {
            $('#coverScreen').show();
            setTimeout(function () {
                $(`#select2-${selectIdAttr}-results li:eq(1)`).html(
                    `<div style='background-color: #e4f7fa;height: 1.7rem; line-height: 1.7rem;padding-left: 2%;'                    
                    >
                        <i class='bi bi-plus-circle'></i>
                            <span style='margin-left: 10px;'>${addNewOption.text}</span>
                    </div>`);

                $('#coverScreen').hide();
            }, 500);
        });
        $combo.on('select2:opening', function () {
            $('#coverScreen').show();
            setTimeout(function () {
                $(`#select2-${selectIdAttr}-results li:eq(1)`).html(
                    `<div style='background-color: #e4f7fa;height: 1.7rem; line-height: 1.7rem;padding-left: 2%;'                    
                    >
                        <i class='bi bi-plus-circle'></i>
                            <span style='margin-left: 10px;'>${addNewOption.text}</span>
                    </div>`);

                $('#coverScreen').hide();
            }, 500);
        });


        $combo.on('select2:select', function (e) {
            if ($(this).val() == '-1') {
                $combo.val(0);
                $combo.change();
                window[addNewOption.function]();
            }
        });
    }

    //set select2 parent form
    $combo.select2({
        dropdownParent: $(`#${$combo.closest('form').attr('id')}`),
        minimumResultsForSearch: 0, width: '100%'
    });
}
var bindJQueryHierarchicalDropdownList = function (inputJSON, $combo, defaultOption = null, selectedValue = 0) {
    defaultOption = defaultOption == null ? 'Select' : defaultOption;
    $combo.empty();
    var defaultoption = '<option value="0">' + '' + defaultOption + '' + '</option>'
    $combo.append($(defaultoption));
    var parentArray = inputJSON.filter(row => row.ParentIDFk === 0);
    $.each(parentArray, function (rowIndex, rowItem) {
        var childArray = inputJSON.filter(row => row.ParentIDFk === rowItem.ParentID);
        if (childArray.length > 0) {
            $combo.append($('<optgroup label="' + rowItem.ParentName + '"/>'));

            $.each(childArray, function (rowIndex, rowItem) {
                if (rowItem.Value == selectedValue) {
                    $combo.append($('<option selected/>').val(rowItem.Value).text(rowItem.Text));
                }
                else {
                    if (rowItem.ToBeAdded <= 0 || rowItem.ToBeAdded == null) {
                        $combo.append($('<option disabled/>').val(rowItem.Value).text(rowItem.Text));
                    }
                    else {
                        $combo.append($('<option/>').val(rowItem.Value).text(rowItem.Text));
                    }
                }
            });
        }
    });

}
var bindJQueryHierarchicalDropdownListParking = function (inputJSON, $combo, defaultOption = null, selectedValue = 0) {
    defaultOption = defaultOption == null ? 'Select' : defaultOption;
    $combo.empty();
    var defaultoption = '<option value="0">' + '' + defaultOption + '' + '</option>'
    $combo.append($(defaultoption));
    var parentArray = inputJSON.filter(row => row.ParentIDFk === 0);
    var options = `<option value="">${defaultOption}</option>`
    $.each(parentArray, function (rowIndex, rowItem) {
        var childArray = inputJSON.filter(row => row.ParentIDFk === rowItem.ParentID);
        if (childArray.length > 0) {
            $combo.append($('<optgroup label="' + rowItem.ParentName + '"/>'));
            options += '<optgroup label="' + rowItem.ParentName + '"></optgroup>';
            $.each(childArray, function (rowIndex, rowItem) {
                if (rowItem.Value == selectedValue) {
                    $combo.append($('<option selected/>').val(rowItem.Value).text(rowItem.Text));
                    options += `<option selected value='${rowItem.Value}'>${rowItem.Text}</option>`;
                }
                else {
                    if (rowItem.ParentName == 'Allocated' || rowItem.ParentIDFk == 2) {
                        $combo.append($('<option disabled/>').val(rowItem.Value).text(rowItem.Text));
                        options += `<option disabled value='${rowItem.Value}'>${rowItem.Text}</option>`;
                    }
                    else {
                        $combo.append($('<option/>').val(rowItem.Value).text(rowItem.Text));
                        options += `<option value='${rowItem.Value}'>${rowItem.Text}</option>`;
                    }
                }
            });
        }
    });
    //$combo.val(selectedValue);
    //$combo.change();
    return options;
}

var customValidateForm = function ($form) {
    var valid = true;
    var thisFieldIsRequired = 'This field is required';
    var minimumValueShouldBe = 'Minimum value should be ';
    $('#' + $form + " input[required],#" + $form + " textarea[required],#" + $form + " select[required]").each(function () {
        if ($(this).parent().hasClass('k-dropdown')) {
            if ($(this).val() == '0') {
                $(this).addClass('invalid');
                $(this).attr('title', thisFieldIsRequired);
                $(this).removeClass("invalid");
                $(this).next("span").remove();
                $(this).after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                valid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).next("span").remove();
            }
        }
        else if ($(this).attr('data-role') == 'datepicker') {

            var dateArray = $(this).val().split('-');
            if ($(this).val() == 'year-month-day'
                || dateArray[0] == 'year'
                || dateArray[1] == 'month'
                || dateArray[2] == 'day') {
                $(this).addClass('invalid');
                $(this).attr('title', thisFieldIsRequired);
                $(this).removeClass("invalid");
                $(this).next("div").remove();
                $(this).after("<div class='row col-md-12'><span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span></div>");
                valid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).next("div").remove();
            }
        }
        else if ($(this).hasClass('bha-datepicker')) {
            if ($(this).val() == '' || $(this).val() == null) {
                $(this).addClass('invalid');
                $(this).attr('title', thisFieldIsRequired);
                $(this).removeClass("invalid");
                $(this).parent("div.position-relative").next("span").remove();
                $(this).parent('div.position-relative').after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                valid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).parent("div.position-relative").next("span").remove();
            }
        }
        else if ($(this).attr('data-role') == 'timepicker') {
            if ($(this).val() == 'hours:minutes AM/PM') {
                $(this).addClass('invalid');
                $(this).attr('title', thisFieldIsRequired);
                $(this).removeClass("invalid");
                $(this).next("div").remove();
                $(this).after("<div class='row col-md-12'><span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span></div>");
                valid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).next("div").remove();
            }
        }
        else if ($(this).hasClass('selector_2')) {
            if ($(this).val() == '0' || $(this).val() == null) {
                $(this).addClass('invalid');
                $(this).attr('title', thisFieldIsRequired);
                $(this).removeClass("invalid");
                $(this).next("span").next("span").remove();
                $(this).next('span').after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                valid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).next("span").next("span").remove();
            }
        }
        else {
            if (!$(this).val() || $(this).val() < "0") {
                /* COMMENTED THIS AFTER NEW DESIGN
                if ($(this).hasClass('selected-date-input')) {

                    $(this).addClass('invalid');
                    $(this).removeClass("invalid");
                    //$(this).next("span").remove();
                    //$(this).parent('.input-group').next("span").remove();
                    $(this).parent('div.bha-mb-vc-box').next('span').remove();
                    $(this).attr('title', thisFieldIsRequired);
                    $(this).parent('div.bha-mb-vc-box').after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                    valid = false;
                }                
                else {
                    
                    if ($(this).closest("div.input-group").length) {
                        //$(this).addClass('invalid');
                        //$(this).removeClass("invalid");
                        //$(this).next("span").remove();
                        //$(this).attr('title', thisFieldIsRequired);
                        //$(this).next("div").after("span").remove();

                        $(this).closest("div.input-group").after("<span style='color: red; font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                    } else {
                        
                        $(this).addClass('invalid');
                        $(this).removeClass("invalid");
                        $(this).next("span").remove();
                        $(this).attr('title', thisFieldIsRequired);
                        $(this).after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                        
                    }
                    valid = false;
                    
                    
                }
                */
                //| ADDED THIS AFTER NEW DESIGN
                $(this).addClass('invalid');
                $(this).removeClass("invalid");
                $(this).next("span").remove();
                $(this).attr('title', thisFieldIsRequired);
                $(this).after("<span style='color:red;font-size: 0.75rem !important;'>" + thisFieldIsRequired + "</span>");
                valid = false;

            } else {
                $(this).removeClass("invalid");
                $(this).next("span").remove();
                if ($(this).hasClass('datepicker')) {

                    $(this).parent('.input-group').next("span").remove();
                }

                if ($(this).closest("div.input-group").length) {
                    $(this).closest("div.input-group").next("span").remove();
                }
                if ($(this).hasClass('selected-date-input')) {
                    $(this).closest('div.bha-mb-vc-box').next('span').remove()
                }




            }
        }
        //maxlength       
        //var minimumValueShouldBe = 'Minimum value should be ' + $(this).attr('min') ;
        //if ($(this).val() && typeof $(this).attr('min') !== 'undefined' && $(this).attr('min') !== false) {
        //    if ($(this).val() < $(this).attr('min')) {
        //        //alert($(this).attr('min') + ' ' + $(this).attr('name'));
        //        $(this).addClass('invalid');
        //        $(this).removeClass("invalid");
        //        $(this).next("span").remove();
        //        $(this).attr('title', minimumValueShouldBe);
        //        $(this).after("<span style='color:red;'>" + minimumValueShouldBe + "</span>");
        //        valid = false;
        //    }
        //    else {
        //        $(this).removeClass("invalid");
        //        $(this).next("span").remove();
        //    }
        //}

    });
    if (valid) {
        $('#' + $form + " input[required],#" + $form + " textarea[required],#" + $form + " select[required]").each(function () {

            //min validation
            if (typeof $(this).attr('minlength') !== 'undefined' && $(this).attr('minlength') !== false) {
                if ($(this).val().length < $(this).attr('minlength')) {
                    //alert($(this).attr('min') + ' ' + $(this).attr('name'));
                    $(this).addClass('invalid');
                    $(this).removeClass("invalid");
                    $(this).next("span").remove();
                    $(this).attr('title', minimumValueShouldBe);
                    $(this).after("<span style='color:red;'>" + minimumValueShouldBe + " " + $(this).attr('minlength') + "</span>");
                    valid = false;
                }
                else {
                    $(this).removeClass("invalid");
                    $(this).next("span").remove();
                }
            }
        });
    }
    if (!valid) {
        infoToastr('Required field(s) missing', 'info');
    }
    return valid;
}
var getFormDataAsJSONObject = function ($form, appendObject = null) {
    var responseJSONObject = appendObject == null ? {} : appendObject;
    //$('#' + $form + " input[required],#" + $form + " textarea[required],#" + $form + " select[required]").each(function () {
    //$('#' + $form).find(':input[type=text],input[type=checkbox],input[type=hidden], textarea[type=text]').each(function () {
    $('#' + $form).find(':input, textarea').each(function () {

        if ($(this).attr('type') == 'checkbox') {
            responseJSONObject[$(this).attr('id')] = $(this).is(':checked');
        }
        else {
            if ($(this).attr('type') != 'button') {
                responseJSONObject[$(this).attr('id')] = $(this).val();
            }
        }
    });
    return responseJSONObject;
}

function setResponseToFormInputs(response, excludedArray = [], isAlreadyParsed = true, isTextProperty = false) {

    var JSONObject = isAlreadyParsed == true ? response : JSON.parse(response);
    $.each(JSONObject, function (key, value) {
        if ($.inArray(key, excludedArray) == -1) {

            $('#' + key).val(value);
            if ($('#' + key).is('textarea')) {
                $('#' + key).text(value);
            }
            if ($('#' + key).is('select')) {
                $('#' + key).change();
            }
            if ($('#' + key).is(':checkbox')) {
                if (value == true) {
                    $('#' + key).prop('checked', true);
                }
            }
            if ($('#' + key).hasClass('selected-date-input')) {
                if (value != null) {
                    //$('#' + key).datepicker("setDate", getFormattedDate(value));
                    $('#' + key).val(getFormattedDate(value));

                }
            }
            if ($('#' + key).hasClass('bha-datepicker')) {
                if (value != null) {
                    $('#' + key).datepicker("setDate", getFormattedDate(value));
                }
            }
        }

    });
}
function setResponseToFormInputsWithFormID(response, formId = null, excludedArray = [], isAlreadyParsed = true, isTextProperty = false) {
    var JSONObject = isAlreadyParsed == true ? response : JSON.parse(response);
    $.each(JSONObject, function (key, value) {
        if ($.inArray(key, excludedArray) == -1) {
            var selector = formId ? `#${formId} #${key}` : `#${key}`;

            $(selector).val(value);
            if ($(selector).is('textarea')) {
                $(selector).text(value);
            }
            if ($(selector).is('select')) {
                $(selector).change();
            }
            if ($(selector).is(':checkbox')) {
                if (value == true) {
                    $(selector).prop('checked', true);
                }
            }
            if ($(selector).hasClass('datepicker')) {
                if (value != null) {
                    $(selector).datepicker("setDate", getFormattedDate(value));
                }
            }
        }
    });
}
function capitalizeFirstLetter(string) {

    return string.charAt(0).toUpperCase() + string.slice(1);
}

var _response = [], _tableId = null, _detailViewLink = null, _linkKey = null, _target = null, _isLinkKeyEncrypted = true, _actionColumn = null, _numericFields = [];
function generateTableRowsFromJSON(response, tableId, detailViewLink = null, linkKey = null, target = null, isLinkKeyEncrypted = true, actionColumn = null, numericFields = []) {

    _response = response;
    _tableId = tableId;
    _detailViewLink = detailViewLink;
    _linkKey = linkKey;
    _target = target;
    _isLinkKeyEncrypted = isLinkKeyEncrypted;
    _actionColumn = actionColumn;
    _numericFields = numericFields;

    let dataColumn = 0;
    let $filterRow = $(`#${tableId} thead tr.bha-th1`);
    $filterRow.html('<th  hidden></th>');

    let filterSelectIDs = null;
    $.each(response[0], function (key, value) {
        if (key != 'id') {
            dataColumn += 1;
            $filterRow.append(getFilterTH(tableId, key, dataColumn));
            filterSelectIDs = (filterSelectIDs + `, #Filter${key}`);

        }
    });
    $filterRow.append('<th class="FilterAction"></th>');
    $filterRow.append('<th  hidden></th>');

    var table = $(`#${tableId}`).DataTable();
    table.clear();

    $(filterSelectIDs).html("");
    $(filterSelectIDs).append
        ($('<option  selected  value="All">All</option>').val('').html("All"));


    let tr = generate_tr(response, tableId, detailViewLink, linkKey, target, isLinkKeyEncrypted, actionColumn, numericFields);
    table.rows.add($(tr));
    table.draw();
    // | Convert to Select2
    $(`select.${filterSelectIDs}`).select2({
        width: "100%",
        placeholder: "All",

        minimumResultsForSearch: 0,
    });
    $(".mutiple_sel").select2({ width: "style" });

    // | Reduce height for each Filter select2
    $.each(response[0], function (key, value) {
        let idAttr = `#select2-Filter${key}-container`;
        $(idAttr).parent('span').css('height', '30px');
        $(idAttr).css('padding-top', '0px');
    });
    // | Reduce height for each Filter select2


    $(`#${tableId} thead tr.bha-th th`).each(function () {
        const headerText = $(this).text().trim();

        if (headerText === 'Action') {
            // Remove sorting icons (sorting classes)
            $(this).removeClass('sorting sorting_asc sorting_desc');

            // Remove sorting click behavior
            $(this).off('click');

            // Optional: disable the sort attribute if present
            $(this).removeAttr('aria-sort');

            // Optional: remove the sort icon span if you want
            $(this).find('span').remove();
        }
    });
    /*
    var tableRow = null;

    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $('[data-toggle="tooltip"]').tooltip({ html: true });
    //var table = null;
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        //$("#" + tableId).DataTable().destroy();        
    }
    else {
        table = $("#" + tableId).DataTable({
            rowReorder: true
            ,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'copyHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
                {
                    extend: 'print',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-print"></i> Print',
                    titleAttr: 'Print'
                }

            ], order: [[1, 'asc']]
        });

    }
    table.clear();
    $.each(response, function (rowIndex, dataObject) {
        tableRow = tableRow = "<tr class='gradeA'><td hidden>" + dataObject.ID + "</td>" +
            "<td  style='text-align:center; padding-right:40px;'>" + (rowIndex + 1) + "</td>";
        $.each(dataObject, function (key, value) {
            if (key == 'ID') {
                return true;
            }
            if ($.isArray(linkKey)) {
                var isKeyFoundInArray = false;
                $.each(linkKey, function (rowIndex, rowItem) {
                    if (key == 'PropertyID' || key == rowItem) {
                        isKeyFoundInArray = true;
                        //tableRow += "<td> <a href="+detailViewLink+">" + (value == null ? '' : value) + "</a></td>";
                        if (isLinkKeyEncrypted[rowIndex]) {
                            tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                        }
                        else {
                            tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                        }
                    }

                });
                if (!isKeyFoundInArray) {
                    if ($.inArray(key, numericFields) >= 0) {
                        tableRow += "<td style='text-align:right;padding-right: 3rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                    }
                    else {
                        tableRow += "<td>" + (value == null ? '' : value) + "</td>";
                    }

                }

            }
            else {
                if (key == 'PropertyID' || key == linkKey) {
                    //tableRow += "<td> <a href="+detailViewLink+">" + (value == null ? '' : value) + "</a></td>";
                    if (isLinkKeyEncrypted) {
                        tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                    }
                    else {
                        tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                    }
                }
                else {
                    if ($.inArray(key, numericFields) >= 0) {
                        tableRow += "<td style='text-align:right;padding-right: 3rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                    }
                    else {
                        tableRow += "<td>" + (value == null ? '' : value) + "</td>";
                    }
                    //tableRow += "<td>" + (value == null ? '' : value) + "</td>";
                }
            }

        });


        tableRow +=
            "<td style='text-align:center'>" +
            " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
            "<i class='icon s7-menu dropdown-toggle'></i></a>" +
            "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
            "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
            "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
            "</div ></div ></div></td></tr>";

        table.row.add($(tableRow));
    });
    table.draw();

    table.buttons().container().appendTo($('#printbar'));
    $('.dataTables_filter').css('margin-bottom', '0px');
    */

}
function generate_tr(response = [], isCheckBox = true) {
    let tr = '';
    var table = $(`#${_tableId}`).DataTable();
    table.clear();
    $.each(response, function (rowIndex, rowItem) {

        let columnIndex = 0;
        tr += '<tr class="bha-tr-first">';
        for (const key in response[0]) {
            let cellValue = rowItem[key] ?? '';
            let thHidden = $(`#th${key}`).attr('hidden') !== undefined == true ? 'hidden' : '';
            const isLinkKey = key === _linkKey;
            // | Add green class if it's Link Key
            const greenClass = isLinkKey ? 'green' : '';

            // | Cursor should be Pointer on a Link Column/td
            let tdClickHandler = '', curserAsPointer = 'cursor: default;';

            // | If it's a numeric field then should be right aligned
            let isNumericField = ($.inArray(key, _numericFields) >= 0);
            let textRight = isNumericField == true ? 'text-end' : '';

            cellValue = isNumericField == true ? addThousandSeperator(cellValue) : cellValue;
            if (isLinkKey) {
                curserAsPointer = 'cursor: pointer;';
                _target = _target == null ? '' : _target;

                const functionName = _isLinkKeyEncrypted ? `redirectToAction('${_detailViewLink}',${rowItem.id},'${_target}')`
                    : `redirectToActionPlainId('${_detailViewLink}',${rowItem.id},'${_target}')`;
                tdClickHandler = `onclick="${functionName}"`;
            }
            if (key == 'id') {
                tr += `
                    <td class="td${key}" hidden>${cellValue}</td>
                  `
            }
            else {
                if (columnIndex === 1 && isCheckBox) {
                    tr += `
                        <td class='checkbox-cell bha-td ${greenClass} td${key}' style='white-space: nowrap; vertical-align: middle;'                        
                        ${thHidden}>
                            <label class='bhacheckbox'>
                                <input type ='checkbox' onclick = 'toggleHighlight(this)'>
                                    <span class='bhacheckmark'></span>
                            </label>
                            <span class='ms-4 ${textRight} td${key}Span'   ${tdClickHandler}
                            style="${curserAsPointer}">${rowItem[key]}</span>
                        </td>
                      `
                }
                else {
                    tr += `
                           <td class='bha-td ${greenClass} ${textRight} td${key}' ${tdClickHandler} style="${curserAsPointer}"
                           ${thHidden}>${cellValue}</td>
                         `
                }
            }
            columnIndex += 1;

        };
        //View button
        //<li><a class='dropdown-item bha-contents-dropdown authorizeOrNotUpdate' href='#' onclick='modifyRecord("${rowItem.ID},${rowIndex}");'><i class='bi bi-eye fs-6' style='color:#CEC738E5;'></i>&nbsp;&nbsp;&nbsp;View</a></li>
        let thActionHidder = $(`#${_tableId} #thAction`).attr('hidden') !== undefined == true ? 'hidden' : '';
        tr += `<td class="tdAction text-center" ${thActionHidder}>
                    <div class='dropdown bha-dropdown'>
                    <button class='btn bha-button' type ='button' data-bs-toggle='dropdown' aria-expanded='false'>
                    <i class='bi bi-three-dots-vertical'></i></button>
                    <ul class='dropdown-menu bha-dropdown-menu'>

                    <li><a class="dropdown-item bha-contents-dropdown authorizeOrNotUpdate" href="#"  onclick='modifyRecord(${JSON.stringify(rowItem)},${rowItem.id},${rowIndex});'><i class="bi bi-pencil fs-6 " style="color:#007E87;"></i>&nbsp;&nbsp;&nbsp;Edit</a></li>
                    <li><a class="dropdown-item bha-contents-dropdown  authorizeOrNotDelete"  href="#" onclick='deleteRecord(${JSON.stringify(rowItem)}, ${rowItem.id},${rowIndex});'><i class="bi bi-trash3 fs-6" style="color:#FF2D55;"></i>&nbsp;&nbsp;&nbsp;Delete</a></li>
                    </ul></div></td></tr>`

        //$(`#${tableId} tbody`).append(tr);

    });
    renderFilterSelect(response);
    setupColumnTogglesWithjQuery(_tableId);
    setupFiltersWithjQuery(_tableId, response);

    let thActionHidden = $(`#${_tableId} #thAction`).attr('hidden') !== undefined == true ? 'hidden' : '';
    if (thActionHidden == 'hidden') {
        $('.FilterAction').css('display', 'none');
    }
    return tr;
}

function generateTableRowsExcludeHiddenHeaderFromJSON(response, tableId, detailViewLink = [], linkKey = [], target = [], isLinkKeyEncrypted = [], numericFields = [], printbarID = null) {
    var tableRow = null;
    //$('#' + tableId + ' tbody').html('');
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        //$("#" + tableId).DataTable().destroy();        
    }
    else {
        table = $("#" + tableId).DataTable({
            rowReorder: true,
            //scrollCollapse: true,
            //scrollY: "200px"
            //,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'copyHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
                {
                    extend: 'print',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-print"></i> Print',
                    titleAttr: 'Print'
                }

            ]
        });

    }
    table.clear();
    var pkValue = 0;
    var tdId = 'td';
    $.each(response, function (rowIndex, dataObject) {
        tableRow = "<tr class='gradeA'>";
        //var columnIndex = startIndex;        
        //for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length; columnIndex++) {
        for (var columnIndex = 0; columnIndex < $('#' + tableId + ' th').length; columnIndex++) {
            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');
            thID = thID.replace('th', '');

            $.each(dataObject, function (key, value) {
                tdId = 'td';

                if (thID == 'SerialNo') {
                    tdId = tdId + '' + thID;
                    if (isHidden) {
                        tableRow += "<td hidden style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    } else {
                        tableRow += "<td  style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    }
                    //columnIndex += 1;
                    return false;
                }
                if (thID == key) {
                    tdId = tdId + '' + thID
                    if (isHidden) {
                        tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    else {
                        var isKeyFoundInArray = false;
                        $.each(linkKey, function (rowIndex, rowItem) {
                            if (rowItem == key) {
                                isKeyFoundInArray = true;
                                if (isLinkKeyEncrypted[rowIndex]) {
                                    tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                }
                                else {
                                    tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                }
                            }
                        });

                        if (!isKeyFoundInArray) {
                            if ($.inArray(key, numericFields) >= 0) {
                                tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 3rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                            }
                            else {
                                tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                            }
                        }
                    }
                    return false;
                }
                tdId = 'td';

            });
            //columnIndex += 1;
        };
        var isHiddenAction = $('#' + tableId + ' th:eq(' + ($('#' + tableId + ' th').length - 1) + ')').prop('hidden');


        if (isHiddenAction) {
            tableRow +=
                "<td hidden class='tdAction'>" +
                "</td></tr>";
        }
        else {
            /*
            tableRow +=
                "<td style='text-align:center' class='tdAction'>" +
                " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
            "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + "," + JSON.stringify(dataObject) + ");'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                "</div ></div ></div></td></tr>";
                */
            tableRow +=
                "<td style='text-align:center;' class='tdAction'>" +
                " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                "</div ></div ></div></td></tr>";
        }




        table.row.add($(tableRow));
    });


    printbarID = printbarID == null ? 'printbar' : printbarID;
    table.draw();



    $('#' + printbarID).html('');
    //table.buttons().container().appendTo($('#printbar'));
    //$('.dataTables_filter').css('margin-bottom', '0px');
    table.buttons().container().appendTo($('#' + printbarID));
    $('.dataTables_filter').css('margin-bottom', '0px');

}
function generateTableRowsFromJSONWithoutActions(response, tableId, detailViewLink = null, linkKey = null, target = null, isLinkKeyEncrypted = true) {
    var tableRow = null;

    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $('[data-toggle="tooltip"]').tooltip({ html: true });
    //var table = null;
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        $("#" + tableId).DataTable().destroy();
    }
    else {
        table = $("#" + tableId).DataTable({
            rowReorder: true
            ,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'copyHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
                {
                    extend: 'print',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-print"></i> Print',
                    titleAttr: 'Print'
                }
            ], order: [[1, 'asc']]
        });

    }
    table.clear();
    $.each(response, function (rowIndex, dataObject) {
        tableRow = tableRow = "<tr class='gradeA'><td hidden>" + dataObject.ID + "</td>" +
            "<td  style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
        $.each(dataObject, function (key, value) {
            if (key == 'ID') {
                return true;
            }
            if ($.isArray(linkKey)) {
                var isKeyFoundInArray = false;
                $.each(linkKey, function (rowIndex, rowItem) {
                    if (key == 'PropertyID' || key == rowItem) {
                        isKeyFoundInArray = true;
                        //tableRow += "<td> <a href="+detailViewLink+">" + (value == null ? '' : value) + "</a></td>";
                        if (isLinkKeyEncrypted[rowIndex]) {
                            tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                        }
                        else {
                            tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                        }
                    }

                });
                if (!isKeyFoundInArray) {
                    tableRow += "<td>" + (value == null ? '' : value) + "</td>";
                }

            }
            else {
                if (key == 'PropertyID' || key == linkKey) {
                    //tableRow += "<td> <a href="+detailViewLink+">" + (value == null ? '' : value) + "</a></td>";
                    if (isLinkKeyEncrypted) {
                        tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                    }
                    else {
                        tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                    }
                }
                else {
                    tableRow += "<td>" + (value == null ? '' : value) + "</td>";
                }
            }

        });
        //tableRow +=
        //    "<td style='text-align:center'>" +
        //    " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
        //    "<i class='icon s7-menu dropdown-toggle'></i></a>" +
        //    "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
        //    "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
        //    "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
        //    "</div ></div ></div></td></tr>";


        table.row.add($(tableRow));
    });
    table.draw();

    table.buttons().container().appendTo($('#printbar'));
    $('.dataTables_filter').css('margin-bottom', '0px');

}
function generateHTMLTableRowsFromJSON(response, tableId, editFunction, deleteFunction, detailViewLink = null, linkKey = null, target = null, isLinkKeyEncrypted = null, numericFields = []) {

    var tableRow = null;
    $('#' + tableId + ' tbody').html('');
    var pkValue = 0;
    var tdId = 'td';

    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        $("#" + tableId).DataTable().clear();
        $("#" + tableId).DataTable().destroy();
    }
    $.each(response, function (rowIndex, dataObject) {
        pkValue = dataObject.id;
        tableRow = "<tr class='gradeA'>";
        for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length; columnIndex++) {

            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');
            if (thID) {
                thID = thID.replace('th', '');
                $.each(dataObject, function (key, value) {
                    if (thID == 'SerialNo') {
                        if (isHidden) {
                            tableRow += "<td hidden class='tdSerialNo'  style='text-align:left;padding-left: 5px !important;'>" + (rowIndex + 1) + "</td>";
                        }
                        else {
                            tableRow += "<td class='tdSerialNo'  style='text-align:left;padding-left: 5px !important;'>" + (rowIndex + 1) + "</td>";

                        }
                        return false;
                    }
                    if (thID == key) {
                        tdId = tdId + '' + thID
                        if (isHidden) {
                            tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                        }
                        else {
                            if ($.isArray(linkKey)) {
                                var isKeyFoundInArray = false;
                                $.each(linkKey, function (rowIndex, rowItem) {
                                    if (key == rowItem) {
                                        isKeyFoundInArray = true;

                                        let _isLinkKeyEncrypted = $.isArray(isLinkKeyEncrypted) == true ? isLinkKeyEncrypted[rowIndex] : isLinkKeyEncrypted;
                                        let _target = $.isArray(target) == true ? target[rowIndex] : target;
                                        if (_isLinkKeyEncrypted) {
                                            tableRow += "<td> <a class='green' style='text-decoration:none;'  href='#' onclick='redirectToAction(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + _target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                        }
                                        else {
                                            tableRow += "<td> <a class='green' style='text-decoration:none;' href='#' onclick='redirectToActionPlainId(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + _target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                        }
                                    }
                                });
                                if (!isKeyFoundInArray) {
                                    if ($.inArray(key, numericFields) >= 0) {
                                        tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 1rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                                    }
                                    else {
                                        tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                                    }

                                }
                            }
                            else if (key == linkKey) {
                                if (isLinkKeyEncrypted) {
                                    tableRow += "<td> <a class = 'green' style='text-decoration:none;'  href='#' onclick='redirectToAction(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                }
                                else {
                                    tableRow += "<td> <a class = 'green' style='text-decoration:none;' href='#' onclick='redirectToActionPlainId(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                }
                            }
                            else {
                                if ($.inArray(key, numericFields) >= 0) {
                                    tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 1rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                                }
                                else {
                                    tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                                }
                            }
                            tdId = 'td';
                            return false;
                        }
                    }
                    tdId = 'td';
                });
            }
        };
        var isHiddenAction = $('#' + tableId + ' th:eq(' + (Object.keys(dataObject).length + 1) + ')').prop('hidden');

        if (!isHiddenAction) {
            isHiddenAction = $('#' + tableId + ' thead tr #thAction').prop('hidden');
        }
        if (isHiddenAction) {
            tableRow +=
                "<td class='tdAction' hidden>" +
                "</td></tr>";
        }
        else {
            var tableRow1 =
                `
                <td style='text-align:center' class='tdAction' >
                <div class='dropdown bha-dropdown'>
                <button class='btn bha-button' type ='button' data-bs-toggle='dropdown' aria-expanded='false'>
                <i class='bi bi-three-dots-vertical'></i>
                </button>
                <ul class='dropdown-menus bha-dropdown-menus'>
                <li><a class="dropdown-item bha-contents-dropdown authorizeOrNotUpdate" href="#"  onclick='${editFunction}(${JSON.stringify(dataObject)},${pkValue},${rowIndex});'><i class="bi bi-pencil fs-6 " style="color:#007E87;"></i>&nbsp;&nbsp;&nbsp;Edit</a></li>
                <li><a class="dropdown-item bha-contents-dropdown  authorizeOrNotDelete"  href="#" onclick='${deleteFunction}(${JSON.stringify(dataObject)},${pkValue},${rowIndex});'><i class="bi bi-trash3 fs-6" style="color:#FF2D55;"></i>&nbsp;&nbsp;&nbsp;Delete</a></li>
                </ul>
                </div>

                </td ></tr>
                `;

            tableRow += `<td class="tdAction text-center">
                    <div class='dropdown bha-dropdown'>
                    <button class='btn bha-button' type ='button' data-bs-toggle='dropdown' aria-expanded='false'>
                    <i class='bi bi-three-dots-vertical'></i></button>
                    <ul class='dropdown-menu bha-dropdown-menu'>

                    <li><a class="dropdown-item bha-contents-dropdown authorizeOrNotUpdate" href="#"  onclick='${editFunction}(${JSON.stringify(dataObject)},${dataObject.id},${rowIndex});'><i class="bi bi-pencil fs-6 " style="color:#007E87;"></i>&nbsp;&nbsp;&nbsp;Edit</a></li>
                    <li><a class="dropdown-item bha-contents-dropdown  authorizeOrNotDelete"  href="#" onclick='${deleteFunction}(${JSON.stringify(dataObject)}, ${dataObject.id},${rowIndex});'><i class="bi bi-trash3 fs-6" style="color:#FF2D55;"></i>&nbsp;&nbsp;&nbsp;Delete</a></li>
                    </ul></div></td></tr>`
            /*
            "<td style='text-align:center' class='tdAction' >" +
            " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
            "<i class='icon s7-menu dropdown-toggle'></i></a>" +
            "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
            "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + pkValue + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
            "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
            "</div ></div ></div>"+
            "</td ></tr> ";
            */

        }
        if ($(`#${tableId}`).find('tbody').length > 0) {
            $('#' + tableId + ' tbody').append(tableRow);
        }
        else {
            $(`#${tableId}`).append('<tbody></tbody>');
            $('#' + tableId + ' tbody').append(tableRow);
        }


    });

}
function generateHTMLTableRowsFromJSONOnlyDeleteAction(response, tableId, detailViewLink = null, target = null, tableKeyColumn = null, startIndex = 0) {
    var tableRow = null;
    $('#' + tableId + ' tbody').html('');
    var pkValue = 0;
    var tdId = 'td';
    $.each(response, function (rowIndex, dataObject) {
        pkValue = tableKeyColumn == null ? dataObject.ID : dataObject[tableKeyColumn];
        //tableRow = tableRow = "<tr class='gradeA'><td hidden>" + pkValue + "</td>" +
        //   "<td  style='text-align:left'>" + (rowIndex + 1) + "</td>";
        tableRow = "<tr class='gradeA'>";
        //var columnIndex = startIndex;        
        for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length; columnIndex++) {
            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');
            thID = thID.replace('th', '');
            $.each(dataObject, function (key, value) {
                if (thID == 'SerialNo') {
                    tableRow += "<td  style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    //columnIndex += 1;
                    return false;
                }
                if (thID == key) {
                    tdId = tdId + '' + thID
                    if (isHidden) {
                        tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    else {
                        tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    return false;
                }
                tdId = 'td';

            });
            //columnIndex += 1;
        };
        var isHiddenAction = $('#' + tableId + ' th:eq(' + (Object.keys(dataObject).length + 1) + ')').prop('hidden');
        if (isHiddenAction) {
            tableRow +=
                "<td hidden'>" +
                "</td></tr>";
        }
        else {
            tableRow +=
                "<td style='text-align:center'>" +
                " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + "," + JSON.stringify(dataObject) + ");' type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                "</div ></div ></div></td></tr>";
            //"<td><button type='button' class='btn bg-danger btn-sm' style='color: white; padding: 0;width: 2.38rem;height: 2.38rem;padding-top: 0.2rem;' onclick='deleteRecord(" + pkValue + "," + rowIndex + "," + JSON.stringify(dataObject) + ");');>X</button></td>"

        }


        $('#' + tableId + ' tbody').append(tableRow);
    });

}
function generateHTMLTableRowsFromJSONWithCheckbox(response, tableId, detailViewLink = null, target = null, tableKeyColumn = null, startIndex = 0, checkboxFunction = null, numericFields = [], actionColumn = null) {
    var tableRow = null;
    $('#' + tableId + ' tbody').html('');
    var pkValue = 0;
    var tdId = 'td';
    $.each(response, function (rowIndex, dataObject) {
        pkValue = tableKeyColumn == null ? dataObject.ID : dataObject[tableKeyColumn];
        //tableRow = tableRow = "<tr class='gradeA'><td hidden>" + pkValue + "</td>" +
        //   "<td  style='text-align:left'>" + (rowIndex + 1) + "</td>";
        tableRow = "<tr class='gradeA'>";
        //var columnIndex = startIndex;        
        //for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length; columnIndex++) {
        for (var columnIndex = 0; columnIndex < $('#' + tableId + ' th').length; columnIndex++) {
            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');
            thID = thID.replace('th', '');

            $.each(dataObject, function (key, value) {
                tdId = 'td';
                if (thID == 'Checkbox') {
                    tdId = tdId + '' + thID;
                    if (checkboxFunction == null) {
                        tableRow += "<td class='" + tdId + "'><input class='form-check-input " + tdId + rowIndex + "' type='checkbox' id='" + tableId + tdId + rowIndex + "' name='leaseTermCheckbox' onclick='checkBoxClicked($(this)," + rowIndex + "," + JSON.stringify(dataObject) + ");' style='font-size:16px;'/></td>";
                    }
                    else {
                        tableRow += "<td class='" + tdId + "'><input class='form-check-input " + tdId + rowIndex + "' type='checkbox' id='" + tableId + tdId + rowIndex + "' name='leaseTermCheckbox' onclick='" + checkboxFunction + "($(this)," + rowIndex + "," + JSON.stringify(dataObject) + ");' style='font-size:16px;'/></td>";
                    }

                    //tableRow += "<td class='" + tdId + "'><label class='custom-control custom-control-md custom-checkbox'><input class='custom-control-input " + tdId + rowIndex + "' type='checkbox' id='" + tdId + rowIndex + "' name='leaseTermCheckbox' onclick='checkBoxClicked($(this)," + rowIndex + "," + JSON.stringify(dataObject) + ");'/><span class='custom-control-label'></span></label></td>";
                    return false;
                }

                if (thID == 'SerialNo') {
                    tdId = tdId + '' + thID;
                    tableRow += "<td  style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    //columnIndex += 1;
                    return false;
                }
                if (thID == key) {
                    tdId = tdId + '' + thID
                    if (isHidden) {
                        tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    else {
                        if ($.inArray(key, numericFields) >= 0) {
                            tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 1rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                        }
                        else {
                            tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                        }

                    }
                    return false;
                }
                tdId = 'td';

            });
            //columnIndex += 1;
        };
        var isHiddenAction = $('#' + tableId + ' th:eq(' + ($('#' + tableId + ' th').length - 1) + ')').prop('hidden');

        /*
        if (isHiddenAction) {
            tableRow +=
                "<td hidden'>" +
                "</td></tr>";
        }
        else {
            tableRow +=
                "<td style='text-align:end'>" +
                " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + "," + JSON.stringify(dataObject) + ");'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                "</div ></div ></div></td></tr>";

        }
        */

        if (actionColumn == null) {
            //tableRow +=
            //    "<td style='text-align:center'>" +
            //    " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
            //    "<i class='icon s7-menu dropdown-toggle'></i></a>" +
            //    "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
            //    "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
            //    "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
            //    "</div ></div ></div></td></tr>";
            tableRow +=
                "<td hidden>" +
                "</td></tr>";
        }
        else {

            var actionButtons = '';
            $.each(actionColumn, function (rowIndex, rowValue) {

                if (rowValue.key == 'OnlyDelete') {
                    var deleteFunction = tableId + 'DeleteRecord';
                    /*
                    tableRow +=
                        "<td class='text-center'>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Remove this row'>" +
                        "<button type='button' class='btn bg-danger btn-sm' style='color: white;padding: 0; width: 1.8rem; height: 1.7rem;padding - top: -9px; content: transparent; font - size: 1.4rem; padding: 0px; padding - top: -1px; margin - top: 0px;' onclick='" + deleteFunction + "(" + pkValue + "," + rowIndex + "," + JSON.stringify(dataObject) + ");');>" +
                        "<i class='fa fa-times' style='padding:0; padding-top:3px;'></i>" +
                        "</button>" +
                        "</span>" +
                        "</td></tr>"
                        */
                    tableRow +=
                        "<td class='text-center'>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Remove this row'>" +
                        "<i class='bi bi-x-circle fs-6 text-danger fs-6 cursor-pointer' onclick='" + deleteFunction + "(" + pkValue + "," + rowIndex + "," + JSON.stringify(dataObject) + ");');></i>" +
                        "</span>" +
                        "</td></tr>"
                        ;

                }
                else if (dataObject[rowValue.key] == rowValue.value) {

                    $.each(rowValue.actions, function (rowIndexAction, rowItemAction) {
                        if (rowItemAction.action == 'edit') {
                            actionButtons +=
                                "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>";
                        }
                        else if (rowItemAction.action == 'delete') {
                            actionButtons +=
                                "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>";
                        }
                        else { //if (rowItemAction.action == 'rentInvoice') {
                            if (rowItemAction.isIDEncrypted) {
                                actionButtons +=
                                    "<span class='red-tooltip' data-toggle='tooltip' title='" + rowItemAction.text + "'><button onclick='redirectToAction(\"" + rowItemAction.url + "\"," + dataObject.ID + ",\"" + rowItemAction.target + "\")' type='button' class='btn " + rowItemAction.button + " btn-sm authorizeOrNotDelete'  style='color:white;margin-left:1px;'><b><i class='" + rowItemAction.icon + "'></i></b></button></span>";;
                            }
                            else {
                                actionButtons +=
                                    "<span class='red-tooltip' data-toggle='tooltip' title='" + rowItemAction.text + "'><button onclick='redirectToActionPlainId(\"" + rowItemAction.url + "\"," + dataObject.ID + ",\"" + rowItemAction.target + "\")' type='button' class='btn " + rowItemAction.button + " btn-sm authorizeOrNotDelete'  style='color:white;margin-left:1px;'><b><i class='" + rowItemAction.icon + "'></i></b></button></span>";;
                            }

                        }

                        //actionButtons +=
                        //    "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                        //    "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>";
                    });
                    tableRow +=
                        "<td style='text-align:center'>" +
                        "<div class='list-icons'>" +
                        "<div class='dropdown hide '>" +
                        "<a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                        "<i class='icon s7-menu dropdown-toggle'></i>" +
                        "</a>" +
                        "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                        actionButtons
                    "</div>" +
                        "</div>" +
                        "</div>" +
                        "</td>" +
                        "</tr>";
                    //"<td style='text-align:center'></td>" +
                    //"<td style='text-align:center'></td>"
                }
                //else {
                //    tableRow +=
                //        "<td style='text-align:center'>" +
                //        " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                //        "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                //        "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                //        "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + dataObject.ID + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                //        "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + dataObject.ID + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                //        "</div ></div ></div></td></tr>";
                //}
            })
        }

        $('#' + tableId + ' tbody').append(tableRow);
    });

}
function generateHTMLTableWithRowsClickFromJSON(response, tableId, detailViewLink = null, target = null, tableKeyColumn = null, startIndex = 0) {
    var tableRow = null;
    $('#' + tableId + ' tbody').html('');
    var pkValue = 0;
    var tdId = 'td';
    $.each(response, function (rowIndex, dataObject) {
        pkValue = tableKeyColumn == null ? dataObject.ID : dataObject[tableKeyColumn];
        tableRow = "<tr onclick='tableRowSelectEvent(" + JSON.stringify(dataObject) + ");'>";
        //for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length+1; columnIndex++) {
        for (var columnIndex = 0; columnIndex < $('#' + tableId + ' th').length; columnIndex++) {
            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');
            thID = thID.replace('th', '');
            $.each(dataObject, function (key, value) {
                if (thID == 'SerialNo') {
                    if (isHidden) {
                        tableRow += "<td hidden style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    }
                    else {
                        tableRow += "<td  style='text-align:center'>" + (rowIndex + 1) + "</td>";
                    }


                    return false;
                }
                else if (thID == key) {
                    tdId = tdId + '' + thID
                    if (isHidden) {
                        tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    else {
                        if (isHidden) {
                            tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                        }
                        else {
                            tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                        }
                    }
                    //return false;
                }

                tdId = 'td';

            });

            if ($('#' + tableId + ' th:eq(' + (columnIndex) + ')').text() == 'Action') {
                if (isHidden) {
                    tableRow +=
                        "<td hidden style='text-align:center'>" +
                        " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                        "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                        "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + pkValue + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                        "</div ></div ></div></td></tr>";
                }
                else {
                    tableRow +=
                        "<td style='text-align:center'>" +
                        " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                        "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                        "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + pkValue + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                        "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                        "</div ></div ></div></td></tr>";
                }
            }
            //columnIndex += 1;
        };
        //var isHiddenAction = $('#' + tableId + ' th:eq(' + (Object.keys(dataObject).length + 1) + ')').prop('hidden');
        //if (isHiddenAction) {
        //    tableRow +=
        //        "<td hidden'>" +
        //        "</td></tr>";
        //}
        //else {
        //    tableRow +=
        //        "<td style='text-align:center'>" +
        //        " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
        //        "<i class='icon s7-menu dropdown-toggle'></i></a>" +
        //        "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
        //        "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + pkValue + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
        //        "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
        //        "</div ></div ></div></td></tr>";

        //}


        $('#' + tableId + ' tbody').append(tableRow);
    });

}
function generateTableRowsWithDropdownList(response, tableId, detailViewLink = null, linkKey = null, target = null, isLinkKeyEncrypted = true, numericFields = []) {
    var tableRow = null;

    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $('[data-toggle="tooltip"]').tooltip({ html: true });
    //var table = null;
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        //$("#" + tableId).DataTable().destroy();        
    }
    else {
        table = $("#" + tableId).DataTable({
            rowReorder: true
            ,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'copyHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
                {
                    extend: 'print',

                    title: tableId + new Date().toISOString().substring(0, 10),
                    text: '<i class="fas fa-print"></i> Print',
                    titleAttr: 'Print'
                }

            ]
            ,
            drawCallback: function (dt) {
                var previousValue = 0, previousText = '';

                $('.StatusID').select2({ tags: true, width: "12em" }).on('select2:selecting', function (e) {
                    previousValue = $(this).val();
                    previousText = $(this).select2('data')[0]['text'];

                }),
                    $('.StatusID').select2({ tags: true, width: "12em" }).on('select2:select', function () {
                        statusSelectionCallBack(this, previousValue, previousText, $(this).val(), $(this).select2('data')[0]['text']);
                    });
            }
        });

    }

    var tableRow = null;
    $('#' + tableId + ' tbody').html('');
    var pkValue = 0;
    var tdId = 'td';
    table.clear();
    $.each(response, function (rowIndex, dataObject) {
        pkValue = dataObject.ID;
        tableRow = "<tr class='gradeA'>";
        for (var columnIndex = 0; columnIndex <= Object.keys(dataObject).length; columnIndex++) {
            var isHidden = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('hidden');
            var thID = $('#' + tableId + ' th:eq(' + columnIndex + ')').prop('id');

            thID = thID.replace('th', '');
            $.each(dataObject, function (key, value) {
                if (thID == 'SerialNo') {
                    tableRow += "<td  style='text-align:center; padding-right: 40px;'>" + (rowIndex + 1) + "</td>";
                    return false;
                }
                if (thID == key) {
                    tdId = tdId + '' + thID
                    if (isHidden) {
                        tableRow += "<td hidden class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                    }
                    else {
                        if ($.isArray(linkKey)) {
                            var isKeyFoundInArray = false;
                            $.each(linkKey, function (rowIndex, rowItem) {
                                if (key == rowItem) {
                                    isKeyFoundInArray = true;
                                    if (isLinkKeyEncrypted[rowIndex]) {
                                        tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                    }
                                    else {
                                        tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink[rowIndex] + "\"," + dataObject.ID + ",\"" + target[rowIndex] + "\")'>" + (value == null ? '' : value) + "</a></td>";
                                    }
                                }
                            });
                            if (!isKeyFoundInArray) {
                                //tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                                if ($.inArray(key, numericFields) >= 0) {
                                    tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 3rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                                }
                                else {
                                    tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                                }
                            }
                        }
                        else if (key == linkKey) {
                            if (isLinkKeyEncrypted) {
                                tableRow += "<td> <a href='#' onclick='redirectToAction(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                            }
                            else {
                                tableRow += "<td> <a href='#' onclick='redirectToActionPlainId(\"" + detailViewLink + "\"," + dataObject.ID + ",\"" + target + "\")'>" + (value == null ? '' : value) + "</a></td>";
                            }
                        }
                        else {
                            if ($.inArray(key, numericFields) >= 0) {
                                tableRow += "<td class='" + tdId + "' style='text-align:right;padding-right: 3rem;'>" + (value == null ? '' : addThousandSeperator(value)) + "</td>";
                            }
                            else {
                                tableRow += "<td class='" + tdId + "'>" + (value == null ? '' : value) + "</td>";
                            }

                        }
                        return false;
                    }
                }
                tdId = 'td';
            });
        };
        var isHiddenAction = $('#' + tableId + ' th:eq(' + (Object.keys(dataObject).length + 1) + ')').prop('hidden');
        if (isHiddenAction) {
            tableRow +=
                "<td hidden'>" +
                "</td></tr>";
        }
        else {
            tableRow +=
                "<td style='text-align:center'>" +
                " <div class='list-icons'><div class='dropdown hide '><a href='#' class='btn   btn-sm ' data-toggle='dropdown' aria-expanded='true'style='background-color:#058d56;color:white'>" +
                "<i class='icon s7-menu dropdown-toggle'></i></a>" +
                "<div class='dropdown-menu dropdown-menu-right  hide' role='menu' x-placement='top-end' style='text-align:center;position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-158px, -127px, 0px);min-width: 6.50rem;padding:0.2rem 0!important;'>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Edit'><button onclick='modifyRecord(" + pkValue + "," + rowIndex + ");'type='button' class='btn  btn-sm authorizeOrNotUpdate'  style='color:white;background-color:#6adbf7'><b><i class='icon s7-pen'></i></b></button></span>" +
                "<span class='red-tooltip' data-toggle='tooltip' title='Delete'><button onclick='deleteRecord(" + pkValue + "," + rowIndex + ",$(this));'type='button' class='btn bg-danger btn-sm authorizeOrNotDelete'  style='color:white'><b><i class='icon s7-trash'></i></b></button></span>" +
                "</div ></div ></div></td></tr>";

        }

        table.row.add($(tableRow));
        //$('#' + tableId + ' tbody').append(tableRow);
    });

    table.draw();

    table.buttons().container().appendTo($('#printbar'));
    $('.dataTables_filter').css('margin-bottom', '0px');

}

function convertToDataTable(tableId = null, printbarID = null, isPaging = true) {
    table = $("#" + tableId).DataTable();
    table.draw();
    /*
    var tables = null;
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $('[data-toggle="tooltip"]').tooltip({ html: true });
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        //$("#" + tableId).DataTable().destroy();          
    }
    else {
        table = $("#" + tableId).DataTable(
            {
                rowReorder: true,
                autoWidth: false
                ,
                dom: 'lBfrtip',

                paging: isPaging,
                buttons: [
                    {
                        extend: 'copyHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-copy"></i> Copy',
                        titleAttr: 'Copy'
                    },
                    {
                        extend: 'excelHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-excel"></i> Excel',
                        titleAttr: 'Excel'
                    },
                    {
                        extend: 'csvHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-csv"></i> CSV',
                        titleAttr: 'CSV'
                    },
                    {
                        extend: 'pdfHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-pdf"></i> PDF',
                        titleAttr: 'PDF'
                    },
                    {
                        extend: 'print',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-print"></i> Print',
                        titleAttr: 'Print'
                    }

                ]
            });

        table.draw();
        printbarID = printbarID == null ? 'printbar' : printbarID;
        $('#' + printbarID).html('');
        //table.buttons().container().appendTo($('#printbar'));
        //$('.dataTables_filter').css('margin-bottom', '0px');
        table.buttons().container().appendTo($('#' + printbarID));
        $('.dataTables_filter').css('margin-bottom', '0px');
    }
    */
}

function convertToDataTableWithScroll(tableId = null, printbarID = null, scrollY = null, isPaging = true) {
    var tables = null;
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $('[data-toggle="tooltip"]').tooltip({ html: true });
    //$('#' + tableId + ' tbody').html('');
    let height = (scrollY == null ? '100vh' : scrollY);
    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        //$("#" + tableId).DataTable().destroy();          
    }
    else {
        table = $("#" + tableId).DataTable(
            {
                rowReorder: true,
                autoWidth: false
                ,
                dom: 'lBfrtip',

                paging: isPaging,
                scrollCollapse: (scrollY == null ? false : true),
                scrollY: (scrollY == null ? '100vh' : scrollY),
                buttons: [
                    {
                        extend: 'copyHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-copy"></i> Copy',
                        titleAttr: 'Copy'
                    },
                    {
                        extend: 'excelHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-excel"></i> Excel',
                        titleAttr: 'Excel'
                    },
                    {
                        extend: 'csvHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-csv"></i> CSV',
                        titleAttr: 'CSV'
                    },
                    {
                        extend: 'pdfHtml5',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-file-pdf"></i> PDF',
                        titleAttr: 'PDF'
                    },
                    {
                        extend: 'print',

                        title: tableId + new Date().toISOString().substring(0, 10),
                        text: '<i class="fas fa-print"></i> Print',
                        titleAttr: 'Print'
                    }

                ]
            });

        table.draw();
        printbarID = printbarID == null ? 'printbar' : printbarID;
        $('#' + printbarID).html('');
        //table.buttons().container().appendTo($('#printbar'));
        //$('.dataTables_filter').css('margin-bottom', '0px');
        table.buttons().container().appendTo($('#' + printbarID));
        $('.dataTables_filter').css('margin-bottom', '0px');
    }
}

var _target = null;
var _url = null;
function redirectToAction(url, id = 0, target = null) {
    _target = target;
    _url = url;
    //ajaxRequest({ url: '/CoreSuite/Encrypt/', type: 'POST', data: { ID: id }, callBack: encryptAndRedirect });


    let encryptedId = encryptNumber(id);

    if (_target != '_blank') {
        window.location.href = _url + encodeURIComponent(encryptedId);
    } else {
        window.open(_url + encodeURIComponent(encryptedId), _target);
    }
}
var encryptAndRedirect = function (responseJSON) {
    if (_target != '_blank') {
        window.location.href = _url + responseJSON;
    } else {
        window.open(_url + responseJSON, _target);
    }

}
function redirectToActionParams(url, id = 0, params = [], values = [], target = null) {
    /*
    ajaxRequest({url: '/CoreSuite/Encrypt/', type: 'POST', data: { ID: id }, callBack: function (responseJSON) {
            url = url + `?ID=${responseJSON}`
            $.each(params, function (rowIndex, rowValue) {
                url = url + `&${rowValue}=${values[rowIndex]}`
            })
            if (target != '_blank') {
                window.location.href = url;
            } else {
                window.open(url, target);
            }

        }
    });
    */


    let encryptedId = encryptNumber(id);
    url = url + `?ID=${encryptedId}`
    $.each(params, function (rowIndex, rowValue) {
        url = url + `&${rowValue}=${values[rowIndex]}`
    })
    if (target != '_blank') {
        window.location.href = url;
    } else {
        window.open(url, target);
    }
}

function redirectToActionPlainId(url, id = 0, target = null) {
    _target = target;
    _url = url;
    if (_target != '_blank') {
        window.location.href = _url + id;
    } else {
        window.open(_url + id, _target);
    }
}
function getAndDecryptID(encryptedId) {
    //ajaxRequest({ url: '/CoreSuite/Decrypt/', type: 'POST', data: { ID: encryptedId }, callBack: getAndDecryptIDCallBack });
    var result = decryptToNumber(encryptedId);
    // getAndDecryptIDCallBack(result);
    return result;
}

function only0To9WithDecimalAllowed(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode != 46 && charCode > 31
        && (charCode < 48 || charCode > 57))
        return false;

    return true;

}
function encryptNumber(plainNumber = 0) {
    const numberValue = plainNumber;

    // convert numeric to string, encrypt using AES (ECB mode)
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(numberValue.toString()),
        CryptoJS.enc.Utf8.parse(secretKey),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    ).toString();

    // URL-safe encoded
    const safe = encrypted;// encodeURIComponent(encrypted);        
    return safe;
}
function decryptToNumber(enctryptedText) {
    const decrypted = CryptoJS.AES.decrypt(
        enctryptedText,
        CryptoJS.enc.Utf8.parse(secretKey),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const plainText = CryptoJS.enc.Utf8.stringify(decrypted);
    return parseInt(plainText) || 0;

}


function only1To9Allowed(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode != 46 && charCode > 31
        && (charCode < 48 || charCode > 57)) {
        return false;
    }
    else if (charCode == 48 || charCode == 46) {
        return false;
    }
    else if (charCode > 48 && charCode <= 57) {

        return true
    }
    else {

        false;
    }
}
function only0To9Allowed(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    //else if (charCode == 48 || charCode == 46) {
    else if (charCode == 46) {
        return false;
    }
    else if (charCode >= 48 && charCode <= 57) {
        return true
    }
    else {

        false;
    }
}

//This function is used to convert square feet to square meter 

function scaleConversionFromSqfToSqm(field1, field2, event) {
    let a = event.which;
    if (a == 9) {
        return;
    }
    if (parseFloat($('#' + field1).val()) < 0) {

        $('#' + field1).val('');
        $('#' + field2).val('');
        return;
    } else {
        updating = true;
        $('#' + field1).val(removeAllCommas($('#' + field1).val()));
        $('#' + field2).val(parseFloat($('#' + field1).val() * 0.092903).toFixed(2));
        $('#' + field2).val(addThousandSeperator($('#' + field2).val()));
        var field1Value = addThousandSeperator(parseFloat($('#' + field1).val()));
        $('#' + field1).val(field1Value);
        updating = false;
    }
}
//This function is used to convert square meter to square feet
function scaleConversionFromSqmToSqf(field1, field2, event) {
    let tabKeyCode = event.which;
    if (tabKeyCode == 9) {
        return;
    }
    if (parseFloat($('#' + field1).val()) < 0) {

        $('#' + field1).val('');
        $('#' + field2).val('');
        return;
    } else {
        updating = true;
        $('#' + field1).val(removeAllCommas($('#' + field1).val()));
        //$('#' + field2).val(parseFloat($('#' + field1).val() * 10.7639).toFixed(2));
        $('#' + field2).val(parseFloat($('#' + field1).val() * 10.7639).toFixed(2));
        $('#' + field2).val(addThousandSeperator($('#' + field2).val()));
        $('#' + field1).val(addThousandSeperator($('#' + field1).val()));
        updating = false;
    }
}

function getFormattedDate(dateInput) {
    let availableFromDate;
    if (dateInput == null || dateInput == undefined) {
        return dateInput = '';
    }
    if (dateInput instanceof Date) {
        availableFromDate = dateInput;
    } else {
        availableFromDate = new Date(dateInput.match(/\d+/)[0] * 1);
    }
    /*
    var month = availableFromDate.getMonth() + 1;
    var day = availableFromDate.getDate();
    var date = availableFromDate.getFullYear() + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' + (('' + day).length < 2 ? '0' : '') + day;
        */
    var month = availableFromDate.getMonth() + 1;
    var day = availableFromDate.getDate();
    var year = availableFromDate.getFullYear()
    var date = (('' + day).length < 2 ? '0' : '') + day + '-' + (('' + month).length < 2 ? '0' : '') + month + '-' + year;

    return date;
}
function getFormattedDateTimeDDMMYYHHMMSS(dateInput) {
    var day = dateInput.getDate().toString().padStart(2, '0');
    var month = (dateInput.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    var year = dateInput.getFullYear();

    // Get time components
    var hours = dateInput.getHours().toString().padStart(2, '0');
    var minutes = dateInput.getMinutes().toString().padStart(2, '0');
    var seconds = dateInput.getSeconds().toString().padStart(2, '0');
    // Combine into desired format
    var formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
}
function getDatepickerDate(dateInput) {
    /* Commented below code after New Design
    var day = $('#' + dateInput).datepicker('getDate').getDate();
    var month = $('#' + dateInput).datepicker('getDate').getMonth() + 1;
    var year = $('#' + dateInput).datepicker('getDate').getFullYear();
    return new Date(year + '-' + month + '-' + day);
    */
    //| Wrote below code after new Design
    const dateParts = $(`#${dateInput}`).val().split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    var newDateValue = new Date(formattedDate);
    return newDateValue;
}
function getDatepickerFormattedDate(dateInput) {
    var day = $('#' + dateInput).datepicker('getDate').getDate();
    var month = $('#' + dateInput).datepicker('getDate').getMonth() + 1;
    var year = $('#' + dateInput).datepicker('getDate').getFullYear();
    return day + '-' + month + '-' + year;
}
function getDatepickerValueNewDate(inputValue) {
    inputValue = inputValue.split('-');
    let newDate = new Date(inputValue[2], inputValue[1] - 1, inputValue[0]);
    return new Date(newDate);
}
var removeAllCommas = function (string = '') {
    if (string == null || string == undefined) {
        string = 0;
    }
    if ((typeof string) != 'string') {
        string = string.toString()
    }
    return string.replace(/\,/g, '');
}
var addThousandSeperator = function (string = 0, input = null) {

    /*
    const fraction = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    string = string == null ? '0' : string;
    return fraction.format(removeAllCommas(string.toString()));
    */
    string = removeAllCommas(string);

    let number = parseFloat(string);
    if (isNaN(number)) {
        return string;
    }
    let formatted = number.toLocaleString('en-Us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    $(input).val(formatted);
    return formatted;
}
function getBHACKEDitorToolbar(isWithAddFields = false) {

    return [
        { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates'] },
        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
        { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
        '/',
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] },
        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
        '/',
        isWithAddFields == false ? [] : { name: 'AddFieldsComboBox', items: ['AddFieldsComboBox'] }
    ];
}

function redirectWithUserProjectID(url, uid, pid) {
    window.location.href = url + uid + "&projectid=" + pid;
}
function getFileSize(file) {

    var k = 1000;
    var decimalPoint = 2;
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    i = Math.floor(Math.log(file.size) / Math.log(k));
    return (parseFloat(file.size / Math.pow(k, i)).toFixed(decimalPoint) + ' ' + sizes[i]);
}
/*
Object.defineProperty(Date.prototype, 'getYYYYMMDDHHMMSSMS_Z', {
    value: function () {
        function pad2(n) {
            return (n <= 10 ? '0' : '') + n;
        }
        return pad2(this.getFullYear()) +
            pad2(this.getMonth() + 1) +
            pad2(this.getDate()) +
            pad2(this.getHours()) +
            pad2(this.getMinutes()) +
            pad2(this.getSeconds()) +
            pad2(this.getMilliseconds());
    }
})
*/
function getYYYYMMDDHHMMSSMS(date = new Date()) {
    const pad = (n, width = 2) => n.toString().padStart(width, '0');
    return date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        pad(date.getMilliseconds(), 3);
}

function datePickerDDMMYYYYFormat(datePickerId, isSetTodayDate = false, value = null) {
    var today = new Date();
    let inputIdOrClass = '';
    if ($(`#${datePickerId}`).length) {
        inputIdOrClass = `#${datePickerId}`;
    }
    else {
        inputIdOrClass = `.${datePickerId}`;
    }
    if (isSetTodayDate || value != null) {
        today = value == null ? today : value;
        $(`#${datePickerId}`).datepicker({
            format: 'dd-mm-yyyy',
            todayHighlight: true,
            autoclose: true,
            orientation: "bottom",
            changeMonth: true,
            changeYear: true,
            todayBtn: 'linked'
        }).datepicker('setDate', today);
    }
    else {

        $(`${inputIdOrClass}`).datepicker({
            format: 'dd-mm-yyyy',
            todayHighlight: true,
            autoclose: true,
            orientation: "bottom",
            changeMonth: true,
            changeYear: true,
            todayBtn: 'linked'
        });
    }

    $(`${inputIdOrClass}`).on('focus', function () {
        setTimeout(function () {
            $('.datepicker .datepicker-days tfoot th.today').text('Go to Today');
        }, 10);
    });
}
function datePickerDDMMYYYYHHMMSSFormat(datePickerId, isSetTodayDate = false) {
    $("#" + datePickerId).datepicker({
        changeMonth: true,
        changeYear: true,
        format: 'dd-mm-yyyy hh:mm:ss',
        autoclose: true,
    });
    if (isSetTodayDate) {
        var dateInput = new Date();
        var day = dateInput.getDate().toString().padStart(2, '0');
        var month = (dateInput.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        var year = dateInput.getFullYear();

        // Get time components
        var hours = dateInput.getHours().toString().padStart(2, '0');
        var minutes = dateInput.getMinutes().toString().padStart(2, '0');
        var seconds = dateInput.getSeconds().toString().padStart(2, '0');
        // Combine into desired format
        var formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        $("#" + datePickerId).val(formattedDateTime);
    }
}
function dateRangePicker(inputId) {
    const $input = $('#' + inputId);

    function updateInput(start, end) {
        $input.val(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
    }

    $input.daterangepicker({
        startDate: moment(),
        endDate: moment(),
        alwaysShowCalendars: false,
        showCustomRangeLabel: true,
        opens: 'center',
        locale: {
            format: 'DD-MM-YYYY' // ✅ Your format
        },
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Last 6 Months': [moment().subtract(6, 'months').startOf('month'), moment().endOf('month')]
        }
    }, updateInput);

    // Set initial value
    updateInput(moment(), moment());

    $input.on('focus', function () {

        setTimeout(function () {
            $('.drp-buttons .applyBtn').css('background-color', '#006666 ');
            $('.drp-buttons .applyBtn').attr('id', `btn${inputId}Apply`)
        }, 10);
    });
}

function timesheetDateRangePicker(inputId) {
    const $input = $('#' + inputId);

    function updateInput(start, end) {
        $input.val(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
    }

    $input.daterangepicker({
        startDate: moment(),
        endDate: moment(),
        alwaysShowCalendars: false,
        showCustomRangeLabel: true,
        opens: 'center',
        locale: {
            format: 'DD-MM-YYYY' // ✅ Your format
        },
        ranges: {
            'Daily': [moment(), moment()],
            //'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Weekly': [moment(), moment().add(6, 'days')],
            'Fortnight': [moment(), moment().add(13, 'days'), moment()],
            'Monthly': [moment(), moment().add(29, 'days')],
            //'This Month': [moment().startOf('month'), moment().endOf('month')],
            //'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            //'Last 6 Months': [moment().subtract(6, 'months').startOf('month'), moment().endOf('month')]
        }
    }, updateInput);

    // Set initial value
    updateInput(moment(), moment());

    $input.on('focus', function () {

        setTimeout(function () {
            $('.drp-buttons .applyBtn').css('background-color', '#006666 ');
            $('.drp-buttons .applyBtn').attr('id', `btn${inputId}Apply`)
        }, 10);
    });
}
function datePickerDDMMYYYYFormat_Old(datePickerId, containerId = null, isSetTodayDate = false) {
    //let formIdAttrValue = $("#" + datePickerId).closest('form').attr('id');
    //formIdAttrValue = formIdAttrValue != undefined ? '#' + formIdAttrValue : null;
    let divIdAtrrValue = containerId == null ? $("#" + datePickerId).closest('div').attr('id') : containerId;
    divIdAtrrValue = divIdAtrrValue != undefined ? '#' + divIdAtrrValue : null;

    $("#" + datePickerId).datepicker({
        changeMonth: true,
        changeYear: true,
        format: 'dd-mm-yyyy',
        autoclose: true,
        container: divIdAtrrValue,
        orientation: "auto",
        zIndexOffset: 9999
    });

    if (isSetTodayDate) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();

        today = dd + '-' + mm + '-' + yyyy;
        $("#" + datePickerId).val(today);
    }
}
function datePickerDDMMYYYYHHMMSSFormat(datePickerId, isSetTodayDate = false) {
    $("#" + datePickerId).datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss',
        showTodayButton: true,
        showClear: true,
        showClose: true,
        sideBySide: true,
        stepping: 1,
        defaultDate: (isSetTodayDate == true ? new Date() : null), // 👈 sets current date and time
        icons: {
            time: 'bi bi-clock',
            date: 'bi bi-calendar',
            up: 'bi bi-chevron-up',
            down: 'bi bi-chevron-down',
            previous: 'bi bi-chevron-left',
            next: 'bi bi-chevron-right',
            today: 'bi bi-calendar-check',
            clear: 'bi bi-trash',
            close: 'bi bi-x-circle'
        }
    })
        .on('dp.show dp.update', function () {
            const widget = $('.bootstrap-datetimepicker-widget');

            // Inject Close button if missing (same as before)
            if (widget.find('.custom-time-close').length === 0 && widget.find('.timepicker').length > 0) {
                widget.find('.timepicker').append(`
            <div class="custom-time-close text-center mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-x-circle"></i> Close
                </button>
            </div>
        `);
            }

            // Disable HH/MM/SS click to switch view
            widget.find('.timepicker .timepicker-hour, .timepicker .timepicker-minute, .timepicker .timepicker-second')
                .css('pointer-events', 'none') // disables clicks
                .attr('title', ''); // remove tooltip

            // Rebind close button
            widget.off('click', '.custom-time-close button')
                .on('click', '.custom-time-close button', function () {
                    $("#" + datePickerId).data('DateTimePicker').hide();
                });
        });



}
function timePickerHHMM(datePickerId) {

    let inputIdOrClass = '';
    if ($(`#${datePickerId}`).length) {
        inputIdOrClass = `#${datePickerId}`;
    }
    else {
        inputIdOrClass = `.${datePickerId}`;
    }
    $(`${inputIdOrClass}`).datetimepicker({
        useCurrent: false,
        format: "hh:mm A"
    }).on('dp.show', function () {
        var picker = $(this).data('DateTimePicker');
        var existingValue = $(this).val();

        if (existingValue) {
            picker.date(moment(existingValue, "hh:mm A"));
        } else {
            picker.date(moment());
        }
    });
}
function getFormattedTodayDateDDMMYYYY() {

    var availableFromDate = new Date();

    /*
    var month = availableFromDate.getMonth() + 1;
    var day = availableFromDate.getDate();
    var date = availableFromDate.getFullYear() + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' + (('' + day).length < 2 ? '0' : '') + day;
        */
    var month = availableFromDate.getMonth() + 1;
    var day = availableFromDate.getDate();
    var year = availableFromDate.getFullYear()
    var date = (('' + day).length < 2 ? '0' : '') + day + '-' + (('' + month).length < 2 ? '0' : '') + month + '-' + year;
    return date;
}
function getFormattedDateDDMMYYYY(dateInput) {

    var availableFromDate = dateInput;

    var month = availableFromDate.getMonth() + 1;
    var day = availableFromDate.getDate();
    var year = availableFromDate.getFullYear()
    var date = (('' + day).length < 2 ? '0' : '') + day + '-' + (('' + month).length < 2 ? '0' : '') + month + '-' + year;
    return date;
}
function getDDMMYYYYAsDate(dateInput) {
    var parts = dateInput.split('-');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}
function loadSetupScreenTablePartialView(buttonText, title, tableName, newFunctionName, containerDivId, areaName = null) {
    var inputJSON = {
        "ButtonText": buttonText,//"Add Unit Type",
        "Title": title,//"Unit Type",
        "Table": tableName,//"[Setup.UnitType]",
        "SetupModalPartialViewModel":
        {
            "NewRecordFunctionName": newFunctionName//"newUnitType()",
        }

    }
    areaName = areaName == null ? 'RealEstate' : areaName;
    ajaxRequest({ url: '/' + areaName + '/Setup/GetMainContentPartialView', type: 'POST', data: inputJSON, callBack: loadSetupScreenTablePartialViewCallBack, containerID: containerDivId }, 'html');
}
var loadSetupScreenTablePartialViewCallBack = function (response, options) {
    $('#' + options.containerID).html(response);
    $('.table').css('width', '100%');

}

function loadSetupScreenModalPartialView(title, table, descriptionPlaceholder, newRecordFunctionName, saveButtonId, saveCallBackFunctionName, functionToRefreshDataOnSuccess, containerDivId, areaName = null) {
    var inputJSON =
    {
        Title: title,//"New Unit Type",
        Table: table,//"[Setup.UnitType]",
        DescriptionPlaceholder: descriptionPlaceholder,//"Enter Unit Type",
        NewRecordFunctionName: newRecordFunctionName,//"newUnitType",
        SaveButtonId: saveButtonId,//"btnSaveUnitType",
        SaveCallBackFunctionName: saveCallBackFunctionName,//"saveUnitTypeCallBack",
        FunctionToRefreshDataOnSuccess: functionToRefreshDataOnSuccess //"loadTableData();"
    };
    areaName = areaName == null ? 'RealEstate' : areaName;
    ajaxRequest({ url: '/' + areaName + '/Setup/GetModalPartialView', type: 'POST', data: inputJSON, callBack: loadSetupScreenModalPartialViewCallBack, containerID: containerDivId }, 'html');
}
var loadSetupScreenModalPartialViewCallBack = function (response, options) {
    $('#' + options.containerID).html(response);
}
function getCompanyDefaultCurrency() {
    ajaxRequest({ url: '/RealEstate/Unit/CompanyDefaultCurrencyGet', type: 'POST', data: {}, callBack: getCompanyDefaultCurrencyCallBack })
}
function successToastr(message = 'Success', title = null) {
    //$.gritter.add({ title: (title == null ? 'Success' : title), text: message, class_name: "gritter-color primary" });
    toastr.success(message, (title == null ? 'Success' : title));
}
function infoToastr(message = 'Warning', title = 'Info') {
    //$.gritter.add({ title: (title == null ? 'Warning' : title), text: message, class_name: "gritter-color info" })
    toastr.info(message, (title == null ? 'Info' : title));
}
function warningToastr(message = 'Success', title = null) {
    //$.gritter.add({ title: (title == null ? 'Warning' : title), text: message, class_name: "gritter-color warning" });
    toastr.warning(message, (title == null ? 'Info' : title));
}
function errorToastr(message = 'Success', title = null) {
    //$.gritter.add({ title: (title == null ? 'Danger' : title), text: message, class_name: "gritter-color danger" });
    toastr.error(message, (title == null ? 'Info' : title));
}
function selectStyledAsInputsm(inputId = null, width = null) {
    if (inputId == null) {
        //$('.select2-container--default').css('width', '100%');
        //$('.select2-selection--single').css('height', '2.53846rem');
        //$('.select2-selection--single').css('line-height', '1');
        //$('.select2-selection__rendered').css('margin-top', '-3px');
        //$('.select2-selection__arrow').css('top', '-3px');
    }
    else {
        $('#' + inputId).next('span').find('.select2-container--default').css('width', (width == null ? '100%' : width));
        $('#' + inputId).next('span').find('.select2-selection--single').css('height', '2.53846rem');
        $('#' + inputId).next('span').find('.select2-selection--single').css('line-height', '1');
        $('#' + inputId).next('span').find('.select2-selection__rendered').css('margin-top', '-3px');
        $('#' + inputId).next('span').find('.select2-selection__arrow').css('top', '-3px');

        $('.' + inputId).next('span').find('.select2-container--default').css('width', (width == null ? '100%' : width));
        $('.' + inputId).next('span').find('.select2-selection--single').css('height', '2.53846rem');
        $('.' + inputId).next('span').find('.select2-selection--single').css('line-height', '1');
        $('.' + inputId).next('span').find('.select2-selection__rendered').css('margin-top', '-3px');
        $('.' + inputId).next('span').find('.select2-selection__arrow').css('top', '-3px');

        $('#' + inputId).next('.select2-container').css('width', (width == null ? '100%' : width));
        $('.' + inputId).next('.select2-container').css('width', (width == null ? '100%' : width));
    }





}
function selectStyledAsInputmd(inputId = null, width = null) {
    if (inputId == null) {
        //$('.select2-container--default').css('width', '100%');
        //$('.select2-selection--single').css('height', '3.23077rem');
        //$('.select2-selection--single').css('line-height', '1');
        //$('.select2-selection__rendered').css('margin-top', '-3px');
        //$('.select2-selection__arrow').css('top', '0px');
    }
    else {
        $('#' + inputId).next('span').find('.select2-container--default').css('width', (width == null ? '100%' : width));
        $('#' + inputId).next('span').find('.select2').css('width', (width == null ? '100%' : width));
        $('#' + inputId).next('span').find('.select2-container').css('width', (width == null ? '100%' : width));
        $('#' + inputId).next('span').find('.select2-selection--single').css('height', '3.23077rem');
        $('#' + inputId).next('span').find('.select2-selection--single').css('line-height', '1');
        $('#' + inputId).next('span').find('.select2-selection__rendered').css('margin-top', '-3px');
        $('#' + inputId).next('span').find('.select2-selection__arrow').css('top', '0px');

        $('.' + inputId).next('span').find('.select2-container--default').css('width', (width == null ? '100%' : width));
        $('.' + inputId).next('span').find('.select2-selection--single').css('height', '3.23077rem');
        $('.' + inputId).next('span').find('.select2-selection--single').css('line-height', '1');
        $('.' + inputId).next('span').find('.select2-selection__rendered').css('margin-top', '-3px');
        $('.' + inputId).next('span').find('.select2-selection__arrow').css('top', '0px');

        $('.' + inputId).next('.select2-container').css('width', (width == null ? '100%' : width));
        $('#' + inputId).next('.select2-container').css('width', (width == null ? '100%' : width));
    }

}
function datesMonthDifference(date1, date2) {
    // Ensure date1 is earlier than date2
    if (date1 > date2) {
        [date1, date2] = [date2, date1];
    }

    // Calculate the difference in years and months
    const months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());

    return months + 1;
}

//| New Code after New Theme
function getFilterTH(tableId, key = null, dataColumn = 0) {
    let attrId = $(`#${tableId} thead tr.bha-th`).find(`td#th${key}`).css('width');
    let thHidden = $(`#th${key}`).attr('hidden') !== undefined == true ? 'hidden' : '';
    return `<th style=padding-bottom:3px !important;margin-bottom:0px !important;width:${attrId}" ${thHidden}>
               <div style="display: flex; align-items: center; gap: 6px">
                   <div class="custom-select" style="flex-grow:1;">
                       <select class="js-states form-control selector_2" id="Filter${key}" data-column="${dataColumn}" style="width:100%;">
                           <option value="">All</option>
                       </select>
                   </div>
                   <i class="bi bi-funnel fsizes"></i>
               </div>
           </th>`;

}

//| Setup Filters
function renderHeaderStatusSelect(selectIdAttr, dataArray = [], key) {
    var selectUniqueData = [];
    if (key != 'id') {
        $.each(dataArray, function (index, item) {
            if (item[key]) {
                if ($.inArray(item[key], selectUniqueData) == -1) {
                    selectUniqueData.push(item[key]);
                    $(`#${selectIdAttr}`).append(`<li class="bha-menu">
                                                                <a class="dropdown-item filter-status" href="#" data-status="${item[key]}">
                                                                    ${item[key] ?? ''}
                                                                </a>
                                                            </li>`)


                }
            }
        })

    }
}
function renderFilterSelect(dataArray = []) {
    $.each(dataArray[0], function (key, value) {
        var selectUniqueData = [];
        if (key != 'id') {
            $.each(dataArray, function (index, item) {
                if (item[key] != null && item[key] != '') {
                    if ($.inArray(item[key], selectUniqueData) == -1) {
                        selectUniqueData.push(item[key]);
                        if (index == 0) {
                            $(`#Filter${key}`).append
                                ($('<option></option>').val('All').html('All'));
                        }
                        $(`#Filter${key}`).append
                            ($('<option></option>').val(item[key]).html(item[key]));
                    }

                }
            })

        }
    });

}
//| Setup Filters

function setupFiltersWithjQuery(tableIdAttr = null) {
    // Attach change handler to all select filters with data-column
    $("select[data-column]").off("change").on("change", filterTableWithjQuery);

    function filterTableWithjQuery() {
        const activeFilters = {};

        // Gather all active filter values
        $("select[data-column]").each(function () {
            const $filter = $(this);
            const columnIndex = parseInt($filter.attr("data-column"));
            const value = $filter.val().trim();
            if (value !== "" && value !== "All") {
                activeFilters[columnIndex] = value.toLowerCase();
            }
        });

        //const table = $(`#${tableIdAttr}`).DataTable();
        //table.destroy();

        $(`#${tableIdAttr} tbody tr`).each(function () {

            const $row = $(this);
            const $cells = $row.find("td");
            let show = true;

            $.each(activeFilters, function (colIndex, filterValue) {
                const cellText = $cells.eq(colIndex).text().toLowerCase();
                if (!cellText.includes(filterValue)) {
                    show = false;
                    return false; // Break loop early
                }
            });

            $row.toggle(show);
        });

        //newTable.draw();
    }
}

function setupFiltersWithjQuery1(tableIdAttr = null, JSONArray = []) {
    // Attach change handler to all select filters with data-column
    $("select[data-column]").off("change").on("change", filterTableWithjQuery);

    function filterTableWithjQuery() {
        const activeFilters = {};

        // Gather all active filter values
        $("select[data-column]").each(function () {
            const $filter = $(this);
            const columnIndex = parseInt($filter.attr("data-column"));
            const value = $filter.val().trim();

            if (value !== "") {
                activeFilters[columnIndex] = value.toLowerCase();
            }
        });

        const table = $(`#${tableIdAttr}`).DataTable();

        let allFilteredArray = []
        if (Object.keys(activeFilters).length > 0) {
            allFilteredArray = _response.filter(row => {
                return Object.entries(activeFilters).every(([colIndex, filterValue]) => {
                    const key = Object.keys(row)[colIndex];
                    const cellValue = (row[key] || '').toString().toLowerCase();
                    return cellValue.includes(filterValue);
                });
            });
        } else {
            allFilteredArray = _response;
        }
        var tr = generate_tr(allFilteredArray);
        table.clear();
        table.rows.add($(tr));
        table.draw();
    }
}


function setupColumnTogglesWithjQuery(tableIdAttr = null) {
    // Attach event listener to dynamically added checkboxes
    $(".custom-checkbox").off("click").on("click", function () {
        const $checkbox = $(this);
        const columnIndex = parseInt($checkbox.attr("data-column"));

        const isVisible = $checkbox.is(":checked");

        const table = $(`#${tableIdAttr}`).DataTable();

        // 1. Toggle column visibility using DataTables API
        table.column(columnIndex).visible(isVisible);

        // 2. Manually toggle static header/footer cells        
        $(`#${tableIdAttr} tr.bha-th1 th`).eq(columnIndex).css('display', (isVisible == true ? 'block' : 'none'));
        /*
        $("#propertiesTable thead tr.bha-th1, #propertiesTable tfoot tr").each(function () {
            const $cell = $(this).find("th, td").eq(columnIndex);            
            $cell.css("display", isVisible ? "" : "none");
        });
        */

    });

    // Optional: call your row highlight logic
    hightlightRow(); // Make sure this is defined elsewhere
}

function tableWidth100Percent(tableIdAttribute) {

    const table = document.getElementById(tableIdAttribute);
    let table_wrapper = `${tableIdAttribute}_wrapper`;
    if (table) {
        table.style.setProperty("width", "100%", "important");
        table.style.setProperty("margin-left", "0", "important");
        table.style.setProperty("margin-right", "0", "important");
    }
    /*
    $(`#${table_wrapper} .row.mt-3.align-items-center`).css({
        "width": "100%",
        "margin-left": "0",
        "margin-bottom":"100",
    });
    */
    var dataTable = $(`#${tableIdAttribute}`).DataTable();
    let marginBottom = "60px";
    if (dataTable.rows().length <= 2) {
        marginBottom = "90px";
    }

    $(`#${table_wrapper} .row.mt-3.align-items-center`).attr(
        "style",
        "width:100% !important; margin-left:0 !important; margin-bottom:" + marginBottom + " !important;"
    );
}
//| New Code after New Theme Ends
function getUniqueItemsArray(array = []) {
    //Unique data for table
    var seen = new Set();
    var uniqueTenants = [];
    array.forEach(function (item) {
        var key = item.ID
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTenants.push(item);
        }
    });
    return uniqueTenants;
}
function mutiSelectCheckboxFormat(selectValue) {
    if (!selectValue.id) {
        return selectValue.text;
    }
    if (selectValue.id == 0) {
        return $('<span>' + selectValue.text + '</span>');
    }
    let isChecked = selectValue.selected ? 'checked' : '';
    let $selectValue = $(`
        <div style="display: flex; align-items: center;">
            <input class="form-check-input me-2" type="checkbox" value="" id="IsShowOnWebsite" ${isChecked}>
            <label class="form-check-label" for="IsShowOnWebsite" style="padding-top:2px;">
                ${selectValue.text}
            </label>
                      
        </div>
    `);
    return $selectValue;
};

function getSetDocumentNo(inputIdAttr, type = null) {
    ajaxRequest({
        url: '/CoreSuite/GetRealEstateDocumentNumber', type: 'POST', data: {
            Type: type
        }, callBack: function (responseJSON) {
            if (responseJSON.IsSuccess) {
                $(`#${inputIdAttr}`).val(responseJSON.resultJSON.Number);
            }
            else {

            }
        }
    }, null, false);
}
function getTableRowsBySchema(schema, tbodyId) {
    var result = [];

    $('#' + tbodyId + ' tr').each(function () {
        var rowObj = {};

        // Loop over each key in schema
        for (var key in schema) {
            if (schema.hasOwnProperty(key)) {
                var tdClass = 'td' + key; // class to look for
                var $td = $(this).find('td.' + tdClass);

                if ($td.length) {
                    var value;
                    // For inputs (text, number, datepicker)                    
                    // For selects                    
                    if ($td.find('select').length) {
                        value = $td.find('select').val();
                    }
                    else if ($td.find('input').length) {
                        if ($td.find('input').attr('type') == 'checkbox') {
                            value = $td.find('input').is(':checked');
                        }
                        else if ($td.find('input').attr('type') == 'number') {
                            value = removeAllCommas($td.find('input').val());
                        }
                        else {
                            value = $td.find('input').val();
                            // convert value from '' to null
                            value = value == '' ? null : value;
                        }
                    }
                    else {
                        value = $td.text().trim();
                    }

                    rowObj[key] = value;
                }
            }
        }

        if (Object.keys(rowObj).length > 0) {
            result.push(rowObj);
        }
    });

    return result;
}

function addTableRowsBySchema(schema, tbodyId, rowData = {}) {

    //| set th padding 2px 
    document.querySelectorAll(`#${tbodyId}`).forEach(tbody => {
        const table = tbody.closest('table');
        table.querySelectorAll('th').forEach(cell => {
            //cell.style.setProperty('padding', '2px', 'important');
        });
    });


    var $tr = $('<tr></tr>');


    for (var key in schema) {
        if (schema.hasOwnProperty(key)) {
            var tdClass = 'td' + key;
            var cellSchema = schema[key];
            var value = rowData.hasOwnProperty(key) ? rowData[key] : '';; // rowData[key] || '';          
            var $td = $('<td style="padding: 2px !important;"></td>').addClass(tdClass);

            switch (cellSchema.type) {
                case 'text':
                case 'number':
                    var $wrapper = $('<div class="selector" style="margin-top: 0px !important;"></div>');
                    var $input = $('<input class="js-states form-control bha-input w-100 mt-0" type="text">')
                        .val(value);
                    // $input.attr('readonly', cellSchema.isReadOnly);
                    // $input.addClass('readonly');
                    if (cellSchema.isReadOnly) {
                        $input.attr('readonly', true);
                        $input.addClass('readonly');
                    }

                    // Only add events if type is number
                    if (cellSchema.type === 'number') {
                        $input
                            .attr('onkeypress', 'return only0To9WithDecimalAllowed(window.event);')
                            .attr('onblur', 'addThousandSeperator(this.value,this);')
                            .val(value ? value : '0.00');
                    }

                    if (cellSchema.hasOwnProperty('maxlength')) {
                        $input.attr('maxlength', cellSchema.maxlength);
                    }

                    $wrapper.append($input);
                    $td.append($wrapper);
                    break;
                case 'checkbox':
                    var $wrapper = $('<div class="text-center"></div>'); //form-check 
                    var $input = $('<input class="form-check-input" type="checkbox" value="true"  style="font-size:1.2rem;"></input>');
                    $input.attr('checked', value);
                    $wrapper.append($input);
                    $td.append($wrapper);
                    break;
                case 'select':
                    let selectIdAttr = `select_${key}`;
                    var $wrapper = $('<div class="selector" style="margin-top: 0px !important;"></div>');
                    var $select = $('<select class="js-states form-control selector_2 w-auto"></select>');
                    $select.addClass(selectIdAttr);
                    $select.attr('multiple', cellSchema.isMultiple);
                    if (cellSchema.options && Array.isArray(cellSchema.options)) {
                        cellSchema.options.forEach(opt => {
                            var $option = $('<option></option>').attr('value', opt.Value).text(opt.Text);
                            if (opt.Value == value) $option.prop('selected', true);
                            $select.append($option);
                        });

                    }
                    if (cellSchema.isMultiple) {
                        $select.val(value);
                    }
                    $wrapper.append($select);
                    $td.append($wrapper);
                    break;

                case 'datepicker':
                case 'timepicker':
                    let datePickerClass =
                        cellSchema.type === 'datepicker'
                            ? `${tbodyId}_${key}_dp`
                            : `${tbodyId}_${key}_tp`;

                    let iconClass =
                        cellSchema.type === 'datepicker' ? 'bi-calendar-date fs-5' : 'bi-clock fs-6';
                    var $wrapper = $('<div class="selector" style="margin-top: 0px !important;"></div>');
                    var $dateDiv = $(`
                        <div class="position-relative">
                            <input class="js-states form-control bha-datepicker bha-input w-auto mt-0 ${datePickerClass}" value="${value}" required autocomplete="off">
                            <i class="bi ${iconClass} position-absolute end-0 translate-middle-y me-2 text-muted pointer-event-none"
                               style="top:49% !important;"></i>
                        </div>
                    `);
                    $wrapper.append($dateDiv);
                    $td.append($wrapper);
                    break;
                case 'action':
                    $td.addClass('tdAction text-center pt-0 pb-0');

                    // Add icons only if functions are provided
                    if (cellSchema.addRowFunction) {
                        let editIcon = $(`<i class="bi bi-plus-circle fs-6 green me-2" style="cursor:pointer;"></i>`);
                        editIcon.attr('onclick', `${cellSchema.addRowFunction}('${rowData.ID || 0}', this)`);
                        $td.append(editIcon);
                    }

                    if (cellSchema.removeRowFunction) {
                        let deleteIcon = $(`<i class="bi bi-x-circle fs-6 text-danger" style="cursor:pointer;"></i>`);
                        deleteIcon.attr('onclick', `${cellSchema.removeRowFunction}('${rowData.ID || 0}', this)`);
                        $td.append(deleteIcon);
                    }
                    break;
                case 'hidden':
                    $td.attr('hidden', true);
                    $td.text(value);
                    break
                default:
                    $td.text(value);
                    break;
            }

            $tr.append($td);
        }
    }

    // Append the row to the given tbody
    $(`#${tbodyId}`).append($tr);

    // Initialize select2
    $(`#${tbodyId} select.selector_2`).select2({
        width: "100%",
        placeholder: "Select an option",
        minimumResultsForSearch: 0,
    });

    // Initialize datepickers
    for (var key in schema) {
        if (schema[key].type === 'datepicker') {
            var classDatepicker = `${tbodyId}_${key}_dp`;
            var today = rowData[key] == null ? new Date() : getFormattedDate(rowData[key]);

            //$(`#${tbodyId} ${$tr} input.${classDatepicker}`).datepicker({
            $tr.find(`input.${classDatepicker}`).datepicker({
                format: 'dd-mm-yyyy',
                todayHighlight: true,
                autoclose: true,
                orientation: "default",
                changeMonth: true,
                changeYear: true,
                todayBtn: 'linked'
            }).datepicker('setDate', today);
        }
        else if (schema[key].type === 'timepicker') {
            var classTimepicker = `${tbodyId}_${key}_tp`;
            timePickerHHMM(classTimepicker)
        }
    }
    resetTableActions(tbodyId);
}

function resetTableActions(tbodyId, addRowFunction = null, deleteRowFunction = null) {
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    const totalRows = rows.length;

    rows.forEach((row, index) => {
        const actionCell = row.querySelector('.tdAction');
        if (!actionCell) return;

        const addIcon = actionCell.querySelector('.bi-plus-circle');
        const removeIcon = actionCell.querySelector('.bi-x-circle');

        if (totalRows === 1 && index === 0) {
            // Only one row in table: show only Add
            if (addIcon) addIcon.style.display = 'inline-block';
            if (removeIcon && addRowFunction != null) removeIcon.style.display = 'none';
        } else if (index === totalRows - 1) {
            // Last row (not first if totalRows > 1): show Add + Remove
            if (addIcon) addIcon.style.display = 'inline-block';
            if (removeIcon) removeIcon.style.display = 'inline-block';
        } else {
            // All other rows: show only Remove
            if (addIcon) addIcon.style.display = 'none';
            if (removeIcon) removeIcon.style.display = 'inline-block';
        }
    });
}

function hightlightRow() {

    // Add event listeners to all checkboxes
    document.querySelectorAll(".row-check").forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            const row = this.closest("tr");
            if (this.checked) {
                row.classList.add("highlighted");
            } else {
                row.classList.remove("highlighted");
            }
        });
    });
}
function parseJwt(token) {
    try {
        if (token != null) {
            const base64Payload = token.split('.')[1];
            return JSON.parse(atob(base64Payload));
        }
        else {
            return [];
        }
    } catch (err) {
        console.error("Invalid Token", err);
        return null;
    }
}
function getInitials(name) {
    return name
        .trim()
        .split(/\s+/)          // split by spaces
        .map(word => word[0].toUpperCase())
        .join('');
}

function renderTinyMCE(inputIdAttr = 'textArea',fkeyId = 0) {
    tinymce.init({
        selector: inputIdAttr,
        license_key: 'gpl',
        /* AUTO HEIGHT */
        height: 0,                 // let CSS control initial height
        max_height: null,          // optional
        min_height: 200,           // optional min height
        autoresize_bottom_margin: 10,
        resize: true,
        content_style: "body { font-size: 85%; }",
        plugins: [ //'image', 'media',
            'autoresize', 'advlist', 'autolink', 'lists', 'link',
            'charmap', 'preview', 'anchor', 'searchreplace',
            'visualblocks', 'code', 'fullscreen', 'insertdatetime',
            'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image media | ' +
            'forecolor backcolor | code | fullscreen',

        // Automatic image upload (for images only)
        automatic_uploads: false,
        images_upload_url: `${baseUrl}flowtick/task/${fkeyId}/attachments`,  //' / Home / Upload',
        /*
        images_upload_handler: function (blobInfo) {
            debugger;
            return new Promise((resolve, reject) => {
                debugger;
                uploadFile(blobInfo.blob(), blobInfo.filename())
                    .then(response => {
                        if (response && response.url) {
                            resolve(response.url);
                        } else {
                            reject('Invalid response');
                        }
                    })
                    .catch(error => {
                        reject('Upload failed: ' + error);
                    });
            });
        },
        */
        images_upload_handler: function (blobInfo) {
            return new Promise((resolve, reject) => {
                uploadFile(blobInfo.blob(), blobInfo.filename())
                    .then(response => {
                        if (response?.url && response?.fileName) {
                            resolve(response.url);

                            // Add metadata AFTER insert
                            setTimeout(() => {
                                const imgs = tinymce.activeEditor.getBody().querySelectorAll(
                                    `img[src="${response.url}"]`
                                );

                                imgs.forEach(img => {
                                    img.setAttribute('data-file', response.fileName);
                                    wrapImage(img);
                                });
                            }, 0);
                        } else {
                            reject('Invalid response');
                        }
                    })
                    .catch(err => reject(err));
            });
        },
        setup: function (editor) {

            editor.on('drop', function (e) {
                const file = e.dataTransfer.files[0];
                if (!file) return;

                if (!/\.(pdf|docx?)$/i.test(file.name)) return;

                e.preventDefault();

                const formData = new FormData();
                formData.append('file', file);
                formData.append('taskId', 10);
                const accessToken = localStorage.getItem('accessToken');
                //fetch('/Home/Upload', {
                fetch(`${baseUrl}flowtick/task/${fkeyId}/attachments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        // DO NOT set 'Content-Type' when sending FormData
                    },
                    body: formData
                })
                    .then(r => r.json())
                    .then(res => {
                        editor.insertContent(
                            //`<p><a href="${res.url}" target="_blank">${file.name}</a></p>`
                            /*`<p>
                                       <a href="${res.url}"
                                          data-file="${res.fileName}"
                                  target="_blank">
                                  ${file.name}
                               </a>
                            </p>`
                            */

                            `
                                 <div class="file-box" contenteditable="false" data-file="${res.data.fileName}">
                                <span class="file-remove">×</span>
                                            <a href="${res.data.url}" target="_blank">${file.name}</a>
                             </div>
                                                   `
                        );
                    });

            });
            editor.on('click', function (e) {

                if (e.target.classList.contains('file-remove')) {
                    alert('file');
                    const box = e.target.closest('.file-box');
                    const fileName = box.dataset.file;

                    // Remove from editor UI
                    box.remove();

                    // Call backend delete
                    fetch('/Home/Delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ FileName: fileName })
                    });
                }
                if (e.target.classList.contains('img-remove')) {
                    alert('image');
                    const wrapper = e.target.closest('.img-box');
                    const img = wrapper.querySelector('img');
                    const fileName = img.getAttribute('data-file');

                    wrapper.remove();
                    /*
                    // Delete backend file
                    const formData = new FormData();
                    formData.append('fileName', fileName);

                    fetch('/Home/Delete', {
                        method: 'POST',
                        body: formData
                    });
                    */
                    // Call backend delete
                    fetch('/Home/Delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ FileName: fileName })
                    });
                }
            });
        }
    });
}