var _filterTypeIdsArray = [],
    _filterTypeTextArray = [],
    _filterAssigeeIdsArray = [],
    _filterAssigneeNameArray = [],
    localStorageKeyFilterTypeIds = 'FilterTypeIds',
    localStorageKeyFilterTypeText = 'FilterTypeText',

    localStorageKeyFilterAssigneeIds = 'FilterAssigneeIds',
    localStorageKeyFilterAssigneeText = 'FilterAssigneeText';

$(function () {
    getSetFilters();
    $('#btnClearFilter').on('click', function () {
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


    var $filterTaskTypeMenu = $('.filter-task-type-menu');

    $filterTaskTypeMenu.empty();
    $.each(_taskTypes, function (index, item) {
        var li = `
							  <li>
								  <a class="dropdown-item" href="#" data-id="${item.id}" onclick="filterTaskTypeSelection(event,${item.id},'${item.description}');">
                                    <input type="checkbox" class="fs-5 me-1 task-type-checkbox" />
									  <i class="${item.icon} " ${item.iconCSS}></i>
									  ${item.description}
								  </a>
							  </li>
						  `;

        $filterTaskTypeMenu.append(li);
    });
}
function loadFilterTaskAssigneeDropdown() {

    var $filterTaskAssigneeMenu = $('.filter-task-assignee-menu');

    $filterTaskAssigneeMenu.empty();
    $.each(_projectMember, function (index, user) {
        var li = `
							 
                           <li>
                               <a class="dropdown-item" href="#" data-id="${user.userId}" onclick="filterTaskAssigneeSelection(event,${user.userId},'${user.user}');">
                                    <input type="checkbox" class="fs-5 task-assignee-checkbox" />
									 <div class="assignee-avatar-sm profile-image">${getInitials(user.user)}</div>
									 <span class="user-name me-2">${user.user}</span>
                               </a>
							</li>
						  `;

        $filterTaskAssigneeMenu.append(li);

    });
}
function filterTaskTypeSelection(event, id = 0, text = null) {
    event.preventDefault();
    event.stopPropagation();

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
    //event.preventDefault();
    event.stopPropagation();

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
    $('.task-card').each(function () {

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
    });

    $('.filter-task-assignee-menu li').each(function () {
        let assigneeId = $(this).find('a').data('id');
        var $checkbox = $(this).find('a').find('.task-assignee-checkbox');
        if (_filterAssigeeIdsArray.includes(assigneeId)) {
            $checkbox.prop('checked', true);
        } else {
            $checkbox.prop('checked', false);
        }
    })
    $('.filter-task-type-menu li').each(function () {
        let typeId = $(this).find('a').data('id');
        var $checkbox = $(this).find('a').find('.task-type-checkbox');
        if (_filterTypeIdsArray.includes(typeId)) {
            $checkbox.prop('checked', true);
        } else {
            $checkbox.prop('checked', false);
        }
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