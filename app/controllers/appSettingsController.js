app.controller('appSettingsController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout){	    

  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='appsettings'; 

  $scope.settingsMenu={
    general:true,
    email:false,
    push:false
  }; 
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB(); 
      //$rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                         
    }else{
      //loadProject(id);              
    }
  };

  $scope.selectSettings=function(settingsName){
    if(settingsName=="general"){
      $scope.settingsMenu.general=true;
      $scope.settingsMenu.email=false;
      $scope.settingsMenu.push=false;
    }
    if(settingsName=="email"){
      $scope.settingsMenu.general=false;
      $scope.settingsMenu.email=true;
      $scope.settingsMenu.push=false;
    }
    if(settingsName=="push"){
      $scope.settingsMenu.general=false;
      $scope.settingsMenu.email=false;
      $scope.settingsMenu.push=true;
    }
  };  

  /**************Private fuctions*********************/
  function initCB(){
    //CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  
 				
		
}]);
