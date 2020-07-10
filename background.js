// Declare variables
var active;
var pattern = ["*://www.reddit.com/*", "*://np.reddit.com/*", "*://new.reddit.com/*"];
var check = ["//www.", "//np.", "//new."];
var button;

window.addEventListener("load",function(){
	// On window load check to see if 'activated' is set. If it is set save it's boolean value in 'active' otherwise set 'active' to true
	browser.storage.local.get("activated").then(function(e){
		if(e.active==undefined) {
			browser.storage.local.set({activated: true});
			active=true;
		} else {
			active = e.activated;
		}

		// If 'active' is true set to active else set to deacvtive state
		if(active) {
			activateToggle();
		} else {
			devativateToggle();
		}
	});
});

// Detect click on toolbar icon
browser.browserAction.onClicked.addListener(clicked);

// Gets a list of tabs and reloads them
function reloadTabs(tabs) {
	for (let tab of tabs) {
		browser.tabs.reload(tab.id, {bypassCache: true});
	}
}

// Displays error message if tab query fails
function onError(error) {
	console.log('Error: ${error}');
}

// Set deactive/active status of add on when toolbar icon is clicked
function clicked() {
	if(active) {
		devativateToggle();
	} else {
		activateToggle();

		// Upon activation find all tabs that match the pattern and reload the matching tabs
		var querying = browser.tabs.query({url: pattern});
		querying.then(reloadTabs, onError);
	}
}

// Converts URL to old. prefix
function redirect(requestDetails) {
	var url = requestDetails.url;
	// Loop through prefixes that need replacing
	for (var i=0; i<check.length; i++) {
		// If a prefix from 'check' array is detected then replace with the old. prefix
		if(url.indexOf(check[i]) !== -1) {
			var new_url = url.replace(check[i], '//old.');
		}
	}
	// return URL with old. prefix
	return {redirectUrl: new_url}
}

// Function is run when the add on is activated via clicking the toolbar icon
function activateToggle() {
	// Set toolbar icon to active
	browser.browserAction.setIcon({path:"assets/icons/toggle-32.png"});

	// Set 'activated' to true
	browser.storage.local.set({activated: true});

	// Set 'active' variable to true
	active = true;

	// Set up listener to redirect URL if it meets the 'pattern' array values
	browser.webRequest.onBeforeRequest.addListener(
		redirect,
		{urls:pattern},
		["blocking"]
	);
}

// Function is run when the add on is deactivated via clicking the toolbar icon
function devativateToggle() {
	// Set the toolbar icon to inactive
	browser.browserAction.setIcon({path:"assets/icons/toggle-32-off.png"});
	
	// Set 'activated' to false
	browser.storage.local.set({activated: false});

	// Set 'active' variable to false
	active = false;

	// Remove listener to redirect URL if it meets the 'pattern' array values
	browser.webRequest.onBeforeRequest.removeListener(
		redirect,
		{urls:pattern},
		["blocking"]
	);
}