app.controller('indexController',
	['$scope',
  '$q',
  '$http',
  '$filter',
  '$state',
  '$timeout',
  '$rootScope',
  'userService',
  '$location',
  'notificationService',
  'projectService',
  '$sce',
  'serverSettingsService',
  'tableService',
  'beaconService',
  'paymentService',
  'analyticsService',
	function($scope,
    $q,
    $http,
    $filter,
    $state,
    $timeout,
    $rootScope,
    userService,
    $location,
    notificationService,
    projectService,
    $sce,
    serverSettingsService,
    tableService,
    beaconService,
    paymentService,
    analyticsService){	

    //Index page variables
    $scope.isAdminLoggedIn=false;
    $scope.notifySpinner=false;
    $scope.notificationsSkip=0;
    $scope.notificationsLimit=5;
    $scope.acceptInvitationSpinner=[];
    $scope.declineInvitationSpinner=[];  
    $scope.okGotItSpinner=[];
    getUserInfo();
    isHosted(); 

    $rootScope.projectListObj=[];

    //App Usages
    $rootScope.apiCallsUsed={};
    $rootScope.storageUsed={};

    //App Loadings
    $rootScope.apiCallsLoading={};
    $rootScope.storageLoading={}; 

    //App Errors  
    $rootScope.apiCallsError={};
    $rootScope.storageError={};

    $scope.pricingPlans=pricingPlans;

    $rootScope.getAppUsageDetails=function(appIdArray){
      //Load and errors
      for(var i=0;i<appIdArray.length;++i){
        $rootScope.apiCallsError[appIdArray[i]]=false; 
        $rootScope.apiCallsLoading[appIdArray[i]]=true;

        $rootScope.storageError[appIdArray[i]]=false; 
        $rootScope.storageLoading[appIdArray[i]]=true;
      }

      analyticsService.bulkApiStorageDetails(appIdArray).then(function(list){

        
        for(var i=0;i<list.api.length;++i){
          //For API
          if(list && list.api[i]){
            var apiPercentageObj=calculatePercentage(list.api[i],"api");         
            $rootScope.apiCallsUsed[list.api[i].appId]=apiPercentageObj;
            $rootScope.apiCallsLoading[list.api[i].appId]=false;
          }
          

          //For Storage
          if(list && list.storage[i]){
            var storagePercentageObj=calculatePercentage(list.storage[i],"storage"); 
            $rootScope.storageUsed[list.storage[i].appId]=storagePercentageObj;
            $rootScope.storageLoading[list.storage[i].appId]=false;
          }
        }
        

      },function(error){
        //Load and errors
        for(var i=0;i<appIdArray.length;++i){
          $rootScope.apiCallsError[appIdArray[i]]=true; 
          $rootScope.apiCallsLoading[appIdArray[i]]=false;

          $rootScope.storageError[appIdArray[i]]=true; 
          $rootScope.storageLoading[appIdArray[i]]=false;
        }
      });     
  };


  $rootScope.loadApiCountByAppId=function(appObj){
    $rootScope.apiCallsError[appObj.appId]=false; 
    $rootScope.apiCallsLoading[appObj.appId]=true;

    analyticsService.apiCount(appObj.appId).then(function(respObj){

        var percentageObj=calculatePercentage(respObj,"api");     
        
        $rootScope.apiCallsUsed[respObj.appId]=percentageObj;
        $rootScope.apiCallsLoading[respObj.appId]=false;

    },function(error){ 
        $rootScope.apiCallsLoading[error.appId]=false;
        $rootScope.apiCallsError[error.appId]=true;             
    });
  };

  $rootScope.loadStorageCountByAppId=function(appObj){
     $rootScope.storageError[appObj.appId]=false; 
     $rootScope.storageLoading[appObj.appId]=true;
     analyticsService.storageCount(appObj.appId).then(function(respObj){

        var percentageObj=calculatePercentage(respObj,"storage");              

        $rootScope.storageUsed[respObj.appId]=percentageObj;
        $rootScope.storageLoading[respObj.appId]=false;

     },function(error){
        $rootScope.storageLoading[error.appId]=false;
        $rootScope.storageError[error.appId]=true;              
     });
  };

  function calculatePercentage(respObj,featureName){
    var appPlan=null;
    var app=_.first(_.where($rootScope.projectListObj, {appId: respObj.appId}));
    if(!app.planId || app.planId==1){
      appPlan=1;
    }else if(app.planId){
      appPlan=app.planId;
    }

    var appPlan=_.first(_.where($scope.pricingPlans, {id: appPlan}));
    var databaseUsage=_.first(_.where(appPlan.usage, {category: "DATABASE"}));

    var planApiLimit=_.first(_.where(databaseUsage.features, {name: "API Calls"}));
    var apiLimit=planApiLimit.limit.value;
    var apiLabel=planApiLimit.limit.label;
    var apiColor="#4aa3df";

    var planStorageLimit=_.first(_.where(databaseUsage.features, {name: "Storage"})); 
    var storageLimit=planStorageLimit.limit.value; 
    var storageLabel=planStorageLimit.limit.label;
    var storageColor="#4aa3df";  
    

    if(featureName=="api" && respObj && respObj.monthlyApiCount){
      var used=respObj.monthlyApiCount;      
      var percentageUsed=used*(100/apiLimit);
              
      if(percentageUsed>0 && percentageUsed<1){
        percentageUsed=1;
      }      
      if(percentageUsed>100){
        percentageUsed=100;
      }      
      if(percentageUsed>80){
        apiColor="#C90606";
      }

      percentageUsed=Math.floor(percentageUsed);
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalCount:respObj.monthlyApiCount,
        limit:apiLabel,
        color:apiColor
      };
    }else if(featureName=="api"){
      var percentageUsed=0;
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalCount:0,
        limit:apiLabel,
        color:apiColor
      };
    }

    if(featureName=="storage" && respObj && respObj.size){
      var used=(respObj.size/1000);//Convert to GBs
      var limit=storageLimit;//(already in GBs)
      var percentageUsed=used*(100/limit);      
      if(percentageUsed>0 && percentageUsed<1){
        percentageUsed=1;
      }
      if(percentageUsed>100){
        percentageUsed=100;
      }
      if(percentageUsed>80){
        storageColor="#C90606";
      }
      percentageUsed=Math.floor(percentageUsed);
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalSize:used,
        limit:storageLabel,
        color:storageColor
      };
    }else if(featureName=="storage"){
      var percentageUsed=0;
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalSize:0,
        limit:storageLabel,
        color:storageColor
      };
    }    
    
    return resp;
  }


