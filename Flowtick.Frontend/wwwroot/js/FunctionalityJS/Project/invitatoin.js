var _flowtick, _email;
$(function () {
/*	debugger;*/
	var urlParams = new URLSearchParams(window.location.search);
	_flowtick = urlParams.get('flowtick');
	_email = urlParams.get('email');
	_projectName = urlParams.get('project');
	console.log(_flowtick);
	console.log(_email);
	console.log(_projectName);
	$(".p-name").text(_projectName);
	
	cheackForEmailExsist(_email);
	$("#btnJoin").click(function () {
		joinProject();
		$("#btnJoin").addClass("readonly").prop("disabled", true).text("Joining....");
	});


});

function cheackForEmailExsist(email) {

	let url = `flowtick/user/exist?email=${encodeURIComponent(email)}`;
	apiRequest({
		url: url,
		type: 'GET',
		data: {

		},
		callBack: cheackForEmailExsistCallBack
	});

}
var cheackForEmailExsistCallBack = function (response) {
	if (response.request.status === 200) {

		if (response.data.isExist) {

			

		}
		else {

			localStorage.setItem('InvitationCode', _flowtick);
			localStorage.setItem('InvitationEmail', _email);
			localStorage.setItem('ProjectName', _projectName);

			// redirect to Signup View
			window.location.href = `/Auth/SignUp?email=${_email}`;
		}
	}
	else {
		errorExtractor(response);
	}

}

function joinProject() {

	apiRequest({
		url: 'flowtick/project/member/join',
		type: 'POST',
		data: {
			"email": _email,
			"code": _flowtick
		},
		callBack: joinProjectCallBack
	});
}
var joinProjectCallBack = function (response) {
	if (response.request.status === 201) {

		let accessToken = response.request.responseJSON.token.accessToken;
		console.log(accessToken);
		localStorage.setItem('accessToken', accessToken);

		// redirect to Dashboard View
		window.location.href = '/Dashboard/Main';
	}
	else {
		errorExtractor(response);
	}
}