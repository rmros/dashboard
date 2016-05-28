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
  $rootScope.page='push'; 

  $scope.pushData={
    title:null,
    icon:null,
    message:null
  }; 

  $scope.sendPushSpinner=false; 


  $scope.deviceOsSelected=[];
  $scope.holdDeviceOsSelected=[];
  $scope.deviceOSChecked={
    all:true,
    android:true,
    ios:true,
    windows:true,
    chrome:true,
    firefox:true,
    edge:true
  }; 
  addAllOS();

  $scope.deviceChannelsSelected=[];
  $scope.holdeDeviceChannelsSelected=[];

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

      //DeviceOS
      if(!$scope.deviceOSChecked.all && $scope.deviceOsSelected.length>0){      
      
        var queryArray=[];
        for(var i=0;i<$scope.deviceOsSelected.length;++i){
          var query = new CB.CloudQuery("Device"); 
          query.equalTo('deviceOS',$scope.deviceOsSelected[i]);
          queryArray.push(query);        
        } 
        if(queryArray.length>0){
           var currentQuery=CB.CloudQuery.or(queryArray);
        }         
      }

      //Channels
      if(typeof currentQuery!=="undefined" && $scope.deviceChannelsSelected.length>0){     
        currentQuery.containedIn('channels',$scope.deviceChannelsSelected);
      }

      //Channels
      if(typeof currentQuery==="undefined" && $scope.deviceChannelsSelected.length>0){ 
        var currentQuery = new CB.CloudQuery("Device");    
        currentQuery.containedIn('channels',$scope.deviceChannelsSelected);
      } 

      if(typeof currentQuery==="undefined" && $scope.deviceChannelsSelected.length==0){ 
        var currentQuery = new CB.CloudQuery("Device");       
      }      

      currentQuery.limit=9999;

      pushService.sendPush($scope.pushData,currentQuery).then(function(data){

        if(data && data.response!=="No Device objects found."){
          successNotify("Successfully sent!");
        }else{
          errorNotify("No Device objects found!");
        }
        
        $scope.sendPushSpinner=false;

        $scope.pushData={
          title:null,
          icon:null,
          message:null
        };

      },function(error){
        errorNotify("Failed to send push message.");
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
        $scope.newChannel=null;
        //Count Audience Size
        countDeviceByQuery(); 
      }          
    }
  };

  $scope.removeChannel=function(channel){
    var index=$scope.deviceChannelsSelected.indexOf(channel);
    if(index>-1){
      $scope.deviceChannelsSelected.splice(index,1);
      //Count Audience Size
      countDeviceByQuery();
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
    //Count Audience Size
    countDeviceByQuery();
  }; 

  $scope.removeOS=function(OS){
    var index=$scope.deviceOsSelected.indexOf(OS);
    if(index>-1){
      $scope.deviceOsSelected.splice(index,1);
      $scope.deviceOSChecked[OS]=false;
      //Count Audience Size
      countDeviceByQuery();
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
       addAllOS();
       countDeviceByQuery();
       
    }else{

       $scope.deviceOSChecked.android=false;
       $scope.deviceOSChecked.ios=false;
       $scope.deviceOSChecked.android=false;
       $scope.deviceOSChecked.windows=false;
       $scope.deviceOSChecked.chrome=false;
       $scope.deviceOSChecked.firefox=false;
       $scope.deviceOSChecked.edge=false;
       $scope.deviceOsSelected=[];
       $scope.audienceSize=0;
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
    $scope.holdDeviceOsSelected=angular.copy($scope.deviceOsSelected);    
    $scope.holdeDeviceChannelsSelected=angular.copy($scope.deviceChannelsSelected);
    $scope.newChannel=null;
    $("#add-audience-modal").modal();
  };

  $scope.cancelAudience=function(){
    $scope.deviceOsSelected=angular.copy($scope.holdDeviceOsSelected);    
    $scope.deviceChannelsSelected=angular.copy($scope.holdeDeviceChannelsSelected);
    $("#add-audience-modal").modal("hide");
    //Count Audience Size
    countDeviceByQuery();
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

  $scope.useAudience=function(){
    if($scope.deviceOsSelected.length>0){
      $("#add-audience-modal").modal("hide");

      //Convert To String
      var tempOS=angular.copy($scope.deviceOsSelected);
      $scope.selectedOSString=tempOS.toString();

      var tempChannel=angular.copy($scope.deviceChannelsSelected);
      $scope.selectedChannelString=tempChannel.toString();

      //Count Audience Size
      countDeviceByQuery();

    }else{
      WarningNotify("You need to select atleast one  device");
    }
    
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
          countDevices();                 
        }                              
      }, function(error){          
      });
    }
    
  }

  function countDevices() {
    cloudBoostApiService.queryCountByTableName("Device").then(function(number){
      $scope.audienceSize=number;
    },function(error){
      errorNotify(error);
    });
  }

  function countDeviceByQuery(){    

    //DeviceOS
    if(!$scope.deviceOSChecked.all && $scope.deviceOsSelected.length>0){      
    
      var queryArray=[];
      for(var i=0;i<$scope.deviceOsSelected.length;++i){
        var query = new CB.CloudQuery("Device"); 
        query.equalTo('deviceOS',$scope.deviceOsSelected[i]);
        queryArray.push(query);        
      } 
      if(queryArray.length>0){
         var currentQuery=CB.CloudQuery.or(queryArray);
      }         
    }

    //Channels
    if(typeof currentQuery!=="undefined" && $scope.deviceChannelsSelected.length>0){     
      currentQuery.containedIn('channels',$scope.deviceChannelsSelected);
    }

    //Channels
    if(typeof currentQuery==="undefined" && $scope.deviceChannelsSelected.length>0){ 
      var currentQuery = new CB.CloudQuery("Device");    
      currentQuery.containedIn('channels',$scope.deviceChannelsSelected);
    } 

    if(typeof currentQuery==="undefined" && $scope.deviceChannelsSelected.length==0){ 
      var currentQuery = new CB.CloudQuery("Device");       
    }    
    
    currentQuery.limit=9999;
    currentQuery.count({
      success : function(number){
        $scope.audienceSize=number;
        $scope.$digest();
      }, error : function(error){
        errorNotify(error);
      }
    });
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  
  				
		
}]);
