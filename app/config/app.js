var app=angular.module('CloudBoostDashboard',
	['ngScrollable',
    'ngDragDrop',
    'frapontillo.bootstrap-switch',
    'ui.sortable',
    'angular-underscore',
    'ui.router',
    'kendo.directives',
    'ngPrettyJson',
    'smart-table',
    'ngCookies',
    'angular-intercom',
    'ngClipboard',
    'datatables',
    'datatables.bootstrap',
    'datatables.scroller',
    'ngResource',
    'ui.grid',
    'ngTouch',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    'ui.grid.edit',
    'ui.grid.selection'  
	]);

var serverURL="http://localhost:3000";
//messenger settings.
Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'flat'
};
app.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);


