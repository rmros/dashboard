app.controller('appSettingsController',
	['$scope','$rootScope','$stateParams','$cookies','projectService','projectDetailsService',
	function($scope,$rootScope,$stateParams,$cookies,projectService,projectDetailsService){	
    var id;
    $scope.projectSettings={};
    $scope.saveSettingsSpinner=false;
		$scope.init=function(){
      $rootScope.page='appSettings';
       id = $stateParams.appId;
       $rootScope.dataLoading=true;

       if($rootScope.currentProject && $rootScope.currentProject.appId === id){
          //if the same project is already in the rootScope, then dont load it. 
          getProjectSettings($rootScope.currentProject.appId);             
        }else{
          loadProject(id);              
        }           
              
    };

    $scope.saveSettings=function(isValid){
      $scope.saveSettingsSpinner=true;
      if(isValid){

        var data={    
          appId:$rootScope.currentProject.appId,      
          appProductionName: $scope.projectSettings.appProductionName,
          isReleasedInProduction:  $scope.projectSettings.isReleasedInProduction,
          appDescription :  $scope.projectSettings.appDescription,
          url: $scope.projectSettings.url
        };

        var saveSettingsPromise=projectDetailsService.saveSettings(data);

        saveSettingsPromise.then(
         function(data){
              $scope.saveSettingsSpinner=false;
             $scope.projectSettings=data;
              $.gritter.add({
              position: 'top-right',
              title: 'Success',
              text: 'We successfully saved your app settings.',
              class_name: 'success'
            });                  
         },
         function(error){    
            $scope.saveSettingsSpinner=false;       
            $.gritter.add({
              position: 'top-right',
              title: 'Error',
              text: 'Cannot connect to server. Please try again.',
              class_name: 'danger'
            });
         }
       );

      }//if valid
    };

    /* PRIVATE FUNCTIONS */

        function loadProject(id){

            projectService.getProject(id).then(
                     function(currentProject){
                          if(currentProject){
                            $rootScope.currentProject=currentProject; 
                            getProjectSettings($rootScope.currentProject.appId);                          
                          }                              
                     },
                     function(error){
                         
                        $.gritter.add({
                            position: 'top-right',
                            title: 'Error',
                            text: "We cannot load your project at this point in time. Please try again later.",
                            class_name: 'danger'
                        });
                     }
                   );
        } 

        function getProjectSettings(appId){
            projectDetailsService.getProjectSettings(appId).then(
                     function(projectSettings){
                          if(projectSettings){                             
                             $scope.projectSettings=projectSettings;                        
                          } 
                          $rootScope.dataLoading=false;                             
                     },
                     function(error){
                        $rootScope.dataLoading=false;
                        $.gritter.add({
                            position: 'top-right',
                            title: 'Error',
                            text: "We cannot load your project Settings at this point in time. Please try again later.",
                            class_name: 'danger'
                        });
                     }
                   );
        }       

}]);
