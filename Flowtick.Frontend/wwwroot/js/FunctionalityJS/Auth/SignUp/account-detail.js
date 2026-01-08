var _invitationEmail = '';
$(function () {
    //alert('ready');
    var urlParams = new URLSearchParams(window.location.search);
    _invitationEmail = urlParams.get('email');
    if (_invitationEmail == null) {
      //  alert('null');
    }
    else {
       // alert('not null');
        $('#email').val(_invitationEmail);
        $('#email').attr('readonly', true);

        $("#email").addClass("readonly").prop("disabled", true);

    }
});
$(document).on('click', '#btnAccountDetail', function () {
    //debugger;
    createUser();
});
function createUser() {
    if (customValidateForm('AccountDetailForm')) {
        const inputJSON = getFormDataAsJSONObject('AccountDetailForm');
        fullName = inputJSON.fullName;
        password = inputJSON.password;
        apiRequest({
            url: 'flowtick/auth/register',
            type: 'POST',
            data: {
                "fullName": fullName,
                "code": code,
                "email": userEmail,
                "password": password,
                "userWorkTypeId": workTypeId,
                "userWorkTypeRoleId": workTypeRoleId

            },
            callBack: createUserCallBack
        });
    }
    
}
var createUserCallBack = function (response) {
    if (response.request.status === 201) {
    /*    debugger;*/

        $('#FlowtickContainer').fadeOut(300, function () {
            $(this).html('');
        });
        let email = localStorage.getItem('InvitationEmail');
        let code = localStorage.getItem('InvitationCode');
        let projectName = localStorage.getItem('ProjectName');
       

        if (email == null || email == undefined) {
            getWorkTypePartialView();
        }
        else {
            
            //remove local storage key
            localStorage.removeItem('InvitationEmail');
            localStorage.removeItem('InvitationCode');
            localStorage.removeItem('ProjectName');
           
         /*   window.location.href = `/Project/Invitation?flowtick=${code}&email=${email}`;*/
            window.location.href = `/Project/Invitation?flowtick=${code}&email=${email}&project=${projectName}`;
          /*  window.location.href = `/Dashboard/Main?flowtick=${code}&email=${email}`;*/
        }

    
    } else {
        errorExtractor(response);
    }
 
}



function getWorkTypePartialView() {    
    ajaxRequest({
        url: '/Auth/GetPartialView',
        type: 'POST',
        data: { url: "~/Views/Shared/PartialViews/Auth/SignUp/_WorkTypePartialView.cshtml" },
        callBack: getWorkTypePartialViewCallBack
    }, 'html');
}
var getWorkTypePartialViewCallBack = function (responseHTML) {
    setTimeout(function () {        
        $('#FlowtickContainer').append(responseHTML).fadeIn(500);
        getWorkTypes();
    }, 500);
}
function initializeAccountDetailElements() {
    $("#email").text(userEmail);
}