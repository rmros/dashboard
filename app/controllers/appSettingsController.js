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
      appInProduction:false,
      appIcon:null
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

  $scope.pushSettings={
    category:"push",
    settings:{
      apple:{
        certificates:[]
      },
      android:{
        credentials:[]
      },
      windows:{
        credentials:[]
      }
    }
  };

  $scope.fileAllowedTypes="*";//Files

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

    _setDefaultTemplate().then(function(defTemplate){

      $scope.emailSettings.settings.template =defTemplate;

      if($rootScope.currentProject && $rootScope.currentProject.appId === id){
        //if the same project is already in the rootScope, then dont load it.
        getSettings();                                
      }else{
        loadProject(id);              
      }

    },function(error){

      if($rootScope.currentProject && $rootScope.currentProject.appId === id){
        //if the same project is already in the rootScope, then dont load it.
        getSettings();                                
      }else{
        loadProject(id);              
      }
      
    });

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
    if(categoryName=="push"){
      settingsObj=$scope.pushSettings.settings; 
      validate=true;
      validateMsg=null;     
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

  $scope.initAddAppIcon=function(){
    $scope.editableFile=null;
    $("#md-appsettingsfileviewer").modal();
  };

  $scope.removeAppIcon=function(){
    $scope.generalSettings.settings.appIcon=null;
  };

  $scope.initAddAppleCertificate=function(){
    $scope.editableFile=null;
    $("#md-appsettingsfileviewer").modal();
  };

  $scope.saveFile=function(file){
    if(file){
      var names=file.name.split(".");

      //App Icon
      if($scope.settingsMenu.general){

      }

      //Apple Certificate
      if($scope.settingsMenu.push){
        if(names[1]=="p12"){
          $("#md-appsettingsfileviewer").modal("hide");

          appSettingsService.upsertAppleCertificate($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,file)
          .then(function(resp){

            if($scope.pushSettings.settings.apple.certificates.length==0){
              $scope.pushSettings.settings.apple.certificates.push(resp);
            }else if($scope.pushSettings.settings.apple.certificates.length>0){
              $scope.pushSettings.settings.apple.certificates[0]=resp;
            }

          },function(error){
            errorNotify("Error on saving apple certificate, try again..");
          });
          
        }else{
          errorNotify("Invalid .p12 file");
        }
      }

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
    
    if(settingsName=="push" && !$scope.settingsMenu.push && $scope.settingsMenuHover.push){
      $scope.settingsMenuHover.push=false;
    }
  }; 

/********************************Private fuctions****************************/
  function loadProject(id){ 
    //$scope.settingsLoading=true;  
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
    //$scope.settingsLoading=true;  
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

        var push=_.where(settings, {category: "push"});
        if(push && push.length>0){
          $scope.pushSettings=push[0];
        }      
      }      
      
      $scope.settingsLoading=false;                               
    }, function(error){ 
      $scope.settingsLoading=false;           
    });
 
  }  

  function _setDefaultTemplate(){ 
    var q=$q.defer();

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
      if(xmlhttp.status === 200 && xmlhttp.readyState === 4){
        q.resolve(xmlhttp.responseText);
      }
      if(xmlhttp.status !== 200 && xmlhttp.status!==0){
        q.reject("Failed to load default email template");
      }
    };
    xmlhttp.open("GET","assets/files/reset-password.html",true);
    xmlhttp.send();

    return  q.promise;
  }
		
}]);
