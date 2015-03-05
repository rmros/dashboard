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
    'angular-intercom'
	]);

var serverURL="http://localhost:3000";
//messenger settings.
Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'flat'
};

