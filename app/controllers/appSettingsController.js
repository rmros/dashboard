app.controller('appSettingsController',
	['$scope','$rootScope','$stateParams','$cookies','projectService','projectDetailsService',
	function($scope,$rootScope,$stateParams,$cookies,projectService,projectDetailsService){	
    var id;
    $scope.projectSettings={};

		$scope.init=function(){
      $rootScope.page='appSettings';
       id = $stateParams.appId;

       if($rootScope.currentProject && $rootScope.currentProject.appId === id){
          //if the same project is already in the rootScope, then dont load it. 
          getProjectSettings($rootScope.currentProject.name);             
        }else{
          loadProject(id);              
        }           
              
    };

    $scope.saveSettings=function(isValid){
      if(isValid){

        var data={    
          appId:$rootScope.currentProject.name,      
          appProductionName: $scope.projectSettings.appProductionName,
          isReleasedInProduction:  $scope.projectSettings.isReleasedInProduction,
          appDescription :  $scope.projectSettings.appDescription,
          url: $scope.projectSettings.url
        };

        var saveSettingsPromise=projectDetailsService.saveSettings(data);

        saveSettingsPromise.then(
         function(data){
             $scope.projectSettings=data;
              $.gritter.add({
              position: 'top-right',
              title: 'Success',
              text: 'We successfully saved your app settings.',
              class_name: 'success'
            });                  
         },
         function(error){           
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
                            getProjectSettings($rootScope.currentProject.name);                          
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

        function getProjectSettings(appName){
            projectDetailsService.getProjectSettings(appName).then(
                     function(projectSettings){
                          if(projectSettings){                             
                             $scope.projectSettings=projectSettings;                        
                          }                              
                     },
                     function(error){
                         
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
