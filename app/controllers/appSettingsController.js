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

  $scope.spinners={};

  $scope.generalSettings={
    category:"general",
    settings:{
      appName:null,
      appInProduction:false
    }
  };

  $scope.emailSettings={
    category:"email",
    settings:{
      mandrillApiKey:null,
      email:null,
      from:null
    }
  };

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

  $scope.updateSettings=function(categoryName){

    var settingsObj=null;
    var validate=false;
    var validateMsg=null;

    if(categoryName=="general"){
      settingsObj=$scope.generalSettings.settings;
      validate=true;
      validateMsg=null;
    }
    if(categoryName=="email"){
      settingsObj=$scope.emailSettings.settings;
      if(settingsObj.mandrillApiKey && settingsObj.email && settingsObj.from){
        validate=true;
      }else{
        validate=false;
        validateMsg="All fields are required";
      }
    }
    
    if(validate){
   
      $scope.spinners[categoryName]=true;
      appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,categoryName,settingsObj)
      .then(function(settings){
        $scope.spinners[categoryName]=false;                                    
      }, function(error){ 
        $scope.spinners[categoryName]=false;                
      });

    }else{
      WarningNotify(validateMsg);
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

      if(settings && settings.length>0){
        var general=_.where(settings, {category: "general"});
        if(general && general.length>0){
          $scope.generalSettings=general[0];
        } 

        var email=_.where(settings, {category: "email"});
        if(email && email.length>0){
          $scope.emailSettings=email[0];
        }       
      }
      
      
      $scope.settingsLoading=false;                               
    }, function(error){ 
      $scope.settingsLoading=false;           
    });   
  }	
		
}]);
