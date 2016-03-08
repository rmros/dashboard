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
      from:null,
      template:""
    }
  };

  $scope.templateEditorOptions={
    height:"200", 
    heightMax:"300",   
    theme: 'gray',   
    toolbarButtons : ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'fontFamily', 'fontSize', '|', 'color','insertLink','insertTable', 'undo', 'redo','html']
  };

  $scope.settingsMenu={
    general:true,
    email:false,
    push:false
  };

  $scope.settingsMenuHover={
    general:false,
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
    //_setDefaultTemplate();
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
        validateMsg="All Mandrill API Key,From Email,From Name are required";
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

  $scope.menuHover=function(settingsName){
    if(settingsName=="general" && !$scope.settingsMenu.general && !$scope.settingsMenuHover.general){     
      $scope.settingsMenuHover.general=true;
    }    

    if(settingsName=="email" && !$scope.settingsMenu.email && !$scope.settingsMenuHover.email){
      $scope.settingsMenuHover.email=true;
    }
   
    if(settingsName=="push" && !$scope.settingsMenu.push && !$scope.settingsMenuHover.push){
      $scope.settingsMenuHover.push=true;
    }
    
  };

  $scope.menuLeave=function(settingsName){
    
    if(settingsName=="general" && !$scope.settingsMenu.general && $scope.settingsMenuHover.general){     
      $scope.settingsMenuHover.general=false;
    }
    
    if(settingsName=="email" && !$scope.settingsMenu.email && $scope.settingsMenuHover.email){
      $scope.settingsMenuHover.email=false;
    }
    
    if(settingsName=="push" && !$scope.settingsMenu.push && $scope.settingsMenuHover.pus){
      $scope.settingsMenuHover.push=false;
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
      console.log(error); 
      $scope.settingsLoading=false;          
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

  function _setDefaultTemplate(){   
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
      if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
        $scope.emailSettings.settings.template = xmlhttp.responseText;
      }
    };
    xmlhttp.open("GET","assets/files/reset-password.html",true);
    xmlhttp.send();
  }
		
}]);
