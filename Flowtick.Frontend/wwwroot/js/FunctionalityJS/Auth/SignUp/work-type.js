$("#btnContinue").addClass("hide");
//$(".card").on("click", function (e) {
$(document).on('click', '.card', function (e) {
    e.stopPropagation();
    $('.card').removeClass('selected');
    $(this).addClass('selected');

    // Show/hide continue button based on selected cards
    if ($(".card.selected").length > 0) {
        $("#btnContinue").addClass("show");
    } else {
        $("#btnContinue").removeClass("show");
    }
});

// Remove all selected cards when clicking outside
$(document).on("click", function (e) {
    if (!$(e.target).closest(".card").length) {
        $(".card").removeClass("selected");
        $("#btnContinue").removeClass("show");
    }
});

// Continue button click
$(document).on('click', '#btnContinue', function () {
   
    if (workTypeId == null) {
        //workTypeId = $(".card.selected").map(function () {
        //    return $(this).data("id");
        //}).get();
        workTypeId = $(".card.selected").data("id");
        if (workTypeId > 0) {
            createUserWorkType();
        }
    }

    else {
        //workTypeRoleId = $(".card.selected").map(function () {
        //    return $(this).data("id");
        //}).get();
        workTypeRoleId = $(".card.selected").data("id");
        $('#CardContainer').html('');

        createUserWorkTypeRole();
    }
});
$(document).on('click', '#btnSkip', function () {
    $('#CardContainer').html('');
    getProjectPartialView();
});

function createUserWorkType() {
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
        callBack: createUserWorkTypeCallBack
    });
}
var createUserWorkTypeCallBack = function (response) {
    if (response.request.status === 201) {
        getWorkTypeRoles();
    } else {
        errorExtractor(response);
    }
}

function createUserWorkTypeRole() {    
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
        callBack: createUserWorkTypeRoleCallBack
    });
}
var createUserWorkTypeRoleCallBack = function (response) {
    if (response.request.status === 201) {
        getProjectPartialView();
    } else {
        errorExtractor(response);
    }
}
function getWorkTypes() {    
    apiRequest({
        url: 'flowtick/work/types',
        type: 'GET',
        data: {},
        callBack: getWorkTypesCallBack
    });   
}
function getWorkTypesCallBack(response) {
    if (response.request.status === 200) {                        
        $.each(response.data, function (index, item) {            
            let card = `<div class="col-6 mt-1">
            <div class="card" data-id="${item.id}" data-value="${item.name}" >
                <div class="card-inner">
                    <div class="icon">
                        <i class="bi ${item.icon}"></i>
                    </div>
                    <div class="content">
                        <div class="label">${item.name}</div>
                        <div class="desc">${item.description}</div>
                    </div>
                    <div class="cheaked"><i class="bi bi-check-circle"></i></div>
                </div>
                <input type="hidden" class="card-id" value="${item.id}" />
            </div>
            
            </div>`;
            $('#CardContainer').append(card);
        });
    }
    else {
        errorExtractor(response);
    }
}
function getWorkTypeRoles() {
    apiRequest({
        url: `flowtick/work-type/roles/${workTypeId}`,
        type: 'GET',
        data: {},
        callBack: getWorkTypeRolesCallBack
    });
}
function getWorkTypeRolesCallBack(response) {
    if (response.request.status === 200) {
        $('#pageHeader').text(`We'd love to know your Role`);        
        $('#CardContainer').html('');
        $.each(response.data, function (index, item) {
            let card = `<div class="col-6 mt-1">
            <div class="card" data-id="${item.id}" data-value="${item.name}">
                <div class="card-inner">
                    <div class="icon">
                        <i class="bi ${item.icon}"></i>
                    </div>
                    <div class="content">
                        <div class="label">${item.name}</div>
                        <div class="desc">${item.description}</div>
                    </div>
                    <div class="cheaked"><i class="bi bi-check-circle"></i></div>
                </div>
                <input type="hidden" class="card-id" value="${item.id}" />
            </div>
            
            </div>`;
            $('#CardContainer').append(card);
        });
    }
    else {
        errorExtractor(response);
    }
}