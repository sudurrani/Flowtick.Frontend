
var _projectMember;
var loginUserID;
var assigneeID;
var reporterID;
var reviewerID;
var statusID;
let quill;
let originalDescription = "";

var _taskTypes = [];
var _getProjectEpics = [];

$(function () {

    //take data from access token
    const token = localStorage.getItem("accessToken");
    

    const tokenData = parseJwt(token);
    var userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    //const userName = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    //const email = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    loginUserID = userId;

    //end

    var urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    projectName = urlParams.get('name');


   // add the active class on selected project menu item
    $(document).on("sidebarProjectsLoaded", function () {


        if (!projectId) return;

        $(".menu-item").removeClass("active");

        $(`.open-project-board[data-id="${projectId}"]`)
            .addClass("active");
    });


    $('#projectName').text(projectName);

    $(document).click(function (e) {
        if (!$(e.target).closest("#createCardBox, #createBtn").length) {
            $("#createCardBox").hide();
            $("#createBtn").show();
        }
    });

    // Filter user dropdown 
    $(document).on('keyup', '.seach-user-dropdown', function (e) {
        e.stopImmediatePropagation();
        let value = $(this).val().toLowerCase();

        let dropdown = $(this).closest('.assign-dropdown');

        dropdown.find('.assign-item').each(function () {
            $(this).toggle(
                $(this).find('.user-name').text().toLowerCase().includes(value)
            );
        });
    });
    // editor js start
    // Init Quill
   
    // Show editor by default
    $('#description-view').hide();
    $('#description-editor-wrapper').show();
    // Click to Edit description
    //$('#description-display').on('click', function () {
    //    originalDescription = quill.root.innerHTML;
    //    $('#description-view').hide();
    //    $('#description-editor-wrapper').show();
    //});

    // Save description
    $('#save-description').on('click', function () {
        let html = quill.root.innerHTML;
        $('#description-display').text($(html).text());
        $('#description-editor-wrapper').hide();
        $('#description-view').show();
    });

    // Cancel edit
    //$('#cancel-description').on('click', function () {
    //    quill.root.innerHTML = originalDescription;
    //    $('#description-editor-wrapper').hide();
    //    $('#description-view').show();
    //});
    // editor js end



    $("#btnCreateTask").click(function () {
        createTask();

     
    });


    getTaskTypes();
    getProjectTasks();
    getProjectMembers();

});

