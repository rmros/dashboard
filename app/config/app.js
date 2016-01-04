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
    'ngClipboard',
    'ngResource',    
    'ngTouch', 
    'ui.checkbox',   
    'stripe',
    'chart.js',
    'focusOn',    
    'ui.ace',    
    'angular-click-outside',
    'lrInfiniteScroll',
    'uiSwitch'
    ]);

app.value('THROTTLE_MILLISECONDS', 1250);

var frontendServerURL = null; 
var landingURL = null;
var analyticsURL = null;
var SERVER_URL=null;

if(__isVM){
	frontendServerURL = window.location.host + ":3000";
	landingURL = "https://www.cloudboost.io";
	CB.serverUrl = window.location.host + ":4730";
	CB.apiUrl = CB.serverUrl;
}else{
	if(__isDevelopment){
        SERVER_URL="http://localhost:4730";
	    frontendServerURL="http://localhost:3000";
	    landingURL = "http://localhost:1444";
        analyticsURL="http://localhost:5555";
	    CB.serverUrl ='http://localhost:4730';
	    CB.apiUrl = CB.serverUrl;
        CB.serviceUrl=frontendServerURL;
	}else{
	    frontendServerURL = "https://service.cloudboost.io";
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


