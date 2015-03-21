var __isDevelopment = false;

var app=angular.module('CloudBoostDashboard',
	['ngScrollable',
    'ngDragDrop',
    'frapontillo.bootstrap-switch',
    'ui.sortable',
    'angular-underscore',
    'ui.router',
    'kendo.directives',
    'ngPrettyJson',
    'ngCookies',
    'angular-intercom',
    'ngClipboard',
    'datatables',
    'datatables.scroller',
    'ngResource',
    'ui.grid',
    'ngTouch',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    'ui.grid.edit',
    'ui.grid.selection',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',    
    'uiSwitch',
    'ui.checkbox'
	]);

var serverURL = null; 
var landingURL = null;

if(__isDevelopment){
    serverURL="http://localhost:3000";
    landingURL = "http://localhost:1444";
}else{
    serverURL = "https://service.cloudboost.io";
    landingURL = "https://www.cloudboost.io";
}


//messenger settings.
Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'flat'
};
app.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);


