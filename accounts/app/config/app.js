var app = angular.module('cloudboostAccounts',
    ['ui.router','ngCookies','mgo-angular-wizard']);

/***************************************************Connecting URLs*********************************************************/
var __isDevelopment = false;
if(window.location.host.indexOf('localhost') > -1){
    __isDevelopment = true;
}

var frontendServerURL = null,           
           landingURL = null,         
         dashboardURL = null;

frontendServerURL = window.location.protocol+"//"+window.location.hostname + ":3000";

if(window.location.port){
	dashboardURL =  window.location.protocol+"//"+window.location.hostname + ":"+window.location.port; 
}else{
	dashboardURL =  window.location.protocol+"//"+window.location.hostname; 
}


landingURL = "https://www.cloudboost.io"; 
