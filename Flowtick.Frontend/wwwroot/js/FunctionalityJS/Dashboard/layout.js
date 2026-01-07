$(function () {

    $('#roleId').select2({
        dropdownParent: $('#addPeopleModal') ,
        width: '100%'

    });
    //take data from access token
    const token = localStorage.getItem("accessToken");
    

    const tokenData = parseJwt(token);
    var loginUserID = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    console.log("loginUserID:", loginUserID);


    $("#loginProfileImg").html(` <img src="https://i.pravatar.cc/32?img=${loginUserID}" class="rounded-circle ms-0" width="32"  height="32" alt="User" />`);


    //end

    $("#sidebarToggle").on("click", function () {
        $("#sidebar").toggleClass("collapsed");
        $("#mainContent").toggleClass("expanded");
    });
    $("#gridIcon").on("click", function (e) {
        e.stopPropagation();
        $("#gridDropdown").toggleClass("show");
    });
    $("#btnHome").click(function () {
        window.location.href = "/Dashboard/Index";
    });
    $("#btnCreateProject").click(function () {
        $('#createProjectModal').modal('show');
    })
    $("#saveProject").click(function () {
        createProject()
    })
    $("#addPeople").click(function (e) {

        e.preventDefault();
        addPeopleToProject();
    });
   

    console.log(localStorage);
    /* loadSidebarProjects();*/
    getMyProjects();
});

function addPeopleToProject() {
    if (customValidateForm('addPeopleForm')) {

        let emailText = $('#email').val().trim();

        // split by comma
        let email = emailText.split(',').map(e => e.trim()).filter(e => e.length);  

        // add simple email validation because take the input type text instead of email
        let valid = email.every(e => /\S+@\S+\.\S+/.test(e));
        if (!valid) {
            infoToastr('One or more emails are invalid', 'info');
            return;
        }

        let roleId = $('#roleId').val();

        // get projectId stored in modal
        let projectId = $('#addPeopleModal').data('project-id');

        // Disable button & inputs
        $("#addPeople").addClass("readonly").prop("disabled", true).text("Adding...");
        $("#closeModal").addClass("readonly").prop("disabled", true);
        $("#email, #roleId").prop("disabled", true);

        apiRequest({
            url: 'flowtick/project/member/invite',
            type: 'POST',
            data: {

                "email": email,
                "projectId": projectId,
                "roleId": roleId,

            },
            callBack: addPeopleToProjectCallBack
        });
    }
}
var addPeopleToProjectCallBack = function (response) {
    if (response.request.status === 201) {

        successToastr("Invitation Send Successfully", 'success');
        $('#addPeopleModal').modal('hide');

    } else {

        errorExtractor(response);
        $('#addPeopleModal').modal('hide');

    }
    // enable button back
    $("#addPeople").removeClass("readonly").prop("disabled", false).text("Add");
    $("#closeModal").removeClass("readonly").prop("disabled", false);
    $("#email, #roleId").prop("disabled", false);

}
function getMyProjects() {
    ////debugger;
    apiRequest({
        url: 'flowtick/projects/me',
        type: 'GET',
        data: {},
        callBack: getMyProjectsCallBack
    });
}
var getMyProjectsCallBack = function (response) {
    if (response.request.status === 201) {

        var projects = response.data;

        var $container = $("#projectContainer");
        var $sidebar = $("#sidebarProjects");

        $container.html("");
        $sidebar.html("");

        $.each(projects, function (index, project) {

            // Dashboard project cards
            $container.append(`
                    <div class="col-12 col-sm-6 col-md-4">
                        <div class="app-card active open-project-board" data-id="${project.id}" data-name=" ${project.name}" >
                            <div class="d-flex align-items-center">
                                <div class="app-icon bg-light">
                                    <img src="/img/logo/logo.png" style="width:32px; height:32px;" />
                                </div>
                                <div class="ms-3">
                                    <h6 class="mb-0 fw-semibold">${project.name}</h6>
                                    <small class="text-muted">${project.description}</small>
                                </div>
                            </div>
                        </div>
                    </div>
              `);
        });

            $.each(projects, function (index, project) {
              $('#sidebarProjects').append(`
                <a class="menu-item d-flex align-items-center open-project-board" data-id="${project.id}" data-name=" ${project.name}" >
                    <img src="/img/logo/logo.png" style="width:30px;height:30px;margin-right:12px">
                    ${project.name}
                    <span class="ms-auto three-dots">
                        <i class="bi bi-three-dots" style="margin-right:0;"></i>
                    </span>
                </a>
              `);
            });
        //  define trigger when sidebar is loadded  add the active class to that menu item by using this trigger name  on the project view js
        $(document).trigger("sidebarProjectsLoaded");
    }
    else {
        console.log(response);
        errorExtractor(response);
      
    }
};