/***********************Index Controller functions************************/
  $scope.loadMoreNotifications=function(){    
    $scope.loadingMoreNotifications=true;
    notificationService.getNotifications($scope.notificationsLimit,5)
    .then(function(notifyList){ 
      if(notifyList && notifyList.length>0){
        $scope.notificationsLimit=$scope.notificationsLimit+notifyList.length;

        if($rootScope.notifications.length>0){
          $rootScope.notifications = $rootScope.notifications.concat(notifyList);           
        }else{
          $rootScope.notifications=notifyList;
        }        
      }  
      $scope.loadingMoreNotifications=false;   
    },function(error){      
      $scope.loadingMoreNotifications=false;              
    });
  };

     

  $scope.updateNotificationsSeen=function(){
    notificationService.updateNotificationsSeen()
    .then(function(list){ 
      $(".notifybubble").hide();   
    }, function(error){         
    });
  };

//Confirm Notification//
  $scope.addDeveloper=function(index,notifyObject) {
    $scope.acceptInvitationSpinner[index]=true;
    projectService.addDeveloper(notifyObject.appId,$rootScope.user.email)
    .then(function(project){ 
      var notificationIndex=$rootScope.notifications.indexOf(notifyObject);
      $rootScope.notifications.splice(notificationIndex,1);

      if($rootScope.notifications.length==0){
        //$(".notify-menu-anchor").click();
      }

      if(project && project.appId){       
        $rootScope.projectListObj.push(project);
        //Get Usage Details
        $scope.loadApiCountByAppId(project);
        $scope.loadStorageCountByAppId(project);
      }    
      $scope.acceptInvitationSpinner[index]=false; 

    }, function(error){  
      if($rootScope.notifications.length==0){
        //$(".notify-menu-anchor").click();
      }
      $scope.acceptInvitationSpinner[index]=false;              
    });

  };  

  $scope.removeUserFromInvited=function(index,notifyObject){  
    $scope.declineInvitationSpinner[index]=true;  
    projectService.removeUserFromInvited(notifyObject.appId,$rootScope.user.email)
    .then(function(data){ 
      var notificationIndex=$rootScope.notifications.indexOf(notifyObject);
      $rootScope.notifications.splice(notificationIndex,1); 
      if($rootScope.notifications.length==0){
        //$(".notify-menu-anchor").click();
      }  
      $scope.declineInvitationSpinner[index]=false;                        
    },function(error){       
      $scope.declineInvitationSpinner[index]=false;                        
    });
  }; 
  //End Confirm Notification// 

  //Inform notifications(app-upgraded)
  $scope.removeNotification=function(index,notifyObject){  
    $scope.okGotItSpinner[index]=true;  
    notificationService.removeNotification(notifyObject._id)
    .then(function(data){ 

      var notificationIndex=$rootScope.notifications.indexOf(notifyObject);
      $rootScope.notifications.splice(notificationIndex,1); 
      if($rootScope.notifications.length==0){
        //$(".notify-menu-anchor").click();
      }  
      $scope.okGotItSpinner[index]=false;                        
    },function(error){        
      $scope.okGotItSpinner[index]=false;                        
    });
  };
  //End Inform notifications(app-upgraded)

  //Payment(ask to upgrade)
  $scope.upgradeAppNow=function(index,notifyObject){
    $rootScope.$broadcast('openUpgradeModal', { appId:notifyObject.appId});
    $(".notify-menu-anchor").click();

    notificationService.removeNotification(notifyObject._id)
    .then(function(data){
      var notificationIndex=$rootScope.notifications.indexOf(notifyObject);
      $rootScope.notifications.splice(notificationIndex,1);                              
    });
    
  };
  //End Payment(ask to upgrade)

  $rootScope.logOut=function(){
    userService.logOut()      
    .then(function(data){           

      $.removeCookie('userId', { path: '/' });
      $.removeCookie('userFullname', { path: '/' });
      $.removeCookie('email', { path: '/' });
      $.removeCookie('createdAt', { path: '/' });

      window.location.href="/accounts";
    },function(error){
      console.log(error);
    });      
  };

  $scope.toggleSideMenu=function(){     
    /*Collapse sidebar*/
    toggleSideBar();         
  };

  $scope.renderHtml = function (htmlCode) {
    return $sce.trustAsHtml(htmlCode);
  };

