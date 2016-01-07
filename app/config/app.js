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

app.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);

/***************************************************Connecting URLs*********************************************************/
var __isDevelopment = false;
if(window.location.host.indexOf('localhost') > -1){
    __isDevelopment = true;
}

var frontendServerURL = null,
           SERVER_URL = null,
           landingURL = null,
         analyticsURL = null;

frontendServerURL = window.location.protocol+"//"+window.location.hostname + ":3000";
SERVER_URL = window.location.protocol+"//"+window.location.hostname + ":4730";

landingURL = "https://www.cloudboost.io";
analyticsURL =  window.location.protocol+"//"+window.location.hostname + ":5555"; 


