$(document).on('click', '#btnProjectContinue', function () {
    createProject();
});
function createProject() {
    if (customValidateForm('ProjectForm')) {
        const inputJSON = getFormDataAsJSONObject('ProjectForm');
        project = inputJSON.project;
        apiRequest({
            url: 'flowtick/projects',
            type: 'POST',
            data: {
                "name": project,
                "email": userEmail

            },
            callBack: createProjectCallBack
        });
    }
}
var createProjectCallBack = function (response) {
    if (response.request.status === 201) {

        let accessToken = response.request.responseJSON.token.accessToken;
        console.log(accessToken);
        localStorage.setItem('accessToken', accessToken);

        // redirect to Dashboard View
        window.location.href = '/Dashboard/Index';
    }
    else {
        errorExtractor(response);
    } 
}


function getProjectPartialView() {
    ajaxRequest({
        url: '/Auth/GetPartialView',
        type: 'POST',
        data: { url: "~/Views/Shared/PartialViews/Auth/SignUp/_ProjectPartialView.cshtml" },
        callBack: getProjectPartialViewCallBack
    }, 'html');
}
var getProjectPartialViewCallBack = function (responseHTML) {
    setTimeout(function () {
        $('#FlowtickContainer').html(responseHTML)
    }, 500);
}