$(document).on("click", ".three-dots", function (e) {
    e.stopPropagation();
    $(".project-dropdown").remove();

    let projectId = $(this).closest('.menu-item').data('id');// <-- project id

    let offset = $(this).offset();
    let height = $(this).outerHeight();

    $("body").append(`
        <ul class="dropdown-menu project-dropdown"

         data-id="${projectId}"  
            style="
                display:block;
                position:absolute;
                top:${offset.top + height}px;
                left:${offset.left - 10}px;

            ">
            <li><a class="dropdown-item"><i class="bi bi-star me-2"></i>Add to Starred</a></li>
            <li><a class="dropdown-item" id="addPeopleBtn"><i class="bi bi-person-add me-2"></i>Add People</a></li>
            <li><a class="dropdown-item"><i class="bi bi-clipboard me-2"></i>Save as template</a></li>
            <li><a class="dropdown-item" id="spaceSetting"><i class="bi bi-gear me-2"></i>Space setting</a></li>
            <li><a class="dropdown-item delete-space"><i class="bi bi-trash3 me-2"></i>Delete Space</a></li>
        </ul>
    `);
});


$(document).on('click', '.project-dropdown', function (e) {
    e.stopPropagation();
});


// Hide dropdown when clicking anywhere else
$(document).on('click', function () {
    $('.project-dropdown').remove();
});

$(document).on("click", ".open-project-board", function () {
    let id = $(this).data("id");
    let name = $(this).data("name");
    // Redirect with query params
    window.location.href = `/Project/Board?id=${id}&name=${encodeURIComponent(name)}`;
});

$(document).on('click', '#addPeopleBtn', function (e) {
    e.preventDefault();
    e.stopPropagation();

    let projectId = $('.project-dropdown').data('id');   // <-- get id

    $('#addPeopleModal').data('project-id', projectId);

    // clear form
    $('#addPeopleForm')[0].reset();
    $('#addPeopleModal').modal('show');

    getRole();
});

function getRole() {
    apiRequest({
        url: 'flowtick/project/roles',
        type: 'GET',
        data: {},
        callBack: getRoleCallBack
    });
}

var getRoleCallBack = function (response) {
    if (response.request.status === 200) {

        var roles = response.data; //  array

        var dropdown = $("#roleId");
        dropdown.empty();
        dropdown.append('<option selected disabled>Select Role</option>');

        $.each(roles, function (index, role) {
            var option = `<option class="role-option"  value="${role.id}">${role.description}</option>`; 
            dropdown.append(option);
        });
    }
    else {
        errorExtractor(response);
    }
};

$(document).on('click', '#spaceSetting', function () {
    window.location.href = `/Project/SpaceSetting`;
 
});
// Handle click for all sidebar items, including dynamically loaded ones
$(document).on("click", ".sidebar .menu-item", function (e) {
    if ($(e.target).closest(".three-dots").length > 0) return;

    $(".sidebar .menu-item").removeClass("active");

    $(this).addClass("active");
});

function createProject() {
  if (customValidateForm('createProjectForm')) {
  
    const inputJSON = getFormDataAsJSONObject('createProjectForm');
    apiRequest({
        url: 'flowtick/projects',
        type: 'POST',
        data:  inputJSON ,
        callBack: createProjectCallBack
    });
  };
}
var createProjectCallBack = function (response) {
    if (response.request.status === 201) {
        $('#createProjectModal').modal('hide');
        location.reload();
    }
    else if (response.request.status === 422) {
        infoToastr('The Name field is required', 'info');
    }
    else {
        errorExtractor(response);
    }
};

