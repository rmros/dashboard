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
    'uiSwitch',
    'truncate',
    'ngContextMenu'    
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

landingURL = "https://www.cloudboost.io";
analyticsURL = "https://analytics.cloudboost.io";

analyticsURL = "http://localhost:5555";

if(window.location.hostname==="dashboard.cloudboost.io"){
    frontendServerURL="https://service.cloudboost.io";
    SERVER_URL="https://api.cloudboost.io";
}else if(window.location.hostname==="beta-dashboard.cloudboost.io"){
    frontendServerURL="https://beta-service.cloudboost.io";
    SERVER_URL="https://beta-api.cloudboost.io";
}else{
    frontendServerURL = window.location.protocol+"//"+window.location.hostname + ":3000";
    SERVER_URL = window.location.protocol+"//"+window.location.hostname + ":4730";
}







/*********************Notificatiosn******************************/
  //Notification
  function errorNotify(errorMsg){
    $.amaran({
        'theme'     :'colorful',
        'content'   :{
           bgcolor:'#EE364E',
           color:'#fff',
           message:errorMsg
        },
        'position'  :'top right'
    });
  }

  function successNotify(successMsg){
    $.amaran({
        'theme'     :'colorful',
        'content'   :{
           bgcolor:'#19B698',
           color:'#fff',
           message:successMsg
        },
        'position'  :'top right'
    });
  }

  function WarningNotify(WarningMsg){
    $.amaran({
        'theme'     :'colorful',
        'content'   :{
           bgcolor:'#EAC004',
           color:'#fff',
           message:WarningMsg
        },
        'position'  :'top right'
    });
  }



