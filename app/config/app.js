var __isDevelopment = false;

//this is an isVM switch.
var __isVM = false; 

if(window.location.host.indexOf('localhost') > -1){
    __isDevelopment = true;
}

var app=angular.module('CloudBoostDashboard',
	['angular-underscore',
    'ui.router',
    'kendo.directives',
    'ngPrettyJson',
    'ngCookies',
    'angular-intercom',
    'ngClipboard',
    'ngResource',    
    'ngTouch',     
    'uiSwitch',
    'ui.checkbox',
    'ui.checkbxcross',
    'stripe',
    'chart.js',
    'focusOn',
    'lrInfiniteScroll',
    'ui.ace',
    'angucomplete-alt'
    ]);

app.value('THROTTLE_MILLISECONDS', 1250);

var serverURL = null; 
var landingURL = null;
if(__isVM){
	serverURL = window.location.host + ":3000";
	landingURL = "https://www.cloudboost.io";
	CB.serverUrl = window.location.host + ":4730";
	CB.apiUrl = CB.serverUrl;
}else{
	if(__isDevelopment){
	    serverURL="http://localhost:3000";
	    landingURL = "http://localhost:1444";
	    CB.serverUrl ='http://localhost:4730';
	    CB.apiUrl = CB.serverUrl;
        CB.serviceUrl=serverURL;
	}else{
	    serverURL = "https://service.cloudboost.io";
	    landingURL = "https://www.cloudboost.io";
	}
}
app.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);

app.config(function() {	
	if(__isDevelopment){
        Stripe.setPublishableKey('pk_test_ZLrh0BYVlddBmEPKUGalN8uQ');
	}else{
        Stripe.setPublishableKey('pk_live_Ti8jTq0L19lku7o7LN6ZkNPB');
	}
	
});


