javascript:(function(){
	var token = document.cookie.split(';').find(c => c.includes('expa_token'));
	var parts = token ? token.split('=') : null;
	if (parts) {
		window.location = 'https://ogx-crm.ch/login?access_token=' + JSON.parse(decodeURIComponent(parts[1])).access_token;
	} else {
		alert('Token not found.');
	}
})()
