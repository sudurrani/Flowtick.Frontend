var _getProjectEpics = []
$(function () {
    renderTinyMCE('#DescriptionEditor, #Comment');
    $('#modalTaskCode').click(function () {
        redirectToAction(`/Task/Detail?projectId=${encodeURIComponent(encryptNumber(projectId))}&id=`, $('#modalTaskID').val());
    })

    // Show editor by default
    $('#description-view').hide();
    $('#description-editor-wrapper').show();

    // Save description
    $('#save-description').on('click', function () {
        let html = quill.root.innerHTML;
        $('#description-display').text($(html).text());
        $('#description-editor-wrapper').hide();
        $('#description-view').show();
    });
    // editor js end

    $("#updateTask").click(function () {
        updateTask();
    });

    $("#addComment").click(function () {
        const taskId = $("#modalTaskID").val().trim();
        addComment(taskId);
    });
})

function getTaskDetail(taskID) {
    let url = `flowtick/tasks/${taskID}`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getTaskDetailCallBack
    });
}
var getTaskDetailCallBack = function (response) {
    if (response.request.status === 200) {

        const getTaskData = response.data
        assigneeID = getTaskData.assignee.id;
        reviewerID = getTaskData.reviewerId;
        reporterID = getTaskData.reporterId;
        statusID = getTaskData.status.id;

        $("#modalTaskID").val(getTaskData.id);
        $("#modalTaskCode").text(getTaskData.code);
        $("#modalTaskTitle").val(getTaskData.title);

        tinymce.get("DescriptionEditor").setContent(
            getTaskData.description ? getTaskData.description : "Add Description here"
        );

        /*   selected epic code and id */
        $('.selected-epic-code span').text(getTaskData.parent ? getTaskData.parent.code : 'no parent');
        $('.selected-epic-code').attr('data-id', getTaskData.parent ? getTaskData.parent.id : '');

        /// RIGHT SIDE PANEL - PARENT LINKING/SHOWING
        if (getTaskData.parent) {
            $('#SideBarParentContainer').show();
            $('#SideBarParent .task-no').text(getTaskData.parent.code);
            $('#SideBarParent .child-task-title').text(getTaskData.parent.title);
            $('#SideBarParent .task-no').css('font-weight', 'bold');
            $('#SideBarParent .child-task-title').css('font-weight', 'bold');
            $('#SideBarParent').attr('data-id', getTaskData.parent.id);
        }
        else {
            $('#SideBarParentContainer').hide();
        }
        /// RIGHT SIDE PANEL - PARENT LINKING/SHOWING

        ///Epic / Parent Linking Code Logic Goes here
        $('[data-bs-toggle="tooltip"]').tooltip();
        if (getTaskData.linking != null) {
            $('#epicParentLinkDropdown').addClass('d-flex').show();
            $('#epicParentLinkIcon').removeClass();
            $('#epicParentLinkIcon').addClass(getTaskData.linking.icon).attr("style", (getTaskData.linking.iconCSS.replace(/^style="|"$|'/g, '')));


            var $projectEpics = $(".project-epics-list");  // jQuery object
            $projectEpics.empty();

            $.each(getTaskData.linking.items, function (index, item) {
                var li = `
                                                 <li class="dropdown-item selecte-epic"  data-id="${item.id}"data-code="${item.code}">
                                                      <i class="${item.type.icon}" ${item.type.iconCSS}></i>
                                                         <span class="user-name epic-code">${item.code}</span>
                                                     <span class="user-name ms-2">${item.title}</span>
                                                 </li>
                                         `;
                $projectEpics.append(li);
            });
        }
        else {
            $('#epicParentLinkDropdown').removeClass('d-flex').hide();
        }
        ///Ends - Epic / Parent Linking Code Logic Goes here

        const getChild = getTaskData.child;

        //getAllSubTaskOfModal(getChild)

        loadChildTasksTable(getTaskData, getChild);

        loadProjectUserDropdown("asignee-user-list", "selected-assignee", assigneeID);
        loadProjectUserDropdown("reporter-user-list", "selected-reporter", reporterID);
        loadProjectUserDropdown("reviewer-user-list", "selected-reviewer", reviewerID);

        setTimeout(function () {
            loadProjectUserDropdown("subtask-user-list", "subtask-selected-assignee");
        }, 300);

        loadStatusDropdown();


        // comment code start
        const getComments = getTaskData.comments;

        renderComments(getComments);

        /// GET TASK ATTACHMENTS
        getTaskAttachments(getTaskData.id);
        /// GET TASK ATTACHMENTS
    }
    else {
        errorExtractor(response);
    }
};

function closTaskModal() {
    $(".task-modal").fadeOut(200);
}

// handle click for assignee in modal
$(document).on("click", ".asignee-user-list .dropdown-item", function () {

    let name = $(this).data("name");
    let userId = $(this).data("id");
    let backgrounColor = $(this).find(".profile-image").attr("style");
    let avatar = `<div class="assignee-avatar-sm profile-image"  data-user-id="${userId}" style="${backgrounColor}">${getInitials(name)}</div>`;
    $(".selected-assignee").html(`${avatar} <span class="user-name ms-2">${name}</span> `);

    const taskId = $("#modalTaskID").val().trim();
    updateTaskAssignee(taskId, userId);
});
// handle click for reporter
$(document).on("click", ".reporter-user-list .dropdown-item", function () {

    let name = $(this).data("name");
    let reporterId = $(this).data("id");
    let backgrounColor = $(this).find(".profile-image").attr("style");

    let avatar = `<div class="assignee-avatar-sm profile-image" data-user-id="${reporterId}" style="${backgrounColor}">${getInitials(name)}</div> `;

    $(".selected-reporter").html(` ${avatar} <span class="user-name ms-2">${name}</span>`);

    const taskId = $("#modalTaskID").val().trim();
    updateTaskReporter(taskId, reporterId);

});

// handle click for reviewer
$(document).on("click", ".reviewer-user-list .dropdown-item", function () {

    let name = $(this).data("name");
    let reviewerId = $(this).data("id");
    let backgrounColor = $(this).find(".profile-image").attr("style");

    let avatar = `<div class="assignee-avatar-sm profile-image" data-user-id="${reviewerId}" style="${backgrounColor}">${getInitials(name)}</div> `;

    $(".selected-reviewer").html(`  ${avatar}  <span class="user-name ms-2">${name}</span>`);

    const taskId = $("#modalTaskID").val().trim();
    updateTaskReviewer(taskId, reviewerId);

});
//handle click of task user in  task subtask table
$(document).on("click", ".subtask-user-list .dropdown-item", function () {
    let name = $(this).data("name");
    let selectedUserId = $(this).data("id");
    let backgrounColor = $(this).find(".assignee-avatar-sm").attr("style");

    let avatar = `<div class="assignee-avatar-sm" data-id="${selectedUserId}" style="${backgrounColor}">${getInitials(name)}</div> `;

    $(this).closest(".dropdown").find(".subtask-selected-assignee").html(` ${avatar} <span class="user-name ms-2">${name}</span> `);

    const selectedRowTaskId = $(this).closest("tr").data("id");

    updateTaskAssignee(selectedRowTaskId, selectedUserId);
});


// Priority dropdown
$(document).on('click', '.priority-option', function () {

    let selectedText = $(this).find('.user-name').text();
    let selectedIcon = $(this).find('.priority-icon-item').data('icon');
    let selectedColor = $(this).find('.priority-icon-item').data('color');

    // Update icon + color
    $('.priority-icon')
        .removeClass()
        .addClass('priority-icon bi ' + selectedIcon)
        .css('color', selectedColor);

    // Update text
    $('#selectedPriority').text(selectedText);
});
//handle click of task status
$(document).on("click", ".select-status .dropdown-item", function () {
    // get values from clicked element
    var selectedStatusId = $(this).data("id");
    var text = $(this).text().trim();

    // update selected text
    $(".btn-task-status").attr("data-id", selectedStatusId);
    $(".btn-task-status span").text(text);

    const taskId = $("#modalTaskID").val().trim();
    updateTaskStatus(taskId, selectedStatusId);

});


//handle click of task status in  task subtask table
$(document).on("click", ".select-task-subTask-status .dropdown-item", function () {
    // get values from clicked element
    var id = $(this).data("id");
    var text = $(this).text().trim();

    // update selected text
    const $dropdown = $(this).closest(".dropdown");
    $dropdown.find(".btn-task-subtask-status").attr("data-id", id);
    $dropdown.find(".btn-task-subtask-status span").text(text);

    // find nearest row
    const selectedRowTaskId = $(this).closest("tr").data("id");

    updateTaskStatus(selectedRowTaskId, id);

});
// hnadle click Epic  dropdown in modal
$(document).on('click', '.selecte-epic', function () {

    let code = $(this).data("code");
    let epicId = $(this).data("id");

    // Update text
    $('.selected-epic-code span').text(code);
    $('.selected-epic-code').attr('data-id', epicId);


    const taskId = $("#modalTaskID").val().trim();
    updateTaskParent(taskId, epicId);

});
//add subtask row to create subtask inside task
$(document).on("click", "#btnAddChildWork", function (e) {
    // Stop click from propagating to parent elements
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    getTaskTypes();
    // loadTaskTypeDropdown();

    const $tbody = $("#childWorkTableTbody");

    // Prevent multiple add rows
    if ($tbody.find(".child-add-row").length) return;

    const rowHtml = `
                            <tr class="child-add-row">
                              <td colspan="5">
                                <div class="d-flex align-items-center gap-2 child-add-wrapper">
                                <form id="subTaskForm">
                                  <input tabindex="0" type="text" class="form-control child-add-input" placeholder="What needs to be done?" id="childWorkTitle" required/>
                                 </form>
                                  <!-- Epic/Task/Bug dropdown -->
                                          <div class="dropdown">
                                                <a class="text-decoration-none icon-btn dropdown-toggle child-task-type task-type-btn default-selected-value" data-bs-toggle="dropdown" id="childTaskTypeID" >
                                                      <i class=""></i><span class="ms-2 text-black"></span>
                                              </a>

                                          </div>
                                  <span class="child-add-action">
                                   <span  tabindex="0"  onclick="createTask('subTask');"  onkeypress="if(event.key==='Enter') createTask('subTask')"> <i class="bi bi-arrow-return-left"></i>  </span>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          `;

    $tbody.append(rowHtml);

    // Auto focus
    $tbody.find(".child-add-input").focus();
});

function getProjectEpics() {

    if (_getProjectEpics.length > 0) {

        var $projectEpics = $(".project-epics-list");
        $projectEpics.empty();

        $.each(_getProjectEpics, function (index, item) {
            var li = `
                                         <li class="dropdown-item selecte-epic"  data-id="${item.id}"data-code="${item.code}">
                                              <i class="bi bi-lightning-charge task-icon"></i>
                                                 <span class="user-name epic-code">${item.code}</span>
                                             <span class="user-name ms-2">${item.title}</span>
                                         </li>
                                 `;
            $projectEpics.append(li);
        });
        return;

    }
    let url = `flowtick/project/${projectId}/tasks/epic`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getProjectEpicsCallBack
    });
}
var getProjectEpicsCallBack = function (response) {

    if (response.request.status === 200) {

        _getProjectEpics = response.data;
        var $projectEpics = $(".project-epics-list");  // jQuery object
        $projectEpics.empty();

        $.each(_getProjectEpics, function (index, item) {
            var li = `
                                         <li class="dropdown-item selecte-epic"  data-id="${item.id}"data-code="${item.code}">
                                              <i class="bi bi-lightning-charge task-icon"></i>
                                                 <span class="user-name epic-code">${item.code}</span>
                                             <span class="user-name ms-2">${item.title}</span>
                                         </li>
                                 `;
            $projectEpics.append(li);
        });

    }
    else {
        errorExtractor(response);
    }
};

function updateTask() {
    const id = $("#modalTaskID").val();
    const taskTitle = $("#modalTaskTitle").val().trim();
    const taskDescription = tinymce.get('DescriptionEditor').getContent() //quill.root.innerHTML;
    const assignedId = $("#modalAssigneeID .profile-image").data("user-id");
    const reviewerId = $("#modalReviewerID .profile-image").data("user-id");
    const reporterId = $("#modalReporterID .profile-image").data("user-id");
    const statusId = $('.btn-task-status').data("id");

    let url = `flowtick/project/${projectId}/tasks/${id}`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "title": taskTitle,
            "description": taskDescription,
            "assigneeId": assignedId,
            "statusId": statusId,
            "reviewerId": reviewerId,
            "reporterId": reporterId,
            "parentId": null
        },
        callBack: updateTaskCallBack
    });

}
var updateTaskCallBack = function (response) {
    if (response.request.status === 204) {
        successToastr("Saved successfully", 'Task');
        getProjectTasks();

    }
    else {
        errorExtractor(response);
    }
};

