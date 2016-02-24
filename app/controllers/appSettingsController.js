app.controller('appSettingsController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'appSettingsService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
appSettingsService){	    

  
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

    $rootScope.pageHeaderDisplay="App Settings";
    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      getSettings();                                
    }else{
      loadProject(id);              
    }
  };

  //Toggler
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

/********************************Private fuctions****************************/
  function loadProject(id){ 
    $scope.settingsLoading=true;  
    projectService.getProject(id)
    .then(function(currentProject){
      if(currentProject){
        $rootScope.currentProject=currentProject; 
        getSettings();                
      }                              
    }, function(error){            
    });   
  }	

  function getSettings(){ 
    $scope.settingsLoading=true;  
    appSettingsService.getSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master)
    .then(function(settings){
      $scope.appsettings=settings;
      $scope.settingsLoading=false;                               
    }, function(error){ 
      $scope.settingsLoading=false;           
    });   
  }	
		
}]);
