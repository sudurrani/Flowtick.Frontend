$(document).on('click', '#btnProjectContinue', function (e) {
    e.preventDefault();
    createProject();
});
function createProject() {
    debugger;
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
    debugger
    if (response.request.status === 201) {

        let accessToken = response.request.responseJSON.token.accessToken;        
        localStorage.setItem('accessToken', accessToken);

        // redirect to Dashboard View
        window.location.href = '/Dashboard/Main';
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