function updateTaskStatus(taskId, selectedStatusId) {

    let url = `flowtick/tasks/${taskId}/status`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "statusId": selectedStatusId
        },
        callBack: updateTaskStatusCallBack
    });
}
var updateTaskStatusCallBack = function (response) {
    if (response.request.status === 204) {
        successToastr("Changed successfully", 'Status');
        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};


function updateTaskReporter(taskId, reporterId) {

    let url = `flowtick/tasks/${taskId}/reporter`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "reporterId": reporterId
        },
        callBack: updateTaskReporterCallBack
    });
}
var updateTaskReporterCallBack = function (response) {
    if (response.request.status === 204) {
        successToastr("Assigned successfully", 'Reporter');
        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};

function updateTaskReviewer(taskId, reviewerId) {

    let url = `flowtick/tasks/${taskId}/reviewer`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "reviewerId": reviewerId
        },
        callBack: updateTaskReviewerCallBack
    });
}
var updateTaskReviewerCallBack = function (response) {
    if (response.request.status === 204) {
        successToastr("Assigned successfully", 'Reviewer');
        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};

function updateTaskParent(taskId, selectedEpicId) {
    let url = `flowtick/tasks/${taskId}/parent`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "parentId": selectedEpicId
        },
        callBack: updateTaskParentCallBack
    });
}
var updateTaskParentCallBack = function (response) {
    if (response.request.status === 204) {
        successToastr("Assigned successfully", 'Parent');
        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};

function loadChildTasks(taskId = 0) {
    if (taskId <= 0) {
        return;
    }

    let url = `flowtick/tasks/${taskId}/child`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: function (response) {
            if (response.request.status === 200) {
                loadChildTasksTable(response.data.parent, response.data);
            } else {
                errorExtractor(response);
            }
        }

    });
}

