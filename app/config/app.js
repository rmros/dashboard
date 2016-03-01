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
    'ngContextMenu', 
    'ngSanitize', 
    'nvd3'  
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


/*********************Pricing Plans******************************/
//Production
var twoCheckoutCredentials={
  sellerId:"202796222",
  publishableKey:"EB50E085-0670-49C7-82EE-2C5977488771",
  mode:"production"
};

//SandBox(development)
if(window.location.hostname=="localhost"){
  twoCheckoutCredentials.sellerId="901307760";
  twoCheckoutCredentials.publishableKey="5DB21AAF-317D-4FCB-A985-DD296ECDF71A";
  twoCheckoutCredentials.mode="sandbox";
}

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
        label:"10,000",
        value:10000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"200MB",
        value:0.2
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"100",
        value:100
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:false,
        label:"",
        value:0
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
        label:"50,000",
        value:50000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"1GB",
        value:1
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"100",
        value:100
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:false,
        label:"",
        value:0
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
        label:"150,000",
        value:150000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"5GB",
        value:5
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"500",
        value:500
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:"",
        value:1
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
        label:"500,000",
        value:500000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"10GB",
        value:10
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"UNLIMITED",
        value:10000
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:"",
        value:1
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
        label:"2 MILLION",
        value:2000000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"30GB",
        value:30
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"UNLIMITED",
        value:10000
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:"",
        value:1
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
        label:"5 MILLION",
        value:5000000
      }
    },{
      type:"text",
      name:"Storage",
      limit:{
        show:true,
        label:"100GB",
        value:100
      }
    }]
  },{
    category:"REALTIME",
    features:[{
      name:"Connections",
      type:"text",
      limit:{
        show:true,
        label:"UNLIMITED",
        value:10000
      }
    }]
  },{
    category:"MISC",
    features:[{
      name:"Boost",
      type:"boolean",
      limit:{
        show:true,
        label:"",
        value:1
      }
    }]
  }]
}];


