
var _getAllTasks = [];
$(document).ready(function () {

    //take data from access token
    const token = localStorage.getItem("accessToken");
    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            return JSON.parse(atob(base64Payload));
        } catch (err) {
            console.error("Invalid Token", err);
            return null;
        }
    }

    const tokenData = parseJwt(token);
    /*var userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];*/
    const userName = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    //const email = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  
    //end
    $("#userName").text(userName);

    //show Day,Month, and Data in banner
    const today = new Date();
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    };
    const formattedDate = today.toLocaleDateString('en-US', options);
    $('#bannerDate').text(formattedDate);


    $(document).on("click", function () {
        $("#gridDropdown").removeClass("show");
    });

    getAllTask();




});

function getAllTask() {
 
    apiRequest({
        url: 'flowtick/tasks',
        type: 'GET',
        data: {},
        callBack: getAllTaskCallBack
    });
}
var getAllTaskCallBack = function (response) {

    if (response.request.status === 200) {
        _getAllTasks = response.data        
        populateWorkItems("workOnContainer", _getAllTasks);
        populateWorkItems("workViewedContainer", _getAllTasks);
        populateWorkItems("workRecommendedContainer", workRecommendedData);
    }
    else {
        errorExtractor(response);
    }
};

//const workOnData = [
//    {
//        title: "Create AddToCart Controller",
//        company: "Flowtick",
//        issueCode: "BHA-296",
//        project: "B.H.A - ERP",
//        date: "September 29",
//        avatars: ["https://i.pravatar.cc/32?img=5"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Website Extension",
//        company: "Flowtick",
//        issueCode: "BHA-264",
//        project: "B.H.A - ERP",
//        date: "September 10",
//        avatars: ["https://i.pravatar.cc/32?img=6"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Website Changes",
//        company: "Flowtick",
//        issueCode: "BHA-240",
//        project: "B.H.A - ERP",
//        date: "September 03",
//        avatars: ["https://i.pravatar.cc/32?img=7", "https://i.pravatar.cc/32?img=7"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Lease Agreement Review",
//        company: "Flowtick",
//        issueCode: "BHA-186",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=8", "https://i.pravatar.cc/32?img=8"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Due Invoices Review",
//        company: "Flowtick",
//        issueCode: "BHA-188",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=9", "https://i.pravatar.cc/32?img=9"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Unit Review",
//        company: "Flowtick",
//        issueCode: "BHA-183",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=10", "https://i.pravatar.cc/32?img=10"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Property Review",
//        company: "Flowtick",
//        issueCode: "BHA-182",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=11", "https://i.pravatar.cc/32?img=12", "https://i.pravatar.cc/32?img=12"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Tenant Review",
//        company: "Flowtick",
//        issueCode: "BHA-181",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=13", "https://i.pravatar.cc/32?img=13", "https://i.pravatar.cc/32?img=14"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Landlord Review",
//        company: "Flowtick",
//        issueCode: "BHA-180",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=15", "https://i.pravatar.cc/32?img=15", "https://i.pravatar.cc/32?img=16"],
//        logo: "/img/logo/logo.png"
//    }
//];
//const workViewedData = [
//    {
//        title: "Create AddToCart Controller",
//        company: "Flowtick",
//        issueCode: "BHA-296",
//        project: "B.H.A - ERP",
//        date: "September 29",
//        avatars: ["https://i.pravatar.cc/32?img=5"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Website Extension",
//        company: "Flowtick",
//        issueCode: "BHA-264",
//        project: "B.H.A - ERP",
//        date: "September 10",
//        avatars: ["https://i.pravatar.cc/32?img=6"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Website Changes",
//        company: "Flowtick",
//        issueCode: "BHA-240",
//        project: "B.H.A - ERP",
//        date: "September 03",
//        avatars: ["https://i.pravatar.cc/32?img=7", "https://i.pravatar.cc/32?img=7"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Lease Agreement Review",
//        company: "Flowtick",
//        issueCode: "BHA-186",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=8", "https://i.pravatar.cc/32?img=8"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Due Invoices Review",
//        company: "Flowtick",
//        issueCode: "BHA-188",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=9", "https://i.pravatar.cc/32?img=9"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Unit Review",
//        company: "Flowtick",
//        issueCode: "BHA-183",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=10", "https://i.pravatar.cc/32?img=10"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Property Review",
//        company: "Flowtick",
//        issueCode: "BHA-182",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=11", "https://i.pravatar.cc/32?img=12", "https://i.pravatar.cc/32?img=12"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Tenant Review",
//        company: "Flowtick",
//        issueCode: "BHA-181",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=13", "https://i.pravatar.cc/32?img=13", "https://i.pravatar.cc/32?img=14"],
//        logo: "/img/logo/logo.png"
//    },
//    {
//        title: "Landlord Review",
//        company: "Flowtick",
//        issueCode: "BHA-180",
//        project: "B.H.A - ERP",
//        date: "July 24",
//        avatars: ["https://i.pravatar.cc/32?img=15", "https://i.pravatar.cc/32?img=15", "https://i.pravatar.cc/32?img=16"],
//        logo: "/img/logo/logo.png"
//    }
//];
const workRecommendedData = [];

function populateWorkItems(containerId, items) {
    const container = $("#" + containerId);
    container.empty();

    if (items && items.length > 0) {
        items.forEach(item => {
            // Generate avatar HTML
            //let avatarHtml = "";
            //item.avatars.forEach(av => {
            //    avatarHtml += `<img src="${av}" class="avatar">`;
            //});

            // Generate work-item HTML
            const html = `
            <div class="work-item">
                <div class="work-left">
                    <i class="bi bi-check2-circle work-icon"></i>
                    <div class="work-info">
                        <div class="work-title">${item.title}</div>
                        <div class="work-meta">
                            <img src="/img/logo/logo.png" style="width:25px; height:25px; margin: 2px 0px 0px -4px;" />
                            Flowtick • <span class="issue-code">${item.code}</span> • ${item.project ? item.project.name : ''}
                        </div>
                    </div>
                </div>
                <div class="work-right">
                    <div class="work-date">01/01/2026</div>
                    <div class="avatars"><img src="https://i.pravatar.cc/32?img=${item.assignee.id}" class="avatar"></div>
                </div>
            </div>
            `;

            container.append(html);
        });

        // Add the bottom button
        container.append('<div class="show-more">Show all recent work</div>');
    } else {
        // No data available
        const noDataHtml = `
        <div class="work-item" style="background-color: #F0F1F2">
            <div class="work-left">
                <i class="bi bi-check2-circle fs-6 py-1"></i>
                <div class="work-info">
                    <div class="work-meta">
                        <p class="mb-0 fs-6 py-1">You’re all done for now. Check back soon to find out what's next.</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.append(noDataHtml);
    }
}