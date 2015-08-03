'use strict';

app.controller('appsController',
  ['$scope', 'projectService', '$http', '$rootScope', '$cookies', '$intercom','$timeout',
  function ($scope,
  projectService,
  $http,
  $rootScope,
  $cookies,
  $intercom,
  $timeout) {

  $rootScope.isFullScreen=false;
  $scope.showProject=[];
  $scope.newApp={
    name:null,
    appId:null
  };
  
  $scope.init=function(){
        //Hiding the Menu
        $rootScope.page='apps';
        $scope.isLoading = [];
        $rootScope.dataLoading=true;
        $rootScope.showMenu=false;
        $rootScope.currentProject=null;
        $scope.showSaveBtn = true;
        $scope.appKeysText={
          appId:"Copy",
          masterKey:"Copy",
          javascriptKey:"Copy"
        }; 

        // Intercom integration   
        integrateIntercom();
        //listing start
        var listPromise=projectService.projectList();
          listPromise
          .then(function(data){
               $rootScope.dataLoading=false; 
               $scope.projectListObj=data;                    
          },function(error){
              $rootScope.dataLoading=false; 
              errorNotify('Cannot connect to server. Please try again.');
          });
         //listing ends

        //Start the beacon
        var x = 0;
        addCircle(x);
        setInterval(function () {
            if (x === 0) {
                x = 1;
            }
            addCircle(x);
            x++;
        }, 1200);             
  };

  $scope.deleteAppModal=function(project, index){
      $scope.projectToBeDeleted=project;
      $scope.projectToBeDeletedIndex=index;
      $scope.confirmAppName=null;
      $('#deleteappmodal').modal();
  };

  $scope.deleteProject = function(){               
      if ($scope.confirmAppName === null) { 
        $('#deleteappmodal').modal("hide");        
        WarningNotify('App name you entered was empty.');
        $scope.confirmAppName=null;   

      } else {
        if($scope.confirmAppName === $scope.projectToBeDeleted.name){

          $scope.isLoading[$scope.projectToBeDeletedIndex] = true;

           var promise=projectService.deleteProject($scope.projectToBeDeleted.appId);
              promise.then(
                function(){
                  $scope.isLoading[$scope.projectToBeDeletedIndex] = false;
                  $scope.confirmAppName=null;
                  $('#deleteappmodal').modal("hide");  
                  //project is deleted.
                  $scope.projectListObj.splice($scope.projectListObj.indexOf($scope.projectToBeDeleted),1);
                  successNotify('The project is successfully deleted.');                

                },
                function(error){
                  $scope.confirmAppName=null;
                  $('#deleteappmodal').modal("hide");  
                  $scope.isLoading[$scope.projectToBeDeletedIndex] = false; 
                  errorNotify('Cannot delete this project at this point in time. Please try again later.');
                   
                });

        } else{  
          $scope.confirmAppName=null;
          $('#deleteappmodal').modal("hide"); 
          WarningNotify('App name doesnot match.');                  
        }                      
      }        
  };

  $scope.createProject=function(isValid){        
        $scope.appValidationError=null;
        if(isValid){
          $scope.showSaveBtn = false;               
          $scope.appValidationError=null;

          var createProjectPromise=projectService.createProject($scope.newApp.name, $scope.newApp.appId);
          createProjectPromise
          .then(function(data){
              $scope.showSaveBtn = true;
              if($scope.projectListObj.length>0){
                $scope.projectListObj.push(data);
              }else{
                $scope.projectListObj=[];
                $scope.projectListObj.push(data);
              }
              
              successNotify('The project is successfully created.');           

              $scope.newApp.name="";
              $scope.newApp.appId = "";

                           
            },function(error){
              $scope.showSaveBtn = true;
              if(error === 400){           
                errorNotify('App ID already exists. Please choose a different App ID.');
              }

              if(error === 500){           
                errorNotify('Cannot connect to server. Please try again.');  
              }
               
            });
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
                successNotify('The project is successfully modified.');
              },
              function(error){
                $scope.isLoading[index] = false;
                $scope.editprojectError=error;  
                errorNotify(error);                     
              }
            );

      }

  };

  $scope.goToTableDesigner=function(projectObj){
    //Setting Current Project
     $rootScope.currentProject=projectObj;

     /*Collapse sidebar*/           
      toggleSideBar();

     //Redirect to Table designer
     window.location.href="/#/"+projectObj.appId+"/data/designer/table/";
     
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

  $scope.toggleAppEdit=function(index){
    for(var i=0;i<$scope.showProject.length;++i){
      if(index!=i){
        $scope.showProject[i]=false;
      }
    }

    if($scope.showProject[index]==true){
      $scope.showProject[index]=false;
    }else if(!$scope.showProject[index] || $scope.showProject[index]==false){
      $scope.showProject[index]=true;
    }    
  };    

  function integrateIntercom(){
    var user = {
        name: $.cookie('userFullname'),
        email: $.cookie('email'),
        created_at: Date.parse($.cookie('createdAt')),
        user_id : $.cookie('userId')
      };

    $intercom.boot(user);

  }

  function toggleSideBar(_this){
    var b = $("#sidebar-collapse")[0];
    var w = $("#cl-wrapper");
    var s = $(".cl-sidebar");
   
    $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
    w.addClass("sb-collapsed");
    $.cookie('FLATDREAM_sidebar','closed',{expires:365, path:'/'});         
    //updateHeight();
  } 

  function addCircle(id) {
      $('.first-app-beacon-container').append('<div  id="' + id + '" class="circlepulse first-app-beacon"></div>');

      $('#' + id).animate({
          'width': '50px',
          'height': '50px',
          'margin-top': '-20px',
          'margin-left': '-20px',
          'opacity': '0'
      }, 4000, 'easeOutCirc');

      setInterval(function () {
          $('#' + id).remove();
      }, 4000);
  }

//Notification

function errorNotify(errorMsg){
  $.amaran({
      'theme'     :'colorful',
      'content'   :{
         bgcolor:'#EE364E',
         color:'#fff',
         message:errorMsg
      },
      'position'  :'top right'
  });
}

function successNotify(successMsg){
  $.amaran({
      'theme'     :'colorful',
      'content'   :{
         bgcolor:'#149600',
         color:'#fff',
         message:successMsg
      },
      'position'  :'top right'
  });
}

function WarningNotify(WarningMsg){
  $.amaran({
      'theme'     :'colorful',
      'content'   :{
         bgcolor:'#EAC004',
         color:'#fff',
         message:WarningMsg
      },
      'position'  :'top right'
  });
}    
  

}]);

