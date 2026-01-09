$(function () {
    $(document).on('keydown', '#email', function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            $('#password').focus();
        }
    });
    $(document).on('keydown', '#password', function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            loginProject();
        }
    });
});
$(document).on('click', '#btnLogin', function () {
    loginProject();
});

function loginProject() {
    if (customValidateForm('LoginForm')) {

        $("#btnLogin, #email, #password").addClass("readonly").prop("disabled", true).text("Log in...");

        const inputJSON = getFormDataAsJSONObject('LoginForm');        
        apiRequest({
            url: 'flowtick/auth/login',
            type: 'POST',
            data:  inputJSON,
            callBack: loginProjectCallBack
        });
    }
}
var loginProjectCallBack = function (response) {    
    if (response.request.status === 200) {           
        let accessToken = response.request.responseJSON.access_token;        
        localStorage.setItem('accessToken', accessToken);

        redirectToAction('/Dashboard/Main?ID=', 0);
    }
    else if (response.request.status === 401) {
        infoToastr('Invalid email or password', 'info');
        $("#btnLogin, #email, #password").removeClass("readonly").prop("disabled", false).text("Log in");
    }
    else {
        errorExtractor(response);
        $("#btnLogin, #email, #password").removeClass("readonly").prop("disabled", false).text("Log in");
    }
}