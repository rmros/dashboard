'use strict';

app.controller('appsController',['$scope',
  'projectService',
  '$http',
  '$rootScope',
  '$cookies',
  '$intercom', 
  function ($scope,
  projectService,
  $http,
  $rootScope,
  $cookies,
  $intercom) {

        $scope.init=function(){
              //Hiding the Menu
              $scope.isLoading = [];
              $rootScope.showMenu=false;
              $rootScope.currentProject=null;
              $scope.showSaveBtn = true;

               $http.post(serverURL+'/auth/signin', {email:"hotcomputerworks@hot.xyz",password:"sample"}).
               success(function(data, status, headers, config) { 

              $cookies.userId = data._id;
              $cookies.userFullname = data.name; 
              $cookies.email = data.email;
              $cookies.createdAt = data.createdAt;

                // Intercom integration   
                integrateIntercom();

                  //listing start
                  var listPromise=projectService.projectList();
                   listPromise.then(
                     function(data){
                         $scope.projectListObj=data;
                         //temporary
                         $scope.appKey="xYmasZjSykaDXwpPk5QBknHsEdnXcXImVtGfle6P";
                         $scope.masterKey="60tyPl8GMRJQlHKbKw4YSQK8038L7L646fmuVzeY";
                         $scope.clientKey="eApH5K6gq1uUg0fLzpejZIomwv6OhSHWYl3IKvJm";

                     },
                     function(error){
                        Messenger().post({
                          message: 'Cannot connect to server. Please try again.',
                          type: 'error',
                          showCloseButton: true
                        });
                     }
                   );
                   //listing ends
               }).
               error(function(data, status, headers, config) {
                     Messenger().post({
                        message: 'Cannot connect to server. Please try again.',
                        type: 'error',
                        showCloseButton: true
                      });
               });
               //end of http call
        };

        $scope.deleteProject = function(project, index){

          //first confirm.
          bootbox.prompt("To delete, type in the app name.", function(result) {                
            if (result === null) {                                             
                      Messenger().post({
                        message: 'App name you entered was empty.',
                        type: 'error',
                        showCloseButton: true
                      });              
            } else {
              if(result === project.name){

                $scope.isLoading[index] = true;

                 var promise=projectService.deleteProject(project.appId);
                    promise.then(
                      function(){
                        $scope.isLoading[index] = false;
                        //project is deleted.
                        $scope.projectListObj.splice($scope.projectListObj.indexOf(project),1);

                        Messenger().post({
                            message: 'The project is successfully deleted.',
                            type: 'success',
                            showCloseButton: true
                        });

                      },
                      function(error){
                         $scope.isLoading[index] = false;
                         Messenger().post({
                            message: 'Cannot delete this project at this point in time. Please try again later.',
                            type: 'error',
                            showCloseButton: true
                          });
                         
                      });

              } else{
                Messenger().post({
                        message: 'Project name doesnot match. ',
                        type: 'error',
                        showCloseButton: true
                      });   
              }                      
            }
          });

         
        };

        $scope.createProject=function(isValid){

              if(isValid){
                $scope.showSaveBtn = false;
                
                var createProjectPromise=projectService.createProject($scope.name, $scope.appId);
                createProjectPromise.then(
                  function(data){
                    $scope.showSaveBtn = true;
                    if($scope.projectListObj.length>0){
                      $scope.projectListObj.push(data);
                    }else{
                      $scope.projectListObj=[];
                      $scope.projectListObj.push(data);
                    }
                      
                      Messenger().post({
                        message: 'The project is successfully created.',
                        type: 'success',
                        showCloseButton: true
                      });
                      $scope.name="";
                      $scope.appId = "";

                  },
                  function(error){
                    $scope.showSaveBtn = true;
                    if(error === 400){
                     Messenger().post({
                        message:'App ID already exists. Please choose a different App ID',
                        type: 'error',
                        showCloseButton: true
                      });
                    }

                    if(error === 500){
                       Messenger().post({
                        message: 'Cannot connect to server. Please try again.',
                        type: 'error',
                        showCloseButton: true
                      });
                    }
                     
                  }
                    
                );
              }
        }

        $scope.editProject=function(isValid,index,appId,name){

            if(isValid){

              $scope.isLoading[index] = true;

              var editProjectPromise=projectService.editProject(appId,name);
                  editProjectPromise.then(
                    function(data){
                       $scope.isLoading[index] = false;
                        $scope.projectListObj[index]=data;
                         Messenger().post({
                          message: 'The project is successfully modified.',
                          type: 'success',
                          showCloseButton: true
                      });
                    },
                    function(error){
                        $scope.isLoading[index] = false;
                        $scope.editprojectError=error;                       
                    }
                  );

            }

        };

        $scope.goToTableDesigner=function(projectObj){
          //Setting Current Project
           $rootScope.currentProject=projectObj;
           //Redirect to Table designer
           window.location.href="/#/"+projectObj.appId+"/data/designer/table/";
           //Toggle side menu
            var b = $("#sidebar-collapse")[0];
            var w = $("#cl-wrapper");
            var s = $(".cl-sidebar");
            
            if(w.hasClass("sb-collapsed")){
              $(".fa",b).addClass("fa-angle-left").removeClass("fa-angle-right");
              w.removeClass("sb-collapsed");
              $.cookie('FLATDREAM_sidebar','open',{expires:365, path:'/'});
            }else{
              $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
              w.addClass("sb-collapsed");
              $.cookie('FLATDREAM_sidebar','closed',{expires:365, path:'/'});
            }
        };

        $scope.viewKeys=function(list){
          $scope.selectedProject=list;
          $('#keysModal').modal('show');
        };


        function integrateIntercom(){
          var user = {
              name: $cookies.userFullname,
              email: $cookies.email,
              created_at: Date.parse($cookies.createdAt),
              user_id : $cookies.userId
            };

          $intercom.boot(user);

        }

}]);

