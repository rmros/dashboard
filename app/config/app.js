var __isDevelopment = false;

if(window.location.host.indexOf('localhost') > -1){
    __isDevelopment = true;
}

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
    'ui.grid.resizeColumns',    
    'uiSwitch',
    'ui.checkbox',
    'stripe',
    'chart.js'
	]);

var serverURL = null; 
var landingURL = null;
var sdk = document.createElement('script');

if(__isDevelopment){
    serverURL="http://localhost:3000";
    landingURL = "http://localhost:1444";
    sdk.setAttribute('src','http://localhost:4730/sdk/js/1.0.0');
}else{
    serverURL = "https://service.cloudboost.io";
    landingURL = "https://www.cloudboost.io";
    sdk.setAttribute('src','https://api.cloudboost.io/sdk/js/1.0.0');
}

document.head.appendChild(sdk);

//messenger settings.
Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'flat'
};
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