function loadChildTasksTable(parentTask = {}, tasksArray = []) {
    var $subtasktbody = $('#childWorkTableTbody');
    $subtasktbody.empty(); // Clear old items

    $.each(tasksArray, function (index, item) {
        var tr = `
                                                     <tr data-id="${item.id}">
                                                         <td>
                                                         <i class="${item.type ? item.type.icon : ''} task-icon" ${item.type ? item.type.iconCSS : ''}></i>
                                                             <span class="task-no sub-task-detail" onclick="getSubTaskById(${item.id});" role="button">${item.code}</span>
                                                             <span class="child-task-title">${item.title}</span>
                                                         </td>
                                                         <td>
                                                             <i class="bi bi-filter " style="color:#E06C00"></i>
                                                                 Medium
                                                         </td>
                                                             <td hidden>${parentTask.title}</td>
                                                         <td>
                                                         <div class="dropdown">
                                                             <div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
                                                                 <div class="subtask-selected-assignee d-flex align-items-center">
                                                                           <div class="assignee-avatar-sm" style="background:${item.assignee.colorCode}" >${getInitials(item.assignee.name)} </div>
                                                                     <span class="user-name ms-2">${item.assignee ? item.assignee.name : ''}</span>
                                                                 </div>
                                                             </div>

                                                             <div class="dropdown-menu flowtick-dropdown">
                                                                 <div class="flowtick-dropdown-search">
                                                                     <i class="bi bi-search"></i>
                                                                     <input type="text" class="seach-user-dropdown" placeholder="Search users">
                                                                 </div>

                                                                 <ul class="dropdown-list  subtask-user-list" ></ul>
                                                             </div>
                                                         </div>
                                                         </td>
                                                         <td>
                                                            <div class="dropdown" >
                                                              <a class="text-decoration-none dropdown-toggle btn-task-subtask-status btn-create" data-bs-toggle="dropdown"data-id="${item.status.id}">
                                                                   <span>${item.status.name}</span>
                                                              </a>

                                                             <ul class="dropdown-menu task-status-list select-task-subTask-status">
                                                                  <!-- Dynamic items will load here -->
                                                             </ul>
                                                           </div>
                                                         </td>
                                                     </tr>
                                                  `;
        $subtasktbody.append(tr);
    });
}
function addComment(taskId) {
    debugger;
    // alert(taskId);
    const commentDescription = tinymce.get('Comment').getContent();

    if (!commentDescription) {
        infoToastr("Please Write Comment First", 'info');
        return;
    }

    let url = `flowtick/task/${taskId}/comments`;
    apiRequest({
        url: url,
        type: 'POST',
        data: {
            "comment": commentDescription
        },
        callBack: addCommentCallBack
    });
}
var addCommentCallBack = function (response) {
    if (response.request.status === 201) {
        successToastr("saved successfully", 'success');
        //  Clear  editor
        tinymce.get('Comment').setContent('');

        // Move cursor to editor
        tinymce.get('Comment').focus();

        getComments();
    }
    else {
        errorExtractor(response);
    }
};

function getComments() {
    const taskId = $("#modalTaskID").val().trim();

    let url = `flowtick/task/${taskId}/comments`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getCommentsCallBack
    });
}
var getCommentsCallBack = function (response) {
    if (response.request.status === 200) {
        // debugger;
        console.log(response.data);
        const getComments = response.data;
        renderComments(getComments);

    }
    else {
        errorExtractor(response);
    }
};

function renderComments(comments) {
    const $wrapper = $(".comments-container");
    $wrapper.empty();

    $.each(comments, function (index, comment) {
        const isLoginUser = comment.user.id === Number(loginUserID);
        const sideClass = isLoginUser ? "right" : "left";
        const userName = comment.user.name
        const html = `
                <div class="comment-item ${sideClass}" data-id="${comment.id}">

                    <div class="comment-user-img">${getInitials(userName)}</div>

                    <div class="comment-bubble">
                        <div class="comment-header">
                            <span class="user-name">${userName}</span>
                            <span class="comment-meta">
                                <span class="date">${comment.date}</span>
                                <span class="time">${comment.time}</span>
                            </span>
                        </div>

                        <div class="comment-text">
                            ${comment.comment}
                        </div>
                    </div>

                </div>
            `;

        $wrapper.append(html);
    });
}