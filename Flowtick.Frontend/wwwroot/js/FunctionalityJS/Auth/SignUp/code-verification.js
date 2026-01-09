
$(document).on('click', '#btnCodeVerification', function () {
    emailCodeVerification();
});
function emailCodeVerification() {
    if (customValidateForm('CodeVerificationForm')) {
        $("#btnCodeVerification, .otp-inputs .otp").addClass("readonly").prop("disabled", true).text("Verifying...");
        const codeArray = $(".otp-inputs .otp")
            .map(function () { return $(this).val().trim(); })
            .get(); // ["1","2","3","4","5","6"]

        const codeString = codeArray.join(""); // "123456"
        code = codeString;
        const inputJSON = {
            email: $("#email").val().trim(),
            code: codeString // send as string
        };
        apiRequest({
            url: 'flowtick/email-code/verification', type: 'POST', data: inputJSON,
            callBack: emailCodeVerificationCallBack
        });

    }
}
var emailCodeVerificationCallBack = function (response) {    
    if (response.request.status === 200) {        
        $('#FlowtickContainer').fadeOut(300, function () {
            $(this).html('');
        });
        getAccountDetailPartialView();

    } else if (response.request.status === 404) {
        errorExtractor(response);
        $("#btnCodeVerification, .otp-inputs .otp").removeClass("readonly").prop("disabled", false).text("Verify");
    }
}
function getAccountDetailPartialView() {
    ajaxRequest({
        url: '/Auth/GetPartialView',
        type: 'POST',
        data: { url: "~/Views/Shared/PartialViews/Auth/SignUp/_AccountDetailPartialView.cshtml" },
        callBack: getAccountDetailPartialViewCallBack
    }, 'html');
}
var getAccountDetailPartialViewCallBack = function (responseHTML) {
    setTimeout(function () {
        $('#FlowtickContainer').append(responseHTML).fadeIn(500);
        initializeAccountDetailElements(userEmail, code);
    }, 500);
}
function initializeCodeVerificationElements() {
    $("#email").val(userEmail);
    $("#email").text(userEmail);
    $('.email-text').text(userEmail);
    const $inputs = $(".otp-inputs input");
    $inputs.eq(0).trigger("focus");
    $inputs.off('input').on("input", function () {
        const index = $inputs.index(this);
        if ($(this).val() && index < $inputs.length - 1) {
            $inputs.eq(index + 1).trigger("focus");
        }
    });

    $inputs.off('keydown').on("keydown", function (e) {
        const index = $inputs.index(this);
        if (e.key === "Backspace" && !$(this).val() && index > 0) {
            $inputs.eq(index - 1).trigger("focus");
        }
    });
}