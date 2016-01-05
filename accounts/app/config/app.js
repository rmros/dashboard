
var __isDevelopment = false;
var __isVM = false;

if(window.location.host.indexOf('localhost') > -1){
	__isDevelopment = true;
}

var app = angular.module('cloudboostAccounts',
    ['ui.router','ngCookies','mgo-angular-wizard']);

var frontendServerURL = null, dashboardURL = null;

if(__isVM){
	frontendServerURL = "http://"+window.location.hostname + ":3000";
	dashboardURL = "http://"+window.location.hostname;
}else{
	if(__isDevelopment){
		var frontendServerURL="http://localhost:3000";	
		var dashboardURL = "http://localhost:1440";
	}else{
		var frontendServerURL="https://service.cloudboost.io";	
		var dashboardURL = "https://dashboard.cloudboost.io";	
	}
}

