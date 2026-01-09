$(function () {

    var urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    id = getAndDecryptID(id);
    getProjectById(id);

    $('#btnSave').on('click', function () {
        saveRecord();
    });
});
function saveRecord() {
    let inputJSON = getFormDataAsJSONObject('projectForm');    
    let url = `flowtick/projects/${inputJSON.id}`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: inputJSON,
        callBack: saveRecordCallBack
    });
}
var saveRecordCallBack = function (response) {
    if (response.request.status == 204) {
        successToastr('Update success', 'Project');
    }
}
function getProjectById(id = 0) {
    let url = `flowtick/projects/${id}`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {

        },
        callBack: getProjectByIdCallBack
    });
}
var getProjectByIdCallBack = function (response) {
    if (response.request.status === 200) {
        if (response.data) {
            setResponseToFormInputs(response.data);
        }
    }
}