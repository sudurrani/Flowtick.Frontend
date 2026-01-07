$(document).on('click', '#btnSignUp', function () {
    sendEmailVerificationCode();
});
function sendEmailVerificationCode() {
    //debugger;
    if (customValidateForm('EmailForm')) {
        const inputJSON = getFormDataAsJSONObject('EmailForm');
        if (!isEmailValid(inputJSON.email)) {
            infoToastr('Please enter a valid email address', 'info');
            return;
        }
        userEmail = inputJSON.email;
        
        $("#btnSignUp, #email").addClass("readonly").prop("disabled", true).text("Sending...");
        setTimeout(function () {
            apiRequest({
                url: 'flowtick/email/verification',
                type: 'POST',
                data: inputJSON,
                callBack: sendEmailVerificationCodeCallBack
            });
        }, 0);
    }
}

function sendEmailVerificationCodeCallBack(response) {    
    if (response.request.status === 200) {
        //debugger;
        $('#FlowtickContainer').fadeOut(300, function () {
            $(this).html('');
        });
        getCodeVerificationPartialView();
    } else if (response.request.status == 409) {
        $("#btnSignUp, #email").removeClass("readonly").prop("disabled", false).text("Sign up");
        errorExtractor(response);
    }
    else {
        errorExtractor(response);
        $("#btnSignUp, #email").removeClass("readonly").prop("disabled", false).text("Sign up");
    }
}
function getCodeVerificationPartialView() {
    //debugger;
    ajaxRequest({
        url: '/Auth/GetPartialView',
        type: 'POST',
        data: { url: "~/Views/Shared/PartialViews/Auth/SignUp/_CodeVerificationPartialView.cshtml" },
        callBack: getCodeVerificationPartialViewCallBack
    }, 'html');
}
var getCodeVerificationPartialViewCallBack = function (responseHTML) {
    //debugger;
    setTimeout(function () {
        $('#FlowtickContainer').append(responseHTML).fadeIn(500);
        initializeCodeVerificationElements(userEmail);
    }, 500);
}
function isEmailValid(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Email check icon show/hide on input (also delegate if element loaded dynamically)
$(document).on('input', '#email', function () {
    const emailCheck = $('#emailCheck');
    emailCheck.css('display','block');    
    emailCheck.removeClass('bi-x-circle').removeClass('bi-check-circle');
    isEmailValid($(this).val()) == true
        ? emailCheck.addClass('bi-check-circle').css('color', '#046f76')
        : emailCheck.addClass('bi-x-circle').css('color', '#dc3545');    
});