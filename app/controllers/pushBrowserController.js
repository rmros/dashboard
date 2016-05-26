app.controller('pushBrowserController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'pushService',
'cloudBoostApiService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
pushService,
cloudBoostApiService){	
  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='Push'; 


  $scope.pushData={
    title:null,
    icon:null,
    message:null
  }; 

  $scope.sendPushSpinner=false; 

  $scope.deviceObject=[];
  $scope.deviceOsSelected=[];
  $scope.deviceOSChecked={
    all:true,
    android:true,
    ios:true,
    windows:true,
    chrome:true,
    firefox:true,
    edge:true
  }; 

  $scope.deviceChannelsSelected=[];

  $scope.audienceSize=null;
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB(); 
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                        
    }else{
      loadProject(id);              
    }
  }; 

  $scope.sendPush=function(){
    if($scope.pushData.message){
      $scope.sendPushSpinner=true;
      pushService.sendPush($scope.pushData).then(function(data){

        successNotify("Successfully sent!");
        $scope.sendPushSpinner=false;

        $scope.pushData={
          title:null,
          icon:null,
          message:null
        };

      },function(error){
        errorNotify(error);
        $scope.sendPushSpinner=false;
      });
    }else{
      errorNotify("Message is a required field.");
    }
  };

  $scope.addChannel=function(){
    if($scope.newChannel){    

      if($scope.deviceChannelsSelected.indexOf($scope.newChannel)>-1){
        WarningNotify("This Channel already exist in the list");
      }else{
        $scope.deviceChannelsSelected.push($scope.newChannel);  
      }          
    }
  };

  $scope.removeChannel=function(channel){
    var index=$scope.deviceChannelsSelected.indexOf(channel);
    if(index>-1){
      $scope.deviceChannelsSelected.splice(index,1);
    }    
  };

  $scope.modifyOS=function(checked,OS){
    if(checked){    

      if($scope.deviceOsSelected.indexOf(OS)>-1){
        WarningNotify("This OS already exist in the list");
      }else{
        $scope.deviceOsSelected.push(OS);  
      } 

    }else{
      $scope.deviceOSChecked.all=false;
      var index=$scope.deviceOsSelected.indexOf(OS);
      if(index>-1){
        $scope.deviceOsSelected.splice(index,1);
      }
    }
  }; 

  $scope.removeOS=function(OS){
    var index=$scope.deviceOsSelected.indexOf(OS);
    if(index>-1){
      $scope.deviceOsSelected.splice(index,1);
      $scope.deviceOSChecked[OS]=false;
    }  
  }; 

  $scope.modifyAllOS=function(checked){
    if(checked){
       $scope.deviceOSChecked.android=true;
       $scope.deviceOSChecked.ios=true;
       $scope.deviceOSChecked.android=true;
       $scope.deviceOSChecked.windows=true;
       $scope.deviceOSChecked.chrome=true;
       $scope.deviceOSChecked.firefox=true;
       $scope.deviceOSChecked.edge=true;
       $scope.deviceOsSelected=[];
       
    }else{

       $scope.deviceOSChecked.android=false;
       $scope.deviceOSChecked.ios=false;
       $scope.deviceOSChecked.android=false;
       $scope.deviceOSChecked.windows=false;
       $scope.deviceOSChecked.chrome=false;
       $scope.deviceOSChecked.firefox=false;
       $scope.deviceOSChecked.edge=false;
       $scope.deviceOsSelected=[];
    }
  }

  function addAllOS(){
   var allOS=["android","ios","windows","chrome","firefox","edge"];
    for(var i=0;i<allOS.length;++i){
      var index=$scope.deviceOsSelected.indexOf(allOS[i]);
      if(index<0){
        $scope.deviceOsSelected.push(allOS[i]);
      }
   }
  }

  $scope.editAudience=function() {
    $("#add-audience-modal").modal();
  };

  $scope.openDeviceChannelList=function(){    
    $scope.deviceChannelListOpen=true;       
  };

  $scope.closeDeviceChannelList=function(){
    $scope.deviceChannelListOpen=false;
  };

  $scope.openDeviceOSList=function(){    
    $scope.deviceOSListOpen=true;       
  };

  $scope.closeDeviceOSList=function(){
    $scope.deviceOSListOpen=false;
  };

  //Private Functions
  function loadProject(id){
    
    if($rootScope.currentProject){
      initCB();      
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB(); 
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name; 
          getDevices();
          countDevices();                 
        }                              
      }, function(error){          
      });
    }
    
  }

  function getDevices() {
    cloudBoostApiService.queryTableByName("Device").then(function(list){
      $scope.deviceObject=list;
    },function(error){
      errorNotify(error);
    });
  }

  function countDevices() {
    cloudBoostApiService.queryCountByTableName("Device").then(function(number){
      $scope.audienceSize=number;
    },function(error){
      errorNotify(error);
    });
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  
  				
		
}]);
