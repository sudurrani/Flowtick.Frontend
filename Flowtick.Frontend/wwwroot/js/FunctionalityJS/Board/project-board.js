var _filterTypeIdsArray = [],
    _filterTypeTextArray = [],
    _filterAssigeeIdsArray = [],
    _filterAssigneeNameArray = [],
    localStorageKeyFilterTypeIds = 'FilterTypeIds',
    localStorageKeyFilterTypeText = 'FilterTypeText',

    localStorageKeyFilterAssigneeIds = 'FilterAssigneeIds',
    localStorageKeyFilterAssigneeText = 'FilterAssigneeText';

let isTaskStatusesLoaded = false;
var _taskStatusesArray = [];
let isProjectMemberLoaded = false;
var _projectMember = []
    , _projectTasksArray = []
    ;
let isTaskTypeLoaded = false;
var _taskTypes = [];

let statusID = 0, projectId = 0,boardId = 0, projectName,projectType;
var assigneeID;
var reporterID;
var reviewerID;
var loginUserID;

$(function () {
    getSetFilters();


    /* ─────────────────────────────────────────────
       Filter Row js start
    ───────────────────────────────────────────── */
    var FILTER_PANELS = [
        '#ft-filter-assignee-panel',
        '#ft-filter-type-panel',
        '#ft-filter-priority-panel',
        '#ft-filter-sprint-panel',
        '#ft-add-panel'
    ];

    var FILTER_BTNS = [
        '#ft-filter-assignee-btn',
        '#ft-filter-type-btn',
        '#ft-filter-priority-btn',
        '#ft-filter-sprint-btn',
        '#ft-add-btn'
    ];

    /* ─────────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────────── */

    /* Close every open filter panel */
    function ftFilterCloseAll() {
        $(FILTER_PANELS.join(',')).addClass('ft-dropdown--hidden');
        $(FILTER_BTNS.join(',')).removeClass('ft-filter-btn--active').attr('aria-expanded', 'false');
        $('.ft-filter-btn__chevron').css('transform', '');
    }

    /* Open a specific panel and mark its button active */
    function ftFilterOpenPanel($panel, $btn) {
        ftFilterCloseAll();
        $panel.removeClass('ft-dropdown--hidden');
        if ($btn && $btn.length) {
            $btn.addClass('ft-filter-btn--active').attr('aria-expanded', 'true');
            $btn.find('.ft-filter-btn__chevron').css('transform', 'rotate(180deg)');
        }
    }
    /* ─────────────────────────────────────────────
       ASSIGNEE DROPDOWN
    ───────────────────────────────────────────── */
    $('#ft-filter-assignee-btn').on('click', function (e) {
        e.stopPropagation();
        var $panel = $('#ft-filter-assignee-panel');
        if ($panel.hasClass('ft-dropdown--hidden')) {
            ftFilterOpenPanel($panel, $(this));
        } else {
            ftFilterCloseAll();
        }
    });

    $('#ft-filter-assignee-panel').on('click', '.ft-dropdown-panel__item', function () {
        debugger;
        //$(this).toggleClass('ft-dropdown-panel__item--selected');
        //var isSelected = $(this).hasClass('ft-dropdown-panel__item--selected');
        //$(this).attr('aria-selected', isSelected ? 'true' : 'false');

        ///* Add or remove checkmark icon */
        //$(this).find('.ft-dropdown-panel__checkmark').remove();
        //if (isSelected) {
        //    $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');
        //}

        ftRefreshCount(
            $('#ft-filter-assignee-panel'),
            $('#ft-filter-assignee-count'),
            $('#ft-filter-assignee-btn')
        );
    });

    /* ─────────────────────────────────────────────
       TASK TYPE DROPDOWN
    ───────────────────────────────────────────── */
    $('#ft-filter-type-btn').on('click', function (e) {
        e.stopPropagation();
        var $panel = $('#ft-filter-type-panel');
        if ($panel.hasClass('ft-dropdown--hidden')) {
            ftFilterOpenPanel($panel, $(this));
        } else {
            ftFilterCloseAll();
        }
    });

    $('#ft-filter-type-panel').on('click', '.ft-dropdown-panel__item', function () {
      
        // $(this).toggleClass('ft-dropdown-panel__item--selected');
        // var isSelected = $(this).hasClass('ft-dropdown-panel__item--selected');
        // $(this).attr('aria-selected', isSelected ? 'true' : 'false');

        // $(this).find('.ft-dropdown-panel__checkmark').remove();
        // if (isSelected) {
        //   $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');
        // }

        ftRefreshCount(
            $('#ft-filter-type-panel'),
            $('#ft-filter-type-count'),
            $('#ft-filter-type-btn')
        );
    });

    /* ─────────────────────────────────────────────
       PRIORITY DROPDOWN
    ───────────────────────────────────────────── */
    $('#ft-filter-priority-btn').on('click', function (e) {
        e.stopPropagation();
        var $panel = $('#ft-filter-priority-panel');
        if ($panel.hasClass('ft-dropdown--hidden')) {
            ftFilterOpenPanel($panel, $(this));
        } else {
            ftFilterCloseAll();
        }
    });

    $('#ft-filter-priority-panel').on('click', '.ft-dropdown-panel__item', function () {
        $(this).toggleClass('ft-dropdown-panel__item--selected');
        var isSelected = $(this).hasClass('ft-dropdown-panel__item--selected');
        $(this).attr('aria-selected', isSelected ? 'true' : 'false');

        $(this).find('.ft-dropdown-panel__checkmark').remove();
        if (isSelected) {
            $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');
        }

        ftRefreshCount(
            $('#ft-filter-priority-panel'),
            $('#ft-filter-priority-count'),
            $('#ft-filter-priority-btn')
        );
    });

    /* ─────────────────────────────────────────────
       SPRINT DROPDOWN (single select)
    ───────────────────────────────────────────── */
    $('#ft-filter-sprint-btn').on('click', function (e) {
        e.stopPropagation();
        var $panel = $('#ft-filter-sprint-panel');
        if ($panel.hasClass('ft-dropdown--hidden')) {
            ftFilterOpenPanel($panel, null);
        } else {
            ftFilterCloseAll();
        }
    });

    $('#ft-filter-sprint-panel').on('click', '.ft-dropdown-panel__item', function () {
        /* Single-select: deselect all others */
        $('#ft-filter-sprint-panel .ft-dropdown-panel__item')
            .removeClass('ft-dropdown-panel__item--selected')
            .attr('aria-selected', 'false')
            .find('.ft-dropdown-panel__checkmark').remove();

        $(this).addClass('ft-dropdown-panel__item--selected').attr('aria-selected', 'true');
        $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');

        /* Update sprint label text (strip any HTML tags for text) */
        var labelText = $(this).clone().children().remove().end().text().trim();
        $('#ft-sprint-label').text(labelText);

        ftFilterCloseAll();
    });

    /* ─────────────────────────────────────────────
       TOGGLE: Only Title
    ───────────────────────────────────────────── */
    $('#ft-toggle-only-title').on('click keydown', function (e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        $(this).toggleClass('ft-filter-toggle--checked');
        var checked = $(this).hasClass('ft-filter-toggle--checked');
        $(this).attr('aria-checked', checked ? 'true' : 'false');
        $(this).find('.ft-filter-toggle__box').text(checked ? '✓' : '');
    });

    /* ─────────────────────────────────────────────
       TOGGLE: My Review
    ───────────────────────────────────────────── */
    $('#ft-toggle-my-review').on('click keydown', function (e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        $(this).toggleClass('ft-filter-toggle--checked');
        var checked = $(this).hasClass('ft-filter-toggle--checked');
        $(this).attr('aria-checked', checked ? 'true' : 'false');
        $(this).find('.ft-filter-toggle__box').text(checked ? '✓' : '');
    });

    /* ─────────────────────────────────────────────
       CLEAR ALL FILTERS
    ───────────────────────────────────────────── */
    $('#ft-filter-clear-btn').on('click', function () {
        /* Deselect all multi-select items */
        ['#ft-filter-assignee-panel', '#ft-filter-type-panel', '#ft-filter-priority-panel'].forEach(function (id) {
            $(id + ' .ft-dropdown-panel__item')
                .removeClass('ft-dropdown-panel__item--selected')
                .attr('aria-selected', 'false')
                .find('.ft-dropdown-panel__checkmark').remove();
        });

        /* Reset count badges */
        $('#ft-filter-assignee-count, #ft-filter-type-count, #ft-filter-priority-count')
            .addClass('ft-dropdown--hidden').text('');

        /* Reset filter buttons */
        $('#ft-filter-assignee-btn, #ft-filter-type-btn, #ft-filter-priority-btn')
            .removeClass('ft-filter-btn--active');

        /* Reset toggles */
        $('#ft-toggle-only-title, #ft-toggle-my-review')
            .removeClass('ft-filter-toggle--checked')
            .attr('aria-checked', 'false')
            .find('.ft-filter-toggle__box').text('');

        /* Hide clear button */
        //  $('#ft-filter-clear-btn').addClass('ft-dropdown--hidden');

        $('#cbMyReview').prop('checked', false);

        _filterTypeIdsArray = [];
        _filterTypeTextArray = [];
        _filterAssigeeIdsArray = [];
        _filterAssigneeNameArray = [];
        localStorage.removeItem(localStorageKeyFilterTypeIds);
        localStorage.removeItem(localStorageKeyFilterTypeText);
        localStorage.removeItem(localStorageKeyFilterAssigneeIds);
        localStorage.removeItem(localStorageKeyFilterAssigneeText);
        filterTasks();
        getSetFilters();

        $('.task-card-header').removeClass('d-none');
        $('.task-labels').removeClass('d-none');
        $('.task-footer').removeClass('d-none');

    });

    /* ─────────────────────────────────────────────
       ADD DROPDOWN
    ───────────────────────────────────────────── */
    $('#ft-add-btn').on('click', function (e) {
        e.stopPropagation();
        var $panel = $('#ft-add-panel');
        if ($panel.hasClass('ft-dropdown--hidden')) {
            ftFilterCloseAll();
            $panel.removeClass('ft-dropdown--hidden');
            $(this).attr('aria-expanded', 'true');
        } else {
            ftFilterCloseAll();
        }
    });

    /* ─────────────────────────────────────────────
       CLOSE ON OUTSIDE CLICK
    ───────────────────────────────────────────── */
    $(document).on('click.ft-filter', function (e) {
        if (!$(e.target).closest('.ft-filter-dropdown').length) {
            ftFilterCloseAll();
        }
    });

    /* ─────────────────────────────────────────────
       CLOSE ON ESCAPE KEY
    ───────────────────────────────────────────── */
    $(document).on('keydown.ft-filter', function (e) {
        if (e.key === 'Escape') ftFilterCloseAll();
    });

    /* ─────────────────────────────────────────────
   Filter Row js  End
───────────────────────────────────────────── */

    //$('#btnClearFilter').on('click', function () {
    //    _filterTypeIdsArray = [];
    //    _filterTypeTextArray = [];
    //    _filterAssigeeIdsArray = [];
    //    _filterAssigneeNameArray = [];
    //    localStorage.removeItem(localStorageKeyFilterTypeIds);
    //    localStorage.removeItem(localStorageKeyFilterTypeText);
    //    localStorage.removeItem(localStorageKeyFilterAssigneeIds);
    //    localStorage.removeItem(localStorageKeyFilterAssigneeText);
    //    filterTasks();
    //    getSetFilters();

    //});

    //take data from access token
    const token = localStorage.getItem("accessToken");
    const tokenData = parseJwt(token);
    var userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    loginUserID = userId;
    //end

    var urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    boardId = getAndDecryptID(urlParams.get('boardId'));
    projectName = urlParams.get('project');
    projectType = urlParams.get('type');
    projectId = (getAndDecryptID(projectId));

    if (projectType === 'Scrum') {
        $('#sprintBtn').show();
    } else {
        $('#sprintBtn').hide();
    }
    // Filter  dropdown
    $(document).on('keyup', '.seach-user-dropdown', function (e) {
        e.stopImmediatePropagation();
        let value = $(this).val().toLowerCase();

        let dropdown = $(this).closest('.flowtick-dropdown');

        dropdown.find('.dropdown-item').each(function () {
            $(this).toggle(
                $(this).find('.user-name').text().toLowerCase().includes(value)
            );
        });
    });

    if (!isTaskStatusesLoaded) {
        getTaskStatus();
    }
    if (!isProjectMemberLoaded) {
        getProjectMembers();
    }
    if (!isTaskTypeLoaded) {
        getTaskTypes();
    }


    initTooltips();

    // Enable Bootstrap tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Search Functionality
    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();

        $('.task-card').each(function () {
            const title = $(this).find('.task-title').text().toLowerCase();
            const id = $(this).find('.task-id').text().toLowerCase();

            if (title.includes(searchTerm) || id.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // Update column counts
        $('.board-column').each(function () {
            const visibleCount = $(this).find('.task-card:visible').length;
            $(this).find('.column-count').text(visibleCount);
        });
    });

    $('#ft-toggle-only-title').on('click', function (e) {        
        //const checkbox = $("#cbFilterOnlyTitle");
        //checkbox.prop("checked", !checkbox.prop("checked"));

        $('.task-card-header').toggleClass('d-none');
        $('.task-labels').toggleClass('d-none');
        $('.task-footer').toggleClass('d-none');
    });
    $('#ft-toggle-my-review').on('click', function (e) {

        const checkbox = $("#cbMyReview");
        checkbox.prop("checked", !checkbox.prop("checked"));

        filterTasks();
    });

    $('#SideBarParent').on('click', function () {
        $(".task-modal").addClass("task-modal-fade-effect");
        $(".task-modal").removeClass("show");
        getTaskDetail($(this).data("id"));
        setTimeout(function () {
            $(".task-modal").addClass("show");
        }, 300);

    });
});
function getSetFilters() {
    let filteredTypeIds = localStorage.getItem('FilterTypeIds');
    _filterTypeIdsArray = filteredTypeIds == null ? [] : JSON.parse(filteredTypeIds);

    let filteredTypeText = localStorage.getItem('FilterTypeText');

    filteredTypeText = filteredTypeText == null ? '' : filteredTypeText;
    _filterTypeTextArray = filteredTypeText == '' ? [] : JSON.parse(filteredTypeText);
    $('#filterButtonText').text((filteredTypeText == '' ? 'Filter by Type' : _filterTypeTextArray.join(', ')));

    let filteredAssigneeIds = localStorage.getItem('FilterAssigneeIds');
    _filterAssigeeIdsArray = filteredAssigneeIds == null ? [] : JSON.parse(filteredAssigneeIds);

    let filteredAssigneeText = localStorage.getItem('FilterAssigneeText');

    filteredAssigneeText = filteredAssigneeText == null ? '' : filteredAssigneeText;
    _filterAssigneeNameArray = filteredAssigneeText == '' ? [] : JSON.parse(filteredAssigneeText);
    $('#filterAssigneeButtonText').text(filteredAssigneeText == '' ? 'Filter by Assignee' : _filterAssigneeNameArray.join(', '));
}
function loadFilterTaskTypeDropdown() {


    var $filterTaskTypeMenu = $('#ft-filter-type-panel');

    $filterTaskTypeMenu.empty();
    $filterTaskTypeMenu.append(`<div class="ft-dropdown-panel__label">Task type</div> `);
    $.each(_taskTypes, function (index, item) {
        var li = `
                    <div class="ft-dropdown-panel__item" data-id="${item.id}"  id="ft-type-task"  role="option" aria-selected="false"onclick="filterTaskTypeSelection(event,${item.id},'${item.description}');">
                        <input type="checkbox" class="fs-5 me-1 task-type-checkbox" hidden/>
                           <i class="${item.icon} "${item.iconCSS}></i>   ${item.description}
                      </div>
				`;

        $filterTaskTypeMenu.append(li);
    });
}
function loadFilterTaskAssigneeDropdown() {

    var $filterTaskAssigneeMenu = $('#ft-filter-assignee-panel');
    $filterTaskAssigneeMenu.empty();
    $filterTaskAssigneeMenu.append(`<div class="ft-dropdown-panel__label">Team members  </div> `);
    let loggedInUser = getLoggedInUser();
    
    let loggedInUserDetail = _projectMember.find(row => row.userId == loggedInUser.id);
    /*
    console.log(loggedInUserDetail);
    $filterTaskAssigneeMenu.append
        (
            `<li>
                               <a class="dropdown-item" href="#" data-id="${loggedInUserDetail.userId}" onclick="filterTaskAssigneeSelection(event,${loggedInUserDetail.userId},'My Review');">
                                    <input type="checkbox" class="fs-5 task-assignee-checkbox" />
									 
									 <span class="user-name me-2"><strong style="color:${loggedInUserDetail.colorCode}">My Review</strong></span>
                               </a>
							</li>`
        );
        */
    $.each(_projectMember, function (index, user) {
        li = `
                            <div class="ft-dropdown-panel__item" id="ft-assignee-au" data-id="${user.userId}" data-assignee="AU" role="option" aria-selected="false" onclick="filterTaskAssigneeSelection(event,${user.userId},'${user.user}');">
                             <input type="checkbox" class="fs-5 task-assignee-checkbox" hidden/>

                            <span class="ft-member-avatar" style="background:${user.colorCode}">${getInitials(user.user)}</span>
                                ${user.user}
                            </div>
						  `;

        $filterTaskAssigneeMenu.append(li);

    });
}
function filterTaskTypeSelection(event, id = 0, text = null) {
    //event.preventDefault();
    //event.stopPropagation();
    //| Uncheck My Review Checkbox
    const cbMyReview = $("#cbMyReview");
    if (cbMyReview.prop("checked")) {
        cbMyReview.prop("checked", !cbMyReview.prop("checked"));
    }
    
    //| Uncheck My Review Checkbox
    var checkbox = event.currentTarget.querySelector('input[type="checkbox"]');

    if (id == 0) {
        _filterTypeIdsArray = [0];
    }

    if (event.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;

        if (_filterTypeIdsArray.includes(id)) {
            _filterTypeIdsArray = _filterTypeIdsArray.filter(v => v !== id);

        } else {
            _filterTypeIdsArray.push(id);
        }
        if (_filterTypeTextArray.includes(text)) {
            _filterTypeTextArray = _filterTypeTextArray.filter(v => v != text);
        }
        else {
            _filterTypeTextArray.push(text);
        }
        $('#filterButtonText').text(_filterTypeTextArray.length == 0 ? 'Filter by Type' : _filterTypeTextArray.join(', '));
    }
    filterTasks();

    //const searchTerm = $(this).val().toLowerCase();

    if (_filterTypeIdsArray.length > 0) {
        localStorage.setItem('FilterTypeIds', JSON.stringify(_filterTypeIdsArray));
        localStorage.setItem('FilterTypeText', JSON.stringify(_filterTypeTextArray));
    }
    else {
        localStorage.removeItem('FilterTypeIds');
        localStorage.removeItem('FilterTypeText');
    }



}
function filterTaskAssigneeSelection(event, id = 0, text = null) {
  // debugger;
    //event.preventDefault();
   // event.stopPropagation();
    //| Uncheck My Review Checkbox
    const cbMyReview = $("#cbMyReview");
    if (cbMyReview.prop("checked")) {
        cbMyReview.prop("checked", !cbMyReview.prop("checked"));
    }
    //| Uncheck My Review Checkbox

    var checkbox = event.currentTarget.querySelector('input[type="checkbox"]');

    if (event.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;

        if (_filterAssigeeIdsArray.includes(id)) {
            _filterAssigeeIdsArray = _filterAssigeeIdsArray.filter(v => v !== id);

        } else {
            _filterAssigeeIdsArray.push(id);
        }
        if (_filterAssigneeNameArray.includes(text)) {
            _filterAssigneeNameArray = _filterAssigneeNameArray.filter(v => v != text);
        }
        else {
            _filterAssigneeNameArray.push(text);
        }
        $('#filterAssigneeButtonText').text(_filterAssigneeNameArray.length == 0 ? 'Filter by Assignee' : _filterAssigneeNameArray.join(', '));
    }
    filterTasks();

    //const searchTerm = $(this).val().toLowerCase();

    if (_filterAssigeeIdsArray.length > 0) {
        localStorage.setItem('FilterAssigneeIds', JSON.stringify(_filterAssigeeIdsArray));
        localStorage.setItem('FilterAssigneeText', JSON.stringify(_filterAssigneeNameArray));
    }
    else {
        localStorage.removeItem('FilterAssigneeIds');
        localStorage.removeItem('FilterAssigneeText');
    }

}
function filterTasks() {
    //debugger;
    $('.task-card').each(function () {
        let reviewerId = $(this).find('.reviewer-id').text();
        const cbMyReview = $("#cbMyReview");
        let isMyReviewChecked = cbMyReview.prop("checked");
        
        const assigneeId = $(this)
            .find('.assignee-avatar-sm')
            .data('assignee-id');


        const typeId = $(this)
            .find('.task-meta')
            .data('type-id');

        if (_filterTypeIdsArray.length <= 0 && _filterAssigeeIdsArray.length <= 0) {
            //$(this).show();
            $(this).fadeIn(500);
        }
        else if (_filterAssigeeIdsArray.length > 0 && _filterTypeIdsArray.length > 0) {

            if (_filterAssigeeIdsArray.includes(assigneeId) && _filterTypeIdsArray.includes(typeId)) {
                //$(this).show();
                $(this).fadeIn(500);
            } else {
                //$(this).hide();
                $(this).fadeOut(500);
            }
        }
        else if (_filterAssigeeIdsArray.length > 0 && _filterTypeIdsArray.length <= 0) {

            if (_filterAssigeeIdsArray.includes(assigneeId)) {
                //$(this).show();
                $(this).fadeIn(500);
            } else {
                //$(this).hide();
                $(this).fadeOut(500);

            }
        }
        else if (_filterAssigeeIdsArray.length <= 0 && _filterTypeIdsArray.length > 0) {

            if (_filterTypeIdsArray.includes(typeId)) {
                $(this).show();
            } else {
                $(this).hide();

            }
        }
        if (isMyReviewChecked) {
            if (loginUserID == reviewerId) {
                console.log('found');
                $(this).show();
            }
            else {
                $(this).hide();
                console.log('not found');
            }
        }
    });

    $('#ft-filter-assignee-panel div.ft-dropdown-panel__item').each(function () {
        let assigneeId = $(this).data('id');
        var $checkbox = $(this).find('.task-assignee-checkbox');

        if (_filterAssigeeIdsArray.includes(assigneeId)) {
            $checkbox.prop('checked', true);
            $(this).addClass('ft-dropdown-panel__item--selected');
            $(this).attr('aria-selected', 'true');
            $(this).find('.ft-dropdown-panel__checkmark').remove();
            $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');
           
        } else {
            $checkbox.prop('checked', false);
            $(this).removeClass('ft-dropdown-panel__item--selected');
            $(this).attr('aria-selected', 'false');
            $(this).find('.ft-dropdown-panel__checkmark').remove();

        }
        ftRefreshCount(
            $('#ft-filter-assignee-panel'),
            $('#ft-filter-assignee-count'),
            $('#ft-filter-assignee-btn')
        );

    })
    $('#ft-filter-type-panel div.ft-dropdown-panel__item').each(function () {
        debugger;
        let typeId = $(this).data('id');
        var $checkbox = $(this).find('.task-type-checkbox');
        if (_filterTypeIdsArray.includes(typeId)) {
            $checkbox.prop('checked', true);
            $(this).addClass('ft-dropdown-panel__item--selected');
            $(this).attr('aria-selected', 'true');
            $(this).find('.ft-dropdown-panel__checkmark').remove();
            $(this).append('<i class="bi bi-check ft-dropdown-panel__checkmark"></i>');

        } else {
            $checkbox.prop('checked', false);
            $(this).removeClass('ft-dropdown-panel__item--selected');
            $(this).attr('aria-selected', 'false');
            $(this).find('.ft-dropdown-panel__checkmark').remove();
          
        }
        ftRefreshCount(
            $('#ft-filter-type-panel'),
            $('#ft-filter-type-count'),
            $('#ft-filter-type-btn')
        );

    })
    // Update column counts
    $('.board-column').each(function () {
        const visibleCount = $(this).find('.task-card:visible').length;
        $(this).find('.column-count').text(visibleCount);
    });
    if (_filterAssigeeIdsArray.length > 0 || _filterTypeIdsArray.length > 0) {
        $('#btnClearFilter').removeClass('d-none');
    } else {
        $('#btnClearFilter').addClass('d-none');
    }

}


// Handle for assigne user in create task selection
$(document).on("click", ".create-task-user-list .dropdown-item", function () {

    let userId = $(this).data("id");
    let username = $(this).data("name");
    let backgrounColor = $(this).find(".profile-image").attr("style");
    let avatar = `<div class="assignee-avatar-sm profile-image" data-user-id="${userId}" style="${backgrounColor}">${getInitials(username)}</div>`;

    $(this).closest(".dropdown").find('.create-task-user').html(avatar);
});

// Handle for assignee in  task card
$(document).on("click", ".card-user-list .dropdown-item", function (e) {
    e.preventDefault();
    e.stopPropagation();

    let userId = $(this).data("id");
    let username = $(this).data("name");
    let backgrounColor = $(this).find(".profile-image").attr("style");

    let avatar = `<div class="assignee-avatar-sm" data-id="${userId}" style="${backgrounColor}">${getInitials(username)}</div>`;

    $(this).closest(".dropdown").find(".selected-card-assignee").html(avatar);

    const selectedTasId = $(this).closest(".task-card").data("task-id");
    updateTaskAssignee(selectedTasId, userId);

});

$(document).click(function (e) {
    if (!$(e.target).closest("#createCardBox, #createBtn").length) {
        $("#createCardBox").hide();
        $("#createBtn").show();
    }
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



function getSubTaskById(subTaskId = null) {
    let url = `flowtick/tasks/${subTaskId}`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: function (response) {
            if (response.request.status === 200) {
                openTaskModal(response.data)
            }
            else {
                errorExtractor(response);
            }
        }
    });
}


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


        _taskTypes = response.data; // your array
        loadTaskTypeDropdown();
        loadFilterTaskTypeDropdown();
    }
    else {
        errorExtractor(response);
    }
};
function loadTaskTypeDropdown() {

    // default selected type in create task  id = 3
    var defaultItem = _taskTypes.find(x => x.id == 3);
    if (defaultItem) {
        $(".task-type-btn").attr("data-id", defaultItem.id);
        $(".task-type-btn i").attr("class", defaultItem.icon).attr("style", defaultItem.iconCSS.replace('style="', '').replace('"', ''));

        $(".task-type-btn span").text(defaultItem.description);
    }

    // default selected type in create Subtask  id = 4
    var defaultItemForSubTask = _taskTypes.find(x => x.id == 4);
    if (defaultItemForSubTask) {
        $(".default-selected-value").attr("data-id", defaultItemForSubTask.id);
        $(".default-selected-value i").attr("class", defaultItemForSubTask.icon).attr("style", defaultItemForSubTask.iconCSS.replace('style="', '').replace('"', ''));

        $(".default-selected-value span").text(defaultItemForSubTask.description);
        $(".default-selected-value").attr("readonly");
    }

    var $taskTypeMenu = $('.task-type-menu');

    $taskTypeMenu.empty(); // Clear old items

    $.each(_taskTypes, function (index, item) {
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
        isTaskStatusesLoaded = true;
        _taskStatusesArray = response.data;
        loadStatusDropdown();
        getProjectTasks();


    }
    else {
        _taskStatusesArray = [];
        errorExtractor(response);
    }
};
function loadStatusDropdown() {
    var selectedItem = _taskStatusesArray.find(x => x.id == statusID);
    if (selectedItem) {
        $(".btn-task-status").attr("data-id", selectedItem.id);

        $(".btn-task-status span").text(selectedItem.description);
    }

    var $taskStatusList = $('.task-status-list');

    $taskStatusList.empty(); // Clear old items

    $.each(_taskStatusesArray, function (index, item) {
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

        setTimeout(function () {
            loadProjectUserDropdown("card-user-list", "selected-card-assignee");
            loadProjectUserDropdown("create-task-user-list", "create-task-user", loginUserID);
        }, 500);

        loadFilterTaskAssigneeDropdown();
    }
    else {
        _projectMember = [];
        errorExtractor(response);
    }
};

// Render Board
function renderBoard() {
    const container = $('#boardColumns');
    container.empty();
    _taskStatusesArray.forEach(column => {
        const tasks = [];//boardData.tasks.filter(task => task.status === column.id);

        const columnHtml = `
                                                     <div class="board-column">
                                                         <div class="column-header">
                                                             <div class="column-title-wrapper">
                                                                     <h2 class="column-title">${column.description}</h2>
                                                                 <span class="column-count">${tasks.length}</span>
                                                             </div>
                                                             <button class="icon-btn">
                                                                 <i class="bi bi-plus-lg"></i>
                                                             </button>
                                                         </div>
                                                         <div class="column-content ${column.cssClass}" data-status="${column.id}">
                                                             ${tasks.map(task => renderTaskCard(task)).join('')}
                                                         </div>
                                                     </div>
                                                 `;

        container.append(columnHtml);
    });
}

function getProjectTasks(isBlockUI = true) {
    let url = `flowtick/project/${projectId}/tasks/${projectType}`;
    apiRequest({
        url: url,
        type: 'GET',
        data: {},
        callBack: getProjectTasksCallBack
    },null,isBlockUI);
}
var getProjectTasksCallBack = function (response) {
    if (response.request.status === 200) {
        _projectTasksArray = response.data;
        const container = $('#boardColumns');
        container.empty();
        var columnHtml = ''
        _taskStatusesArray.forEach(column => {
            const tasks = (response.data || []).filter(item => item.status?.id === column.id);;//boardData.tasks.filter(task => task.status === column.id);

            const isTodoColumn = column.id === 1;

            columnHtml += `
                                                         <div class="board-column">
                                                             <div class="column-header">
                                                                 <div class="column-title-wrapper">
                                                                         <h2 class="column-title">${column.description}</h2>
                                                                     <span class="column-count">${tasks.length}</span>
                                                                 </div>
                                                                 <button class="icon-btn">
                                                                     <i class="bi bi-plus-lg"></i>
                                                                 </button>
                                                             </div>
                                                             <div class="column-content ${column.cssClass}" data-status="${column.id}">
                                                                 ${tasks.map(task => renderTaskCard(task)).join('')}

                                                                     ${isTodoColumn ? `
                                                                     <div class="create-task-wrapper">
                                                                         <button id="createBtn" class="create-btn" onclick="toggleCreateCard()">
                                                                             <span>+</span> Create
                                                                         </button>
                                                                         <div id="createCardBox" style="display:none;">
                                                                             <div class="flowtick-create-card" id="flowtickCard">
                                                                                 <form id="creatTaskForm">
                                                                                     <textarea class="flowtick-textarea" id="taskTitle" placeholder="Write something..." required tabindex="0"></textarea>
                                                                                 </form>
                                                                                 <div class="flowtick-footer">
                                                                                     <div class="left-icons">
                                                                                         <!-- Epic/Task/Bug dropdown -->
                                                                                         <div class="dropdown">
                                                                                             <a class="text-decoration-none icon-btn dropdown-toggle task-type-btn" data-bs-toggle="dropdown" id="createTaskTypeID" tabindex="0">
                                                                                                 <i></i><span class="d-none"></span>
                                                                                             </a>
                                                                                             <div class="dropdown-menu task-type-menu">
                                                                                                 <!-- Dynamic items will load here -->
                                                                                             </div>
                                                                                         </div>
                                                                                         <div class="dropdown">
                                                                                             <a class="icon-btn dropdown-toggle no-caret create-task-user" data-bs-toggle="dropdown" id="createTaskUserID" tabindex="0"></a>
                                                                                             <div class="dropdown-menu flowtick-dropdown">
                                                                                                 <div class="flowtick-dropdown-search">
                                                                                                     <i class="bi bi-search"></i>
                                                                                                     <input type="text" class="seach-user-dropdown" placeholder="Search users">
                                                                                                 </div>

                                                                                                 <ul class="dropdown-list create-task-user-list"></ul>
                                                                                             </div>
                                                                                         </div>
                                                                                     </div>
                                                                                     <div class="right-icon">
                                                                                         <button class="icon-btn "  onclick="createTask()"  ><i class="bi bi-box-arrow-right"></i></button>
                                                                                     </div>
                                                                                 </div>
                                                                             </div>
                                                                         </div>
                                                                     </div>
                                                                 ` : ''}

                                                             </div>
                                                         </div>
                                                     `;

            


        });
        container.html(columnHtml);
        filterTasks();
        loadTaskTypeDropdown();

        setTimeout(function () {
            loadProjectUserDropdown("card-user-list", "selected-card-assignee");
            loadProjectUserDropdown("create-task-user-list", "create-task-user", loginUserID);
        }, 300);

    }
    else {
        errorExtractor(response);
    }
};
// Render Task Card
function renderTaskCard(task) {    
    var doneCount = $.grep(task.child || [], function (item) {
        return item.status && item.status.name === "Done";
    }).length;    

    const labels = task.labels && task.labels.length > 0
        ? `<div class="task-labels">${task.labels.map(label =>
            `<span class="task-label" role="button" onclick="filterTaskById(event,'${encryptNumber(task.id)}','${encryptNumber(task.parent.id)}')">${label}</span>`
        ).join('')}</div>`
        : '';
    const parentTask = task.parent != null
        ? `<div class="task-labels">
                                     <span class="task-label" role="button" onclick="filterTaskById(event,'${encryptNumber(task.id)}','${encryptNumber(task.parent.id)}')"> ${task.parent.title} </span>
                  </div>`
        : '';

    const subtasks = task.child
        ? `<div class="subtask-info">
                                                          <i class="bi bi-check-circle"></i>
                                                              <span>${doneCount}/${task.child.length}</span>
                                                        </div>`
        : '';

    if (task.parent != null) {

    }
    return `<div class="task-card cursor-pointer" onclick="filterTaskById(event,'${encryptNumber(task.id)}','${0}')" data-task-id="${task.id}">
                                  <div class="task-card-header">
                                      <div class="task-meta" data-type-id="${task.type.id}">
                                          <i class="${task.type.icon}" ${task.type.iconCSS}></i>
                                              <span class="task-id">${task.code}</span>
                                      </div>
                                      <button class="task-menu-btn">
                                          <i class="bi bi-three-dots"></i>
                                      </button>
                                  </div>
                                  <h3 class="task-title">${task.title}</h3>
                                      ${parentTask}
                                  ${labels}
                                  <div class="task-footer">
                                      <div class="task-indicators">
                                          <i class="bi bi-flag priority-icon ${task.priority}"></i>
                                          ${subtasks}
                                      </div>
                                       <div class="reviewer-id" hidden>${task.reviewer.id}</div>
                                       <div class="dropdown">
                                          <div class="dropdown-toggle no-caret" data-bs-toggle="dropdown">
                                               <div class="selected-card-assignee d-flex align-items-center"onclick="event.stopPropagation();">
                                                   <div class="assignee-avatar-sm" data-assignee-id="${task.assignee.id}" style="background:${task.assignee.colorCode}">${getInitials(task.assignee.name)} </div>
                                              </div>
                                          </div>

                                          <div class="dropdown-menu flowtick-dropdown">
                                             <div class="flowtick-dropdown-search">
                                                <i class="bi bi-search"></i>
                                               <input type="text" class="seach-user-dropdown" placeholder="Search users">
                                             </div>

                                             <ul class="dropdown-list   card-user-list" ></ul>
                                           </div>
                                       </div>
                                  </div>
                          </div>`;


}

function filterTaskById(event, id = null, parentId = null) {

    if (event.target.closest(".task-label")) {
        id = decryptToNumber(parentId);
    }
    else {
        id = decryptToNumber(id);
    }

    const task = (_projectTasksArray || []).find(row => row.id == id);
    openTaskModal(task);
}

function openTaskModal(task = null) {

    if (task.type.description == 'Sub-task') {
        $('#childWorkPanel').hide();
    }
    else {
        $('#childWorkPanel').show();
    }
    //  Get task data
    const typeIcon = task ? task.type.icon : '';// $(this).data("type-icon");
    const typeStyle = task ? task.type.iconCSS : ''; // $(this).data("type-style");

    if (typeIcon) {
        //if icon exsist show this
        $("#modalTaskTypeIcon i").attr("class", (task ? task.type.icon : '')).attr("style", (task ? task.type.iconCSS.replace(/^style="|"$|'/g, '') : ''));
    }
    else {
        //if not  exsist show this dummy icon
        $("#modalTaskTypeIcon i").attr("class", "bi bi-circle").attr("style", "");
    }
    /* Commented this as handling now in Task GetById
    if (task.type.description == 'Task' || task.type.description == 'Story') {// typeIcon === 'bi bi-check-square' || typeIcon === 'bi bi-check2-square') {
        $('#epicDropdown').show();
        $(".link-icon").css("display", "block");
    } else {
        $('#epicDropdown').hide();
        $(".link-icon").css("display", "none");
    }
    */
    $(".project-epics-list").empty();

    $(".task-modal").fadeIn(500);

    getTaskDetail(task ? task.id : 0);
    /* Commented as betting Linking detail in task getbyId
    getProjectEpics();
    */
    getTaskWatchers(task ? task.id : 0);
}

function loadProjectUserDropdown(dropdownList, targetSelectedUser, selectedUserId = null) {
    let html = "";
    let users = _projectMember;

    // If a selected user is passed, use that one
    let selectedUser = selectedUserId ? users.find(x => x.userId == selectedUserId) : null;
    let hideName = (targetSelectedUser === "create-task-user" || targetSelectedUser === "selected-card-assignee") ? "d-none" : "";


    if (selectedUser) {
        let userProfile = "";
        userProfile = `

                                          <div class="assignee-avatar-sm profile-image" data-user-id="${selectedUser.userId}" style="background:${selectedUser.colorCode}" >${getInitials(selectedUser.user)} </div>
                                         <span class="user-name ms-2  ${hideName}">${selectedUser.user}</span>
                                     `;

        $("." + targetSelectedUser).html(userProfile);
    }
    else {
        // If Selected User is not pass CLEAR previous modal data & show default and for task cards show the selected in the loop which we set not set there
        if (targetSelectedUser !== "selected-card-assignee" && targetSelectedUser !== "subtask-selected-assignee") {
            $("." + targetSelectedUser).html(`
                                         <img src="https://ui-avatars.com/api/?name=U&background=cccccc&color=ffffff&size=32"
                                              class="dropdown-avatar" />
                                         <span class="user-name ms-2">Unassigned</span>
                                     `);
        }
    }

    // Render dropdown list
    users.forEach(user => {
        html += `
                                         <li class="dropdown-item" data-name="${user.user}" data-id="${user.userId}">
                                             <div class="assignee-avatar-sm profile-image" style="background:${user.colorCode}">${getInitials(user.user)} </div>
                                             <span class="user-name ms-2">${user.user}</span>
                                         </li>
                                     `;
    });

    $("." + dropdownList).html(html);
}

function createTask(taskType = null) {
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

        inputJSON.assigneeId = $("#createTaskUserID .profile-image").data("user-id");
    }


    let url = `flowtick/project/${projectId}/tasks`;


    apiRequest({
        url: url,
        type: 'POST',
        data: inputJSON,
        callBack: createTaskCallBack,
        //| Below are used to pass to the callback for condition purposes
        taskType: taskType,
        parentId: inputJSON.parentId
    });


}
var createTaskCallBack = function (response, options) {
    if (response.request.status === 201) {
        successToastr($("#taskTitle").val(), 'Task');
        getProjectTasks();
        if (options.taskType == 'subTask') {
            loadChildTasks(options.parentId);
        }

        $("#createCardBox").hide();
        $("#createBtn").show();
        $("#taskTitle").val("");
    }
    else {
        errorExtractor(response);
    }
};


function toggleCreateCard() {
    $("#createCardBox").show();
    $("#createBtn").hide();
    $("#taskTitle").focus();
}

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
        successToastr("Assigned successfully", 'Assignee');
        getProjectTasks();
    }
    else {
        errorExtractor(response);
    }
};
/* Refresh the count badge on a filter button */
function ftRefreshCount($panel, $countBadge, $btn) {
    var selected = $panel.find('.ft-dropdown-panel__item--selected').length;
    if (selected > 0) {
        $countBadge.text(selected).removeClass('ft-dropdown--hidden');
        $btn.addClass('ft-filter-btn--active');
    } else {
        $countBadge.addClass('ft-dropdown--hidden').text('');
        $btn.removeClass('ft-filter-btn--active');
    }
    ftUpdateClearBtn();
}

/* Show / hide the "Clear" button based on active filters */
function ftUpdateClearBtn() {
    var hasFilters =
        $('#ft-filter-assignee-panel .ft-dropdown-panel__item--selected').length > 0 ||
        $('#ft-filter-type-panel .ft-dropdown-panel__item--selected').length > 0 ||
        $('#ft-filter-priority-panel .ft-dropdown-panel__item--selected').length > 0;

    // if (hasFilters) {
    //   $('#ft-filter-clear-btn').removeClass('ft-dropdown--hidden');
    // } else {
    //   $('#ft-filter-clear-btn').addClass('ft-dropdown--hidden');
    // }
}