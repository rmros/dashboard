var app = angular.module('cloudboostAccounts',
    ['ui.router','ngCookies']);

/***************************************************Connecting URLs*********************************************************/
var __isDevelopment = false;
if(window.location.host.indexOf('localhost') > -1){
    __isDevelopment = true;
}

var frontendServerURL = null,           
           landingURL = null,         
         dashboardURL = null;

landingURL = "https://www.cloudboost.io"; 

if(window.location.hostname==="dashboard.cloudboost.io"){
    frontendServerURL="https://service.cloudboost.io";    
}else if(window.location.hostname==="beta-dashboard.cloudboost.io"){
    frontendServerURL="https://beta-service.cloudboost.io";    
}else{
    frontendServerURL = window.location.protocol+"//"+window.location.hostname + ":3000";    
}


//DashBoard
if(window.location.port){
	dashboardURL =  window.location.protocol+"//"+window.location.hostname + ":"+window.location.port; 
}else{
	dashboardURL =  window.location.protocol+"//"+window.location.hostname; 
}