/**************************************** Index Controller Private Functions**********************************/
  function isHosted(){
    serverSettingsService.isHosted()
    .then(function(result){

      if(result && result=="true"){
        $rootScope.isHosted=true;
      }else{
        $rootScope.isHosted=false;
      }  
       
    }, function(error){            
    });     
  }


  function getUserInfo(){  
    $scope.notifySpinner=true;  
    userService.getUserInfo()
    .then(function(obj){ 
      if(obj && obj.user){
        $rootScope.user=obj.user; 
        getNotifications();           
      }else{
        $scope.notifySpinner=false;
      }         
      if(obj && obj.file){
        getImgSize(obj.file.document.url);      
        $rootScope.profilePic=obj.file; 
      }else{
        $rootScope.profilePic=null; 
      }  

      checkCookiesAndRedirect();

    }, function(error){ 
      $scope.notifySpinner=false; 
      checkCookiesAndRedirect();       
    });
  }  

  function getNotifications(){    
    notificationService.getNotifications($scope.notificationsSkip,$scope.notificationsLimit) 
    .then(function(list){ 
      $rootScope.notifications=list;
      $scope.notifySpinner=false;
    }, function(error){   
      $scope.notifySpinner=false;      
    });
  }

  function toggleSideBar(_this){
    var b = $("#sidebar-collapse")[0];
    var w = $("#cl-wrapper");
    var s = $(".cl-sidebar");
   
    $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
    w.addClass("sb-collapsed");
    $.cookie('FLATDREAM_sidebar','closed',{expires:365, path:'/'});         
    //updateHeight();
  } 

  function getImgSize(imgSrc) {
      var newImg = new Image();

      newImg.onload = function() {
        var height = newImg.height;
        var width = newImg.width;
        
        if(width>height){
          $(".profile-avatar").css({"width":"auto","height":"28px"});
        }else if(height>width){
          $(".profile-avatar").css({"width":"28px","height":"auto"});
        }        
      }

      newImg.src = imgSrc; // this must be done AFTER setting onload
  }

  function checkCookiesAndRedirect(){
    $scope.$watch(function(scope) {
      return $location.path();
    },function(newPath,oldPath) {
        if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){          
          window.location.href="/accounts";
        }else{
          $rootScope.userFullname=$.cookie('userFullname');
          /*if($rootScope.user && $rootScope.user.isAdmin && !$scope.isAdminLoggedIn){
            $scope.isAdminLoggedIn=true;          
            window.location.href="#/admin";          
          } */
        }            
    });
  };
      				
		
}]);
