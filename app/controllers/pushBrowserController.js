app.controller('pushBrowserController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'pushService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
pushService){	
  
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
        }                              
      }, function(error){          
      });
    }
    
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  
  				
		
}]);