var paymentCountries=[{
  code:"AFG",
  label:"Afghanistan"
},{
  code:"ALB",
  label:"Albania"
},{
  code:"DZA",
  label:"Algeria"
},
{
code:"ASM ",label:" American Samoa"
},
{
code:"AND ",label:" Andorra"
},
{
code:"AGO ",label:" Angola"
},
{
code:"AIA ",label:" Anguilla"
},
{
code:"ATA ",label:" Antarctica"
},
{
code:"ATG ",label:" Antigua and Barbuda"
},
{
code:"ARG ",label:" Argentina"
},
{
  code:"ARM ",label:" Armenia"
},
{
code:"ABW ",label:" Aruba"
},
{
code:"AUS ",label:" Australia"
},
{
code:"AUT ",label:" Austria"
},
{code:"AZE ",label:" Azerbaijan"},
{
code:"BHS ",label:" Bahamas"
},
{code:"BHR ",label:" Bahrain"},
{
code:"BGD ",label:" Bangladesh"},
{code:"BRB ",label:" Barbados"},
{code:"BLR ",label:" Belarus"},
{code:"BEL ",label:" Belgium"},
{code:"BLZ ",label:" Belize"},
{code:"BEN ",label:" Benin"},
{code:"BMU ",label:" Bermuda"},
{code:"BTN ",label:" Bhutan"},
{code:"BOL ",label:" Bolivia"},
{code:"BIH ",label:" Bosnia and Herzegovina"},
{code:"BWA ",label:" Botswana"},
{code:"BVT ",label:" Bouvet Island"},
{code:"BRA ",label:" Brazil"},
{code:"IOT ",label:" British Indian Ocean Territory"},
{code:"BRN ",label:" Brunei Darussalam"},
{code:"BGR ",label:" Bulgaria"},
{code:"BFA ",label:" Burkina Faso"},
{code:"BDI ",label:" Burundi"},
{code:"KHM ",label:" Cambodia"},
{code:"CMR ",label:" Cameroon"},
{code:"CAN ",label:" Canada"},
{code:"CPV ",label:" Cape Verde"},
{code:"CYM ",label:" Cayman Islands"},
{code:"CAF ",label:" Central African Republic"},
{code:"TCD ",label:" Chad"},
{code:"CHL ",label:" Chile"},
{code:"CHN ",label:" China"},
{code:"CXR ",label:" Christmas Island"},
{code:"CCK ",label:" Cocos (Keeling) Islands"},
{code:"COL ",label:" Colombia"},
{code:"COM ",label:" Comoros"},
{code:"COG ",label:" Congo"},
{code:"COD ",label:" Congo, the Democratic Republic of the"},
{code:"COK ",label:" Cook Islands"},
{code:"CRI ",label:" Costa Rica"},
{code:"CIV ",label:" Cote D’ivoire"},
{code:"HRV ",label:" Croatia (Hrvatska)"},
{code:"CYP ",label:" Cyprus"},
{code:"CZE ",label:" Czech Republic"},
{code:"DNK ",label:" Denmark"},
{code:"DJI ",label:" Djibouti"},
{code:"DMA ",label:" Dominica"},
{code:"DOM ",label:" Dominican Republic"},
{code:"ECU ",label:" Ecuador"},
{code:"EGY ",label:" Egypt"},
{code:"SLV ",label:" El Salvador"},
{code:"GNQ ",label:" Equatorial Guinea"},
{code:"ERI ",label:" Eritrea"},
{code:"EST ",label:" Estonia"},
{code:"ETH ",label:" Ethiopia"},
{code:"FLK ",label:" Falkland Islands (Malvinas)"},
{code:"FRO ",label:" Faroe Islands"},
{code:"FJI ",label:" Fiji"},
{code:"FIN ",label:" Finland"},
{code:"FRA ",label:" France"},
{code:"FXX ",label:" France, Metropolitan"},
{code:"GUF ",label:" French Guiana"},
{code:"PYF ",label:" French Polynesia"},
{code:"ATF ",label:" French Southern Territories"},
{code:"GAB ",label:" Gabon"},
{code:"GMB ",label:" Gambia"},
{code:"GEO ",label:" Georgia"},
{code:"DEU ",label:" Germany"},
{code:"GHA ",label:" Ghana"},
{code:"GIB ",label:" Gibraltar"},
{code:"GRC ",label:" Greece"},
{code:"GRL ",label:" Greenland"},
{code:"GRD ",label:" Grenada"},
{code:"GLP ",label:" Guadeloupe"},
{code:"GUM ",label:" Guam"},
{code:"GTM ",label:" Guatemala"},
{code:"GIN ",label:" Guinea"},
{code:"GNB ",label:" Guinea-Bissau"},
{code:"GUY ",label:" Guyana"},
{code:"HTI ",label:" Haiti"},
{code:"HMD ",label:" Heard Island and Mcdonald Islands"},
{code:"HND ",label:" Honduras"},
{code:"HKG ",label:" Hong Kong"},
{code:"HUN ",label:" Hungary"},
{code:"ISL ",label:" Iceland"},
{code:"IND ",label:" India"},
{code:"IDN ",label:" Indonesia"},
{code:"IRQ ",label:" Iraq"},
{code:"IRL ",label:" Ireland"},
{code:"ISR ",label:" Israel"},
{code:"ITA ",label:" Italy"},
{code:"JAM ",label:" Jamaica"},
{code:"JPN ",label:" Japan"},
{code:"JOR ",label:" Jordan"},
{code:"KAZ ",label:" Kazakhstan"},
{code:"KEN ",label:" Kenya"},
{code:"KIR ",label:" Kiribati"},
{code:"KOR ",label:" Korea, Republic of"},
{code:"KWT ",label:" Kuwait"},
{code:"KGZ ",label:" Kyrgyzstan"},
{code:"LAO ",label:" Lao People’s Democratic Republic"},
{code:"LVA ",label:" Latvia"},
{code:"LBN ",label:" Lebanon"},
{code:"LSO ",label:" Lesotho"},
{code:"LBR ",label:" Liberia"},
{code:"LBY ",label:" Libyan Arab Jamahiriya"},
{code:"LIE ",label:" Liechtenstein"},
{code:"LTU ",label:" Lithuania"},
{code:"LUX ",label:" Luxembourg"},
{code:"MAC ",label:" Macao"},
{code:"MKD ",label:" Macedonia, the Former Yugoslav Republic of"},
{code:"MDG ",label:" Madagascar"},
{code:"MWI ",label:" Malawi"},
{code:"MYS ",label:" Malaysia"},
{code:"MDV ",label:" Maldives"},
{code:"MLI ",label:" Mali"},
{code:"MLT ",label:" Malta"},
{code:"MHL ",label:" Marshall Islands"},
{code:"MTQ ",label:" Martinique"},
{code:"MRT ",label:" Mauritania"},
{code:"MUS ",label:" Mauritius"},
{code:"MYT ",label:" Mayotte"},
{code:"MEX ",label:" Mexico"},
{code:"FSM ",label:" Micronesia, Federated States of"},
{code:"MDA ",label:" Moldova, Republic of"},
{code:"MCO ",label:" Monaco"},
{code:"MNG ",label:" Mongolia"},
{code:"MNE ",label:" Montenegro"},
{code:"MSR ",label:" Montserrat"},
{code:"MAR ",label:" Morocco"},
{code:"MOZ ",label:" Mozambique"},
{code:"NAM ",label:" Namibia"},
{code:"NRU ",label:" Nauru"},
{code:"NPL ",label:" Nepal"},
{code:"NLD ",label:" Netherlands"},
{code:"ANT ",label:" Netherlands Antilles"},
{code:"NCL ",label:" New Caledonia"},
{code:"NZL ",label:" New Zealand"},
{code:"NIC ",label:" Nicaragua"},
{code:"NER ",label:" Niger"},
{code:"NGA ",label:" Nigeria"},
{code:"NIU ",label:" Niue"},
{code:"NFK ",label:" Norfolk Island"},
{code:"MNP ",label:" Northern Mariana Islands"},
{code:"NOR ",label:" Norway"},
{code:"OMN ",label:" Oman"},
{code:"PAK ",label:" Pakistan"},
{code:"PLW ",label:" Palau"},
{code:"PSE ",label:" Palestinian Territory, Occupied"},
{code:"PAN ",label:" Panama"},
{code:"PNG ",label:" Papua New Guinea"},
{code:"PRY ",label:" Paraguay"},
{code:"PER ",label:" Peru"},
{code:"PHL ",label:" Philippines"},
{code:"PCN ",label:" Pitcairn"},
{code:"POL ",label:" Poland"},
{code:"PRT ",label:" Portugal"},
{code:"PRI ",label:" Puerto Rico"},
{code:"QAT ",label:" Qatar"},
{code:"REU ",label:" Reunion"},
{code:"ROU ",label:" Romania"},
{code:"RUS ",label:" Russian Federation"},
{code:"RWA ",label:" Rwanda"},
{code:"SHN ",label:" Saint Helena"},
{code:"KNA ",label:" Saint Kitts and Nevis"},
{code:"LCA ",label:" Saint Lucia"},
{code:"SPM ",label:" Saint Pierre and Miquelon"},
{code:"VCT ",label:" Saint Vincent and the Grenadines"},
{code:"WSM ",label:" Samoa"},
{code:"SMR ",label:" San Marino"},
{code:"STP ",label:" Sao Tome and Principe"},
{code:"SAU ",label:" Saudi Arabia"},
{code:"SEN ",label:" Senegal"},
{code:"SRB ",label:" Serbia"},
{code:"SCG ",label:" Serbia and Montenegro"},
{code:"SYC ",label:" Seychelles"},
{code:"SLE ",label:" Sierra Leone"},
{code:"SGP ",label:" Singapore"},
{code:"SVK ",label:" Slovakia"},
{code:"SVN ",label:" Slovenia"},
{code:"SLB ",label:" Solomon Islands"},
{code:"SOM ",label:" Somalia"},
{code:"ZAF ",label:" South Africa"},
{code:"SGS ",label:" South Georgia and the South Sandwich Islands"},
{code:"ESP ",label:" Spain"},
{code:"LKA ",label:" Sri Lanka"},
{code:"SUR ",label:" Suriname"},
{code:"SJM ",label:" Svalbard and Jan Mayen Islands"},
{code:"SWZ ",label:" Swaziland"},
{code:"SWE ",label:" Sweden"},
{code:"CHE ",label:" Switzerland"},
{code:"TWN ",label:" Taiwan"},
{code:"TJK ",label:" Tajikistan"},
{code:"TZA ",label:" Tanzania, United Republic of"},
{code:"THA ",label:" Thailand"},
{code:"TLS ",label:" Timor-Leste"},
{code:"TGO ",label:" Togo"},
{code:"TKL ",label:" Tokelau"},
{code:"TON ",label:" Tonga"},
{code:"TTO ",label:" Trinidad and Tobago"},
{code:"TUN ",label:" Tunisia"},
{code:"TUR ",label:" Turkey"},
{code:"TKM ",label:" Turkmenistan"},
{code:"TCA ",label:" Turks and Caicos Islands"},
{code:"TUV ",label:" Tuvalu"},
{code:"UGA ",label:" Uganda"},
{code:"UKR ",label:" Ukraine"},
{code:"ARE ",label:" United Arab Emirates"},
{code:"GBR ",label:" United Kingdom"},
{code:"USA ",label:" United States"},
{code:"UMI ",label:" United States Minor Outlying Islands"},
{code:"URY ",label:" Uruguay"},
{code:"UZB ",label:" Uzbekistan"},
{code:"VUT ",label:" Vanuatu"},
{code:"VAT ",label:" Vatican City State (Holy See)"},
{code:"VEN ",label:" Venezuela"},
{code:"VNM ",label:" Viet Nam"},
{code:"VGB ",label:" Virgin Islands, British"},
{code:"VIR ",label:" Virgin Islands, U.S."},
{code:"WLF ",label:" Wallis and Futuna Islands"},
{code:"ESH ",label:" Western Sahara"},
{code:"YEM ",label:" Yemen"},
{code:"YUG ",label:" Yugoslavia"},
{code:"ZAR ",label:" Zaire"},
{code:"ZMB ",label:" Zambia"},
{code:"ZWE ",label:" Zimbabwe"}
];



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
