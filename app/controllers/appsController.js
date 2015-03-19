'use strict';

app.controller('appsController',['$scope', 'projectService', '$http', '$rootScope', '$cookies', '$intercom','$timeout',
  function ($scope,
  projectService,
  $http,
  $rootScope,
  $cookies,
  $intercom,
  $timeout) {

        $scope.init=function(){
              //Hiding the Menu
              $scope.isLoading = [];
              $rootScope.showMenu=false;
              $rootScope.currentProject=null;
              $scope.showSaveBtn = true;
              $scope.appKeysText={
                appId:"Copy",
                masterKey:"Copy",
                javascriptKey:"Copy"
              };

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
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Error',
                          text: 'Cannot connect to server. Please try again.',
                          class_name: 'danger'
                        });
                     }
                   );
                   //listing ends
               }).
               error(function(data, status, headers, config) {                     
                    $.gritter.add({
                        position: 'top-right',
                        title: 'Error',
                        text: 'Cannot connect to server. Please try again.',
                        class_name: 'danger'
                    });
               });
               //end of http call
        };

        $scope.deleteProject = function(project, index){

          //first confirm.
          bootbox.prompt("To delete, type in the app name.", function(result) {                
            if (result === null) { 
              $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
                  text: 'App name you entered was empty.',
                  class_name: 'danger'
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
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Success',
                          text: 'The project is successfully deleted.',
                          class_name: 'success'
                        });

                      },
                      function(error){
                        $scope.isLoading[index] = false;                        
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Error',
                          text: 'Cannot delete this project at this point in time. Please try again later.',
                          class_name: 'danger'
                        });
                         
                      });

              } else{               
                $.gritter.add({
                    position: 'top-right',
                    title: 'Error',
                    text: 'Project name doesnot match.',
                    class_name: 'danger'
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
                    
                       $.gritter.add({
                          position: 'top-right',
                          title: 'Success',
                          text: 'The project is successfully created.',
                          class_name: 'success'
                      });

                      $scope.name="";
                      $scope.appId = "";

                  },
                  function(error){
                    $scope.showSaveBtn = true;
                    if(error === 400){                   
                      $.gritter.add({
                        position: 'top-right',
                          title: 'Error',
                          text: 'App ID already exists. Please choose a different App ID.',
                          class_name: 'danger'
                      });
                    }

                    if(error === 500){                     
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Error',
                          text: 'Cannot connect to server. Please try again.',
                          class_name: 'danger'
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
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Success',
                          text: 'The project is successfully modified.',
                          class_name: 'success'
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

        $scope.copyKeys=function(keyName){
            if(keyName=="appId"){
              $scope.appKeysText.appId="Copied!";
            }
            if(keyName=="masterKey"){
              $scope.appKeysText.masterKey="Copied!";
            }
            if(keyName=="javascriptKey"){
              $scope.appKeysText.javascriptKey="Copied!";
            }
          
           $timeout(function(){ 
              $scope.appKeysText={
                appId:"Copy",
                masterKey:"Copy",
                javascriptKey:"Copy"
              };
            }, 5000);         
            
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

