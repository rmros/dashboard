var app=angular.module('CloudBoostDashboard',
	['angular-underscore',
    'ui.router',
    'kendo.directives',
    'ngPrettyJson',      
    'ngClipboard',
    'ngResource',    
    'ngTouch', 
    'ui.checkbox',  
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



/*********************Notifications******************************/
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


/*********************Pricing Plans******************************/
var twoCheckoutCredentials={
  sellerId:"901307760",
  publishableKey:"5DB21AAF-317D-4FCB-A985-DD296ECDF71A"
};

var pricingPlans=[{
  id:1,
  label:"Free Plan",
  price:0,
  priceDescription:"Forever",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"50,000"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"1GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"100"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:false,
        label:""
      }
    }]
  }]
},{
  id:2,
  label:"Prototype Plan",
  price:10,
  priceDescription:"per month",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"150,000"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"1GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"100"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:false,
        label:""
      }
    }]
  }]
},{
  id:3,
  label:"Launch Plan",
  price:49,
  priceDescription:"per month",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"500,000"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"10GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"500"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:""
      }
    }]
  }]
},{
  id:4,
  label:"Bootstrap Plan",
  price:149,
  priceDescription:"per month",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"2 MILLION"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"30GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"1000"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:""
      }
    }]
  }]
},{
  id:5,
  label:"Scale Plan",
  price:449,
  priceDescription:"per month",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"5 MILLION"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"100GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"UNLIMITED"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:""
      }
    }]
  }]
},{
  id:6,
  label:"Unicorn Plan",
  price:1449,
  priceDescription:"per month",
  usage:[{
    category:"DATABASE",
    features:[{
      type:"text",
      name:"API Calls",
      limit:{
        show:true,
        label:"20 MILLION"
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"300GB"
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"UNLIMITED"
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:""
      }
    }]
  }]
}];