//add subtask row to create subtask inside task
$(document).on("click", "#btnAddChildWork", function (e) {
    // Stop click from propagating to parent elements
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    getTaskTypes();

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
						<a class="text-decoration-none icon-btn dropdown-toggle task-type-btn default-selected-value" data-bs-toggle="dropdown" id="childTaskTypeID" style="border:1px solid #dee2e6;border-radius:6px;padding: .375rem .75rem;font-size: 1rem; font-weight: 400; line-height: 1.5;">
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

// Open modal on .task-code click
$(document).on("click", ".task-card ", function () {
    /*    debugger;*/
    const taskID = $(this).data("task-id");
    const parentID = $(this).data("parent-id");
    const isSubTask = $(this).data("issubtask");

    //  Get task data
    const typeIcon = $(this).data("type-icon");
    const typeStyle = $(this).data("type-style");
 
    if (typeIcon) {
        //if icon exsist show this 
        $("#modalTaskTypeIcon i").attr("class", typeIcon).attr("style", typeStyle);
    }
    else {
        //if not  exsist show this dummy icon
        $("#modalTaskTypeIcon i").attr("class", "bi bi-circle").attr("style", "");   
    }
    if (typeIcon === 'bi bi-check-square' || typeIcon === 'bi bi-check2-square') {
        $('#epicDropdown').show();
        $(".link-icon").css("display", "block");
    } else {
        $('#epicDropdown').hide();
        $(".link-icon").css("display", "none");
    }
     
        $(".project-epics-list").empty(); 
      
        $(".task-modal").fadeIn(500);

        getTaskDetail(taskID);

        getProjectEpics();



});

// Close modal on close button click
$(document).on("click", ".btn-close-modal", function () {
    $(".task-modal").fadeOut(200);
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

// Handle for assigne user in create task selection
$(document).on("click", ".create-task-user-list .assign-item", function () {

    let userId = $(this).data("id");
    let avatar = `<img src="https://i.pravatar.cc/32?img=${userId}" class="assigne-avatar rounded-circle"data-user-id="${userId}" />`;

    $(this).closest(".dropdown").find('.create-task-user').html(avatar);
});

// handle click for assignee
$(document).on("click", ".asignee-user-list .assign-item", function () {

    let name = $(this).data("name");
    let userId = $(this).data("id");

    let avatar = `<img src="https://i.pravatar.cc/32?img=${userId}" class="assigne-avatar" data-user-id="${userId}" /> `;

    $(".selected-assignee").html(`${avatar} <span class="user-name ms-2">${name}</span> `);


   const taskId = $("#modalTaskID").val().trim();
   updateTaskAssignee(taskId, userId);

});

// handle click for reporter
$(document).on("click", ".reporter-user-list .assign-item", function () {

    let name = $(this).data("name");
    let reporterId = $(this).data("id");

    let avatar = `<img src="https://i.pravatar.cc/32?img=${reporterId}" class="assigne-avatar" data-user-id="${reporterId}" /> `;

    $(".selected-reporter").html(` ${avatar} <span class="user-name ms-2">${name}</span>`);

     const taskId = $("#modalTaskID").val().trim();
     updateTaskReporter(taskId, reporterId);
  
});

// handle click for reviewer
$(document).on("click", ".reviewer-user-list .assign-item", function () {

    let name = $(this).data("name");
    let reviewerId = $(this).data("id");

    let avatar = `<img src="https://i.pravatar.cc/32?img=${reviewerId}" class="assigne-avatar" data-user-id="${reviewerId}" />`;

    $(".selected-reviewer").html(`  ${avatar}  <span class="user-name ms-2">${name}</span>`);

     const taskId = $("#modalTaskID").val().trim();
     updateTaskReviewer(taskId, reviewerId);

});

// Handle for card-user-list in  task card
$(document).on("click", ".card-user-list .assign-item", function (e) {
    e.stopImmediatePropagation();

    let userId = $(this).data("id");
    let avatar = `<img src="https://i.pravatar.cc/32?img=${userId}" class="assigne-avatar rounded-circle" />`;

    $(this).closest(".dropdown").find(".selected-card-assignee").html(avatar);

    const selectedTasId = $(this).closest(".task-card").data("task-id"); 
   updateTaskAssignee(selectedTasId, userId);

});

//handle click of task user in  task subtask table 
$(document).on("click", ".subtask-user-list .assign-item", function () {
    //debugger;
    let name = $(this).data("name");
    let selectedUserId = $(this).data("id");

    let avatar = `<img src="https://i.pravatar.cc/32?img=${selectedUserId}" class="assigne-avatar" data-user-id="${selectedUserId}" /> `;

    $(this).closest(".dropdown").find(".subtask-selected-assignee").html(` ${avatar} <span class="user-name ms-2">${name}</span> `);

    const selectedRowTaskId = $(this).closest("tr").data("id");

    updateTaskAssignee(selectedRowTaskId, selectedUserId);
});


//handle click of task type

$(document).on("click", ".task-type-menu .dropdown-item", function (e) {
    e.preventDefault();

    // Get values from clicked element
    var id = $(this).data("id");
    var icon = $(this).find("i").attr("class");
    var style = $(this).find("i").attr("style");
    var text = $(this).text().trim();

    // Find the specific dropdown button for this menu
    var $btn = $(this).closest(".dropdown").find(".task-type-btn");

    // Update only this button
    $btn.attr("data-id", id);
    $btn.find("i").attr("class", icon).attr("style", style);
    $(".task-type-btn span").text(text);
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
    //debugger;
    let code = $(this).data("code");
    let epicId = $(this).data("id");

    // Update text
    $('.selected-epic-code span').text(code);
    $('.selected-epic-code').attr('data-id', epicId);

});

$(document).on("click", ".selected-card-assignee, .seach-user-dropdown", function (e) {
    e.stopImmediatePropagation();
});


$(document).on("click", ".load-task-action-dropdown", function (e) {
    e.stopPropagation(); // prevent card click
    loadTaskActionDropdown(this);
});

$(document).on("click", function () {
    $(".task-dropdown").remove();
});

function getTaskStatus() {
    apiRequest({
        url: 'flowtick/task/statuses',
        type: 'GET',
        data: {},
        callBack: getTaskStatusCallBack
    });
}
var getTaskStatusCallBack = function (response) {

    if (response.request.status === 200) {

        var taskStatus = response.data; // your array
        // find the item having id = 1
        var selectedItem = taskStatus.find(x => x.id == statusID);
        if (selectedItem) {
            $(".btn-task-status").attr("data-id", selectedItem.id);

            $(".btn-task-status span").text(selectedItem.description);
        }

        var $taskStatusList = $('.task-status-list');

        $taskStatusList.empty(); // Clear old items

        $.each(taskStatus, function (index, item) {
            var li = `
						<li>
							<a class="dropdown-item" href="#" data-id="${item.id}" style="font-size:13px;">
								<i class="${item.icon} " ${item.iconCSS}></i>
								${item.description}
							</a>
						</li>
					`;

            $taskStatusList.append(li);
        });
    }
    else {
        errorExtractor(response);
    }
};

function getTaskTypes() {
    apiRequest({
        url: 'flowtick/task/types',
        type: 'GET',
        data: {},
        callBack: getTaskTypesCallBack
    });
}
var getTaskTypesCallBack = function (response) {
    if (response.request.status === 200) {

        var taskTypes = response.data; // your array
        _taskTypes = response.data; // your array
        // find the item having id = 3
        var defaultItem = taskTypes.find(x => x.id == 3);
        if (defaultItem) {
            $(".task-type-btn").attr("data-id", defaultItem.id);
            $(".task-type-btn i").attr("class", defaultItem.icon).attr("style", defaultItem.iconCSS.replace('style="', '').replace('"', ''));

            $(".task-type-btn span").text(defaultItem.description);
        }

        var defaultItemForSubTask = taskTypes.find(x => x.id == 4);
        if (defaultItemForSubTask) {
            $(".default-selected-value").attr("data-id", defaultItemForSubTask.id);
            $(".default-selected-value i").attr("class", defaultItemForSubTask.icon).attr("style", defaultItemForSubTask.iconCSS.replace('style="', '').replace('"', ''));

            $(".default-selected-value span").text(defaultItemForSubTask.description);
            $(".default-selected-value").attr("readonly");
        }

        var $taskTypeMenu = $('.task-type-menu');

        $taskTypeMenu.empty(); // Clear old items

        $.each(taskTypes, function (index, item) {
            var li = `
						<li>
							<a class="dropdown-item" href="#" data-id="${item.id}">
								<i class="${item.icon} " ${item.iconCSS}></i>
								${item.description}
							</a>
						</li>
					`;

            $taskTypeMenu.append(li);
        });
    }
    else {
        errorExtractor(response);
    }
};
function getProjectTasks() {
    let url = `flowtick/project/${projectId}/tasks`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getProjectTasksCallBack
    });
}
var getProjectTasksCallBack = function (response) {
    if (response.request.status === 200) {
      /*  console.log(response)*/

        // Filter into 4 arrays based on status.name
       
        const todoTasks = (response.data || []).filter(item => item.status?.name === "ToDo");
        const inProgressTasks = (response.data || []).filter(item => item.status?.name === "In Progress");
        const reviewTasks = (response.data || []).filter(item => item.status?.name === "Review");
        const doneTasks = (response.data || []).filter(item => item.status?.name === "Done");

        $('#toDoTasksList').empty();
        $('#inProgressTasksList').empty();
        $('#reviewTasksList').empty();
        $('#doneTasksList').empty();
        // Loop through toDoTasks  and append HTML
        $.each(todoTasks, function (index, task) {
            let leftMargin = task.isSubTask == true ? 'margin-left:5px' : '';
            var taskHtml = `
		<div class="task-card " style="	border-left-color: #1868DB; margin-bottom:8px; ${leftMargin}" data-task-id="${task.id}"   data-isSubtask="${task.isSubTask}" data-parent-id="${task.parent ? task.parent.id : ''}" data-type-icon="${task.type ? task.type.icon : ''}" data-type-style="${task.type ? task.type.iconCSS.replace(/^style\s*=\s*"(.*)"$/, '$1') : ''}">
		  <div class="d-flex align-items-center">
			 <h6 class="task-title">${task.title}<span class="task-card-icons d-none"><i class="bi bi-pencil-square"></i></span></h6>
		     <span class="task-card-icons ms-auto d-none load-task-action-dropdown"><i class="bi bi-three-dots"></i></span>
		  </div>
			${task.parent ? `<span class="task-tag" style="background-color:#1868DB;">${task.parent.title}</span>` : ''}
			<div class="d-flex align-items-center mt-2"> 
				<div class="d-flex align-items-center">
					<i class="${task.type ? task.type.icon : ''} task-icon" ${task.type ? task.type.iconCSS : ''}></i>
					<small class="task-code">${task.code}</small>
				</div>
				<div class="ms-auto d-flex align-items-center">
					<i class="bi bi-list me-2 text-danger" style="font-size: 1.2rem;"></i>
					<!-- Avatar -->
					<div class="dropdown">
							<div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
								<div class="selected-card-assignee d-flex align-items-center">
					                  <img src="${ task.assignee ? `https://i.pravatar.cc/32?img=${task.assignee.id}`: 'https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32'}" class="assigne-avatar" />

								</div>
							</div>

							<div class="dropdown-menu assign-dropdown">
								<div class="assign-search">
									<i class="bi bi-search"></i>
									<input type="text" class="seach-user-dropdown" placeholder="Search users">
								</div>

								<ul class="assign-list  card-user-list" ></ul>
							</div>
						</div>
				</div>
			</div>
		</div>
	`;

            $('#toDoTasksList').append(taskHtml);
        });

        // Loop through inProgressTasks  and append HTML
        $.each(inProgressTasks, function (index, task) {
            var taskHtml = `
		<div class="task-card " style="	 margin-bottom:8px" data-task-id="${task.id}" data-isSubtask="${task.isSubTask}" data-parent-id="${task.parent ? task.parent.id : ''}"  data-type-icon="${task.type ? task.type.icon : ''}" data-type-style="${task.type ? task.type.iconCSS.replace(/^style\s*=\s*"(.*)"$/, '$1') : ''}">
		  <div class="d-flex align-items-center">
		    <h6 class="task-title">${task.title}<span class="task-card-icons d-none"><i class="bi bi-pencil-square"></i></span></h6>
		     <span class="task-card-icons ms-auto d-none load-task-action-dropdown"><i class="bi bi-three-dots"></i></span>
		  </div>
				${task.parent ? `<span class="task-tag">${task.parent.title}</span>` : ''}
			<div class="d-flex align-items-center mt-2"> 
				<div class="d-flex align-items-center">
					<i class="${task.type ? task.type.icon : ''} task-icon" ${task.type ? task.type.iconCSS : ''}></i>
					<small class="task-code">${task.code}</small>
				</div>
				<div class="ms-auto d-flex align-items-center">
					<i class="bi bi-list me-2 text-danger" style="font-size: 1.2rem;"></i>
					<!-- Avatar -->
					<div class="dropdown">
							<div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
								<div class="selected-card-assignee d-flex align-items-center">
									 <img src="${ task.assignee ? `https://i.pravatar.cc/32?img=${task.assignee.id}` : 'https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32'}" class="assigne-avatar" />
								</div>
							</div>

							<div class="dropdown-menu assign-dropdown">
								<div class="assign-search">
									<i class="bi bi-search"></i>
									<input type="text" class="seach-user-dropdown" placeholder="Search users">
								</div>

								<ul class="assign-list  card-user-list" ></ul>
							</div>
						</div>
				</div>
			</div>
		</div>
	`;

            $('#inProgressTasksList').append(taskHtml);
        });
        // Loop through ReviewTasks  and append HTML
        $.each(reviewTasks, function (index, task) {
            var taskHtml = `
		<div class="task-card " style="	border-left-color: #227D9B; margin-bottom:8px" data-task-id="${task.id}" data-isSubtask="${task.isSubTask}" data-parent-id="${task.parent ? task.parent.id : ''}" data-type-icon="${task.type ? task.type.icon : ''}" data-type-style="${task.type ? task.type.iconCSS.replace(/^style\s*=\s*"(.*)"$/, '$1') : ''}">
		   <div class="d-flex align-items-center">
		    <h6 class="task-title">${task.title}<span class="task-card-icons d-none"><i class="bi bi-pencil-square"></i></span></h6>
		     <span class="task-card-icons ms-auto d-none load-task-action-dropdown"><i class="bi bi-three-dots"></i></span>
		  </div>
           	${task.parent ? `<span class="task-tag" style="background-color:#227D9B;">${task.parent.title}</span>` : ''}
			<div class="d-flex align-items-center mt-2"> 
				<div class="d-flex align-items-center">
						<i class="${task.type ? task.type.icon : ''} task-icon" ${task.type ? task.type.iconCSS : ''}></i>
					<small class="task-code">${task.code}</small>
				</div>
				<div class="ms-auto d-flex align-items-center">
					<i class="bi bi-list me-2 text-danger" style="font-size: 1.2rem;"></i>
					<!-- Avatar -->
					<div class="dropdown">
							<div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
								<div class="selected-card-assignee d-flex align-items-center">
									 <img src="${ task.assignee ? `https://i.pravatar.cc/32?img=${task.assignee.id}` : 'https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32'}" class="assigne-avatar" />
								</div>
							</div>

							<div class="dropdown-menu assign-dropdown">
								<div class="assign-search">
									<i class="bi bi-search"></i>
									<input type="text" class="seach-user-dropdown" placeholder="Search users">
								</div>

								<ul class="assign-list  card-user-list" ></ul>
							</div>
						</div>
				</div>
			</div>
		</div>
	`;

            $('#reviewTasksList').append(taskHtml);
        });
        // Loop through DoneTasks  and append HTML
        $.each(doneTasks, function (index, task) {
            var taskHtml = `
		<div class="task-card " style="	border-left-color: #964AC0; margin-bottom:8px" data-task-id="${task.id}" data-isSubtask="${task.isSubTask}" data-parent-id="${task.parent ? task.parent.id : ''}" data-type-icon="${task.type ? task.type.icon : ''}" data-type-style="${task.type ? task.type.iconCSS.replace(/^style\s*=\s*"(.*)"$/, '$1') : ''}">
		 <div class="d-flex align-items-center">
		    <h6 class="task-title">${task.title} <span class="task-card-icons d-none"><i class="bi bi-pencil-square"></i></span></h6>
		     <span class="task-card-icons ms-auto d-none load-task-action-dropdown"><i class="bi bi-three-dots"></i></span>
			
		  </div>
          	${task.parent ? `<span class="task-tag" style="background-color:#964AC0;">${task.parent.title}</span>` : ''}
			<div class="d-flex align-items-center mt-2"> 
				<div class="d-flex align-items-center">
					<i class="${task.type ? task.type.icon : ''} task-icon" ${task.type ? task.type.iconCSS : ''}></i>
					<small class="task-code">${task.code}</small>
				</div>
				<div class="ms-auto d-flex align-items-center">
					<i class="bi bi-list me-2 text-danger" style="font-size: 1.2rem;"></i>
					<!-- Avatar -->
						<div class="dropdown">
							<div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
								<div class="selected-card-assignee d-flex align-items-center">
									  <img src="${ task.assignee ? `https://i.pravatar.cc/32?img=${task.assignee.id}` : 'https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32'}" class="assigne-avatar" />
								</div>
							</div>

							<div class="dropdown-menu assign-dropdown">
								<div class="assign-search">
									<i class="bi bi-search"></i>
									<input type="text" class="seach-user-dropdown" placeholder="Search users">
								</div>

								<ul class="assign-list  card-user-list" ></ul>
							</div>
						</div>
				</div>
			</div>
		</div>
	`;

            $('#doneTasksList').append(taskHtml);
        });


    }
    else {
        errorExtractor(response);
    }
};
function getProjectMembers() {
    let url = `flowtick/project/${projectId}/members`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getProjectMembersCallBack
    });
}
var getProjectMembersCallBack = function (response) {
    if (response.request.status === 200) {

        _projectMember = response.data
        //console.log(_projectMember);
        setTimeout(function () {
            loadProjectUserDropdown("card-user-list", "selected-card-assignee");
            loadProjectUserDropdown("create-task-user-list", "create-task-user", loginUserID);
        }, 300);



    }
    else {
        errorExtractor(response);
    }
};

function getTaskForLink() {
    $('#epicParentLinkIcon').removeClass('bi-lightning-charge');
    $('#epicParentLinkIcon').addClass('bi-check-square');
}
function getProjectEpics() {

    $('#epicParentLinkIcon').removeClass('bi-check-square');
    $('#epicParentLinkIcon').addClass('bi-lightning-charge');
    if (_getProjectEpics.length > 0) {

        var $projectEpics = $(".project-epics-list");  // jQuery object
        $projectEpics.empty();

        $.each(_getProjectEpics, function (index, item) {
            var li = `
            <li class="assign-item selecte-epic"  data-id="${item.id}"data-code="${item.code}">
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

        _getProjectEpics = response.data; // your array

       /* console.log(_getProjectEpics);*/

        var $projectEpics = $(".project-epics-list");  // jQuery object
        $projectEpics.empty();

        $.each(_getProjectEpics, function (index, item) {
            var li = `
            <li class="assign-item selecte-epic"  data-id="${item.id}"data-code="${item.code}">
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

// function papulate the project user dropdown
function loadProjectUserDropdown(dropdownList, targetSelectedUser, selectedUserId = null) {

    let html = "";
    let users = _projectMember;

    // If a selected user is passed, use that one
    let selectedUser = selectedUserId ? users.find(x => x.userId == selectedUserId) : null;
    let hideName = (targetSelectedUser === "create-task-user" || targetSelectedUser === "selected-card-assignee") ? "d-none" : "";


    if (selectedUser) {
        let userProfile = "";
        userProfile = `
            <img src="https://i.pravatar.cc/32?img=${selectedUser.userId}"class="assigne-avatar rounded-circle" data-user-id="${selectedUser.userId}" />
			<span class="user-name ms-2 ${hideName}">${selectedUser.user}</span>
        `;

        $("." + targetSelectedUser).html(userProfile);
    }
    else {
        // If Selected User is not pass CLEAR previous modal data & show default and for task cards show the selected in the loop which we set not set there 
        if (targetSelectedUser !== "selected-card-assignee" && targetSelectedUser !== "subtask-selected-assignee") {
            $("." + targetSelectedUser).html(`
            <img src="https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32"
                 class="assigne-avatar" />
            <span class="user-name ms-2">Unassigned</span>
        `);
        }
    }

    // Render dropdown list
    users.forEach(user => {
        html += `
            <li class="assign-item" data-name="${user.user}" data-id="${user.userId}">
                <img src="https://i.pravatar.cc/32?img=${user.userId}" class="assigne-avatar"/>
                <span class="user-name ms-2">${user.user}</span>
            </li>
        `;
    }); 

    $("." + dropdownList).html(html);
}
function loadTaskActionDropdown(icon) {

    // Remove any existing dropdown
    $(".task-dropdown").remove();
    let $icon = $(icon);

    // Get icon absolute position
    let offset = $icon.offset();
    let iconHeight = $icon.outerHeight();
    let iconWidth = $icon.outerWidth();

    // Build dropdown
    let dropdownHtml = `
        <ul class="dropdown-menu task-dropdown"
            style="
                display:block;
                position:absolute;
                top:${offset.top + iconHeight}px;
                left:${offset.left - 150 + iconWidth}px;
                min-width:200px;
            ">
			<li> <a class="dropdown-item" href="#">  Move Work Item &raquo;</a>
              <ul class="dropdown-menu dropdown-submenu">
                  <li> <a class="dropdown-item" href="#">Down</a> </li>
                  <li><a class="dropdown-item" href="#">To the bottom</a> </li>
              </ul>
           </li>
		   	<li> <a class="dropdown-item" href="#">  Change Status &raquo;</a>
              <ul class="dropdown-menu dropdown-submenu">
                  <li> <a class="dropdown-item" href="#">In Progress</a> </li>
                  <li><a class="dropdown-item" href="#"> Review</a> </li>
                  <li><a class="dropdown-item" href="#"> Done</a> </li>
              </ul>
           </li>
			<hr>
            <li><a class="dropdown-item ">Copy Link</a></li>
            <li><a class="dropdown-item ">Copy Key</a></li>
			<hr>
            <li><a class="dropdown-item ">Add Flag</a></li>
            <li><a class="dropdown-item ">Add Lable</a></li>
            <li><a class="dropdown-item ">Link Work Item</a></li>
            <li><a class="dropdown-item ">Edit Cover Image</a></li>
        </ul>
    `;

    // Append to body
    $("body").append(dropdownHtml);
    $(".task-dropdown li").css("cursor", "pointer");
}
function toggleCreateCard() {
    $("#createCardBox").show();
    $("#createBtn").hide();
}
function createTask(taskType= null) {
    //debugger;

 
        var inputJSON = {
            "title": null,
            "assigneeId": loginUserID,
            "reporterId": loginUserID,
            "reviewerId": loginUserID,
            "statusId": 1,
            "typeId": null,
            "parentId": null   // epicId is empty
        };

    
    if (taskType == 'subTask') {
        if (!customValidateForm('subTaskForm')) {
            return; // stop execution
        }
            inputJSON.title = $("#childWorkTitle").val().trim();

            inputJSON.typeId = $("#childTaskTypeID").data("id");

            inputJSON.parentId = $("#modalTaskID").val();

        }
        else {
      /*      cheack validation for task only*/
            if (!customValidateForm('creatTaskForm')) {
                return; // stop execution
            }
            inputJSON.title = $("#taskTitle").val().trim();

            inputJSON.typeId = $("#createTaskTypeID").data("id");

            inputJSON.assigneeId = $("#createTaskUserID img").data("user-id");
        }


        let url = `flowtick/project/${projectId}/tasks`;


        apiRequest({
            url: url,
            type: 'POST',
            data: inputJSON,
            callBack: createTaskCallBack
        });

  
}
var createTaskCallBack = function (response) {
    if (response.request.status === 201) {

        getProjectTasks();
        $("#createCardBox").hide();
        $("#createBtn").show();
        $("#taskTitle").val("");

        loadProjectUserDropdown("create-task-user-list", "create-task-user", loginUserID);

        successToastr("saved successfully", 'success');
    }
    else {
        errorExtractor(response);
    }
};

function getTaskDetail(taskID) {
    //debugger;
    let url = `flowtick/tasks/${taskID}`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getTaskDetailCallBack
    });
}
var getTaskDetailCallBack = function (response) {
    //debugger;
    if (response.request.status === 200) {
        //debugger;
        const getTaskData = response.data
        assigneeID = getTaskData.assignee.id;
        reviewerID = getTaskData.reviewerId;
        reporterID = getTaskData.reporterId;
        statusID = getTaskData.status.id;
        

        $("#modalTaskID").val(getTaskData.id);
   /*     $("#modalSubTaskID").val("");*/
        $("#modalTaskCode").text(getTaskData.code);
        $("#modalTaskTitle").val(getTaskData.title);
        if (getTaskData.description && getTaskData.description.trim() !== "") {
            quill.root.innerHTML = getTaskData.description;
        } else {
            quill.root.innerHTML = "Add description here.";
        }

     /*   selected epic code and id */
        $('.selected-epic-code span').text('');
        $('.selected-epic-code').attr('data-id', '');

        const getChild = getTaskData.child;

        //getAllSubTaskOfModal(getChild)

            var $subtasktbody = $('#childWorkTableTbody');
            $subtasktbody.empty(); // Clear old items

          $.each(getChild, function (index, item) {
                var tr = `
            		<tr data-id="${item.id}">
						<td>
                      	<i class="${item.type ? item.type.icon : ''} task-icon" ${item.type ? item.type.iconCSS : ''}></i>
							<span class="task-no sub-task-detail" style="cursor:pointer;">${item.code}</span>
							<span class="child-task-title">${item.title}</span>
						</td>
						<td>
							<i class="bi bi-filter " style="color:#E06C00"></i>
								Medium
						</td>
						<td>${getTaskData.title}</td>
						<td>
						<div class="dropdown">
							<div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
								<div class="subtask-selected-assignee d-flex align-items-center">
									<img src="https://i.pravatar.cc/32?img=${item.assignee ? item.assignee.id : ''}" class="assigne-avatar" data-user-id="${item.assignee ? item.assignee.id : ''}"/>
                                    <span class="user-name ms-2">${item.assignee ? item.assignee.name : ''}</span>
								</div>
							</div>

							<div class="dropdown-menu assign-dropdown">
								<div class="assign-search">
									<i class="bi bi-search"></i>
									<input type="text" class="seach-user-dropdown" placeholder="Search users">
								</div>

								<ul class="assign-list  subtask-user-list" ></ul>
							</div>
						</div>
						</td>
						<td>
                           <div class="dropdown">
						     <a class="text-decoration-none dropdown-toggle btn-task-subtask-status" data-bs-toggle="dropdown"data-id="${item.status.id}" style="color:#FFFFFF; cursor:pointer; font-size:13px;background-color:#00757D;padding:4px 12px;">
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

        //renderProjectUserDropdown("asignee-user-list");
        loadProjectUserDropdown("asignee-user-list", "selected-assignee", assigneeID);
        loadProjectUserDropdown("reporter-user-list", "selected-reporter", reporterID);
        loadProjectUserDropdown("reviewer-user-list", "selected-reviewer", reviewerID);

        setTimeout(function () {
            loadProjectUserDropdown("subtask-user-list", "subtask-selected-assignee");
        }, 300);
    
        getTaskStatus();

    }
    else {
        //debugger;
        errorExtractor(response);
    }
};

function updateTask() {
    //debugger;
    const id = $("#modalTaskID").val();
    const taskTitle = $("#modalTaskTitle").val().trim();
    const taskDescription = quill.root.innerHTML;
    const assignedId = $("#modalAssigneeID img").data("user-id");
    const reviewerId = $("#modalReviewerID img").data("user-id");
    const reporterId = $("#modalReporterID img").data("user-id");
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

        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};



$(document).on("click", ".sub-task-detail", function () {
    var taskId = $(this).closest("tr").data("id");
    $(".task-modal").fadeIn(500);
    getTaskDetail(taskId);
    getProjectEpics();
});

//Task Click update
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

        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};

function updateTaskAssignee(taskId, selectedAssigneeId) {

    let url = `flowtick/tasks/${taskId}/assignee`;
    apiRequest({
        url: url,
        type: 'PUT',
        data: {
            "assigneeId": selectedAssigneeId
        },
        callBack: updateTaskAssigneeCallBack
    });
}
var updateTaskAssigneeCallBack = function (response) {
    if (response.request.status === 204) {

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

        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};
