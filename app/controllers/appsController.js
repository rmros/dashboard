'use strict';

app.controller('appsController',
  ['$scope',
   '$q',
   'projectService', 
   '$http',
   '$filter',
   '$state',
   '$rootScope',    
   '$timeout',
   'tableService',
   'beaconService',
   'userService',   
  function ($scope,
  $q,
  projectService,
  $http,
  $filter,
  $state,
  $rootScope,  
  $timeout,
  tableService,
  beaconService,
  userService) {

  $rootScope.isFullScreen=false;
  $scope.showProject=[];
  $scope.animateApp=[];
  $scope.appOptions=[];  
  $scope.newApp={
    name:null,
    appId:null
  };
  $scope.appDevSpinner=[];
  $scope.appInvitedSpinner=[];
  $scope.searchedUsers=[];
  $scope.requestInviteEmail;
  $scope.developers=[];
  $scope.invitees=[];

  $scope.openBillingPlan=false;

  /*Collapse sidebar*/           
  toggleSideBar();
  
  $scope.init=function(){
    //Hiding the Menu
    $rootScope.pageHeaderDisplay="Your Apps";
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

    projectList();
                                   
  };

  $scope.deleteAppModal=function(project, index){
      $scope.projectToBeDeleted=project;
      $scope.appIndex=index;
      $scope.projectToBeDeletedIndex=$scope.projectListObj.indexOf($scope.projectToBeDeleted);
      $scope.confirmAppName=null;
      $('#deleteappmodal').modal();

      $scope.newList=angular.copy($scope.projectListObj); 
      $scope.newList.splice($scope.projectToBeDeletedIndex,1); 
  };

  $scope.deleteProject = function(){               
      if ($scope.confirmAppName === null) { 
        $('#deleteappmodal').modal("hide");        
        WarningNotify('App name you entered was empty.');
        $scope.confirmAppName=null;   

      } else {
        if($scope.confirmAppName === $scope.projectToBeDeleted.name){

          $scope.deleteSpinner=true;

          projectService.deleteProject($scope.projectToBeDeleted.appId)
          .then(function(){
            $scope.deleteSpinner=false;            

            //project is deleted.
            $scope.projectListObj=$scope.newList;           
            //$scope.showProject[$scope.appIndex]=false;
            successNotify('The project is successfully deleted.');

            if($scope.showProject.length>0){
              for(var i=0;i<$scope.showProject.length;++i){              
                $scope.showProject[i]=false;              
              }
            }

            var editId="#edit-app"+$scope.appIndex;  
            var editBtnId="edit-app-btn"+$scope.appIndex;             
            $(editId).attr("outside-if-not",editBtnId);                         

            $scope.confirmAppName=null;
            $('#deleteappmodal').modal("hide");                            

          },function(error){
            $scope.confirmAppName=null;
            $('#deleteappmodal').modal("hide");  
            $scope.deleteSpinner=false;
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
    if(isValid && $scope.newApp.name){     

      $scope.showSaveBtn = false;       
      $timeout(function(){           
       $scope.startCreatingApp=true; 
      }, 1000);
      $scope.appValidationError=null;
      $scope.isAppCreated = false;  
      if($scope.showProject && $scope.showProject.length>0){
        for(var i=0;i<$scope.showProject.length;++i){       
          $scope.showProject[i]=false;        
        }
      } 
     
      projectService.createProject($scope.newApp.name)     
      .then(function(data){  

          $scope.startCreatingApp=false;
          $scope.creatingDefaultTables=true;

          //Add default tables
          addDefaultTables(data)
          .then(function(userdata){ 

            $scope.creatingDefaultTables=false;
            $scope.yourAppIsReady=true;            

            $timeout(function(){ 

              $scope.newApp.name="";
              $scope.newApp.appId = "";
              $scope.isAppCreated = true;          
              $scope.animateApp[0]=true;
              $scope.showSaveBtn = true;
              $scope.yourAppIsReady=false; 

              if($scope.projectListObj.length==0){
                $scope.projectListObj=[];            
              }
              $scope.projectListObj.push(data);

            }, 1600);
                       

            $timeout(function(){           
              $scope.animateApp[0]=false;

              $timeout(function(){           
               $scope.isAppCreated = false;                             
              }, 1000);
              
            }, 2000);

            //Update Beacon
            if($scope.beacon && !$scope.beacon.firstApp){
              $scope.beacon.firstApp=true;
              updateBeacon();   
            }

          },function(error){  
            $scope.creatingDefaultTables=false;          
            errorNotify('Error in creating App. Try again');
            //delete the app
            //$scope.projectListObj.splice($scope.projectListObj.indexOf(project),1);
            //projectService.deleteProject(project.appId);                
          });                         
                       
        },function(error){
          $scope.startCreatingApp=false;
          $scope.showSaveBtn = true;
          if(error.status === 400){           
            errorNotify('App ID AppName already exists. Please choose a different App ID.');
          }
          if(error.status === 500){           
            errorNotify(error.data);  
          }
           
        });
    }
  }

  $scope.editProject=function(isValid,index,appObj,newName){

      if(isValid){

        $scope.isLoading[index] = true;

        var originalAppIndex=$scope.projectListObj.indexOf(appObj);        
        projectService.editProject(appObj.appId,newName)     
        .then(function(data){
          $scope.isLoading[index] = false;
          $scope.toggleAppEdit(index);

          $scope.projectListObj[originalAppIndex]=data;           
          successNotify('The project is successfully modified.');
        },function(error){
          $scope.isLoading[index] = false;
          $scope.editprojectError=error;  
          errorNotify(error);                     
        });

      }

  };

  $scope.goToTableDesigner=function(projectObj){
    //Setting Current Project
     $rootScope.currentProject=projectObj;

     /*Collapse sidebar*/           
      //toggleSideBar();

    //Update Beacon
    if($scope.beacon && !$scope.beacon.tableDesignerLink){
      $scope.beacon.tableDesignerLink=true;
      updateBeacon();   
    }

     //Redirect to Table designer
     window.location.href="/#/"+projectObj.appId+"/table";     
  };


  $scope.addDevelopersInit=function(index,list){
    $scope.appOptions[index]=false;

    if($filter('validUser')(list)){
      $scope.selectedProject=list;
      $scope.invitees=list.invited;

      var devArray=_.pluck(list.developers, 'userId');

      var promises=[];
      promises.push(userService.getUserListByIds(devArray));      

      $q.all(promises).then(function(promiseList){ 
        var devs=promiseList[0];
        for(var i=0;i<devArray.length;++i){

          for(var j=0;j<devs.length;++j){
            if(devs[j]._id==list.developers[i].userId){
              devs[j].role=list.developers[i].role;
            } 
          }
                   
        } 

        $scope.developers=devs;        
        $('#developersModal').modal('show');                        
      },function(error){
        console.log(error);           
      });
    }   
       
  };

  $scope.removeDeveloperFromProject=function(index,requestedUser){
    $scope.removeDevIndex=index;
    $scope.removeDevUser=requestedUser;

    if(requestedUser._id==$rootScope.user._id){
      var tempDevArray=angular.copy($scope.selectedProject.developers);
      var index;
      for(var i=0;i<$scope.selectedProject.developers.length;++i){
        if($scope.selectedProject.developers[i].userId=requestedUser._id){
          index=i;
        }
      }
      if(index==0 || index>0){
        tempDevArray.splice(index,1);
      }
      if(tempDevArray.length>0){
        $scope.processRemoveDeveloper(index,requestedUser);
      }else if(tempDevArray.length==0){
        $("#removedevconform").modal();
      }      
    }else{
      $scope.processRemoveDeveloper(index,requestedUser);
    }    
   
  }; 

  $scope.processRemoveDeveloper =function(index,requestedUser) {
    $("#removedevconform").modal("hide");
    
    $scope.appDevSpinner[index]=true;
    projectService.removeDeveloperFromProject($scope.selectedProject.appId,requestedUser._id)
    .then(function(data){     

      if(requestedUser._id==$rootScope.user._id){
        var appIndex=$scope.projectListObj.indexOf($scope.selectedProject); 
        if(appIndex==0 || appIndex>0){
          $scope.projectListObj.splice(appIndex,1);
        }
      }                  

      var devIndex=$scope.developers.indexOf(requestedUser); 
      if(devIndex==0 || devIndex>0){
        $scope.developers.splice(devIndex,1);

        var userIndexInApp;
        for(var i=0;i<$scope.selectedProject.developers.length;++i){
          if($scope.selectedProject.developers[i].userId==requestedUser._id){
            userIndexInApp=i;
          }
        }
        $scope.selectedProject.developers.splice(userIndexInApp,1);
      }  

      //Find Atleast one admin
      var atleastOneAdmin=_.find($scope.selectedProject.developers, function(eachObj){ 
        if(eachObj.role=="Admin"){ 
          return;          
        }
      });

      if($scope.selectedProject.developers.length==0 || !atleastOneAdmin){
        $('#developersModal').modal('hide');
      }        
      
      $scope.removeDevIndex=null;
      $scope.removeDevUser=null;
      
      $scope.appDevSpinner[index]=false;                     
    },function(error){
      $scope.appDevSpinner[index]=false; 
      $scope.removeDevIndex=null;
      $scope.removeDevUser=null;
      errorNotify(error);                  
    });
  };

  $scope.removeUserFromInvited=function(index,requestedInvitee){
    $scope.appInvitedSpinner[index]=true;
    projectService.removeUserFromInvited($scope.selectedProject.appId,requestedInvitee)
    .then(function(data){
      if(data){                 

        var inviteeIndex=$scope.invitees.indexOf(requestedInvitee); 
        if(inviteeIndex==0 || inviteeIndex>0){
          $scope.invitees.splice(inviteeIndex,1);
        }     
        
      }  
      $scope.appInvitedSpinner[index]=false;                     
    },function(error){
      $scope.appInvitedSpinner[index]=false;                   
    });
  };  

  $scope.inviteUser=function(){ 

    if($rootScope.user.email!=$scope.requestInviteEmail){

      if(validateEmail($scope.requestInviteEmail)){

        $scope.inviteUserSpinner=true;
        projectService.inviteUser($scope.selectedProject.appId,$scope.requestInviteEmail)
        .then(function(data){
          if(data){          
            $scope.invitees.push($scope.requestInviteEmail);
          } 
          $scope.inviteUserSpinner=false; 
          $scope.requestInviteEmail=null;                         
        },function(error){
          errorNotify("Already a developer, Check User!");
          $scope.inviteUserSpinner=false;                  
        });

      }else{
        WarningNotify("Enter Valid Email!");
      }      

    }else{
      WarningNotify("Current User is already a Contributor");
    }
    
  };
 

  $scope.changeAppKeysInit=function(index,list){    
    $scope.appOptions[index]=false;

    if($filter('validUser')(list)){
      $scope.changeAppKeys=true;
      $scope.selectedProject=list;
      $('#keysModal').modal('show');
    } 
    
  };

  $scope.viewKeys=function(list){
    $scope.selectedProject=list;  
    $scope.changeAppKeys=false;

    $('#keysModal').modal('show');
  };

  $scope.changeMasterKey=function(appId){
    $scope.masterKeyChanging=true;
    projectService.changeAppMasterKey(appId)         
    .then(function(data){
      if(data){
        var index=$scope.projectListObj.indexOf($scope.selectedProject);
        $scope.selectedProject.keys.master=data;
        $scope.projectListObj[index]=$scope.selectedProject;
      }   
      $scope.masterKeyChanging=false;                        
    },function(error){
      $scope.masterKeyChanging=false; 
      errorNotify('Cannot change the master key at this point of time.');             
    });
   
  };

  $scope.changeClientKey=function(appId){
    $scope.clientKeyChanging=true;
    projectService.changeAppClientKey(appId)         
    .then(function(data){
      if(data){
        var index=$scope.projectListObj.indexOf($scope.selectedProject);
        $scope.selectedProject.keys.js=data;
        $scope.projectListObj[index]=$scope.selectedProject;
      }   
      $scope.clientKeyChanging=false;                        
    },function(error){
      $scope.clientKeyChanging=false; 
      errorNotify('Cannot change the client key at this point of time.');             
    });
   
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

  $scope.toggleAppOptions=function(index){
    for(var i=0;i<$scope.appOptions.length;++i){
      if(index!=i){
        $scope.appOptions[i]=false;
      }
    }

    if($scope.appOptions[index]){
      $scope.appOptions[index]=false;
    }else{
      $scope.appOptions[index]=true;
    }
    
  };

  $scope.toggleAppEdit=function(index){
    $scope.appOptions[index]=false;

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

  $scope.closeAppOptions=function(index){
    $scope.appOptions[index]=false;
  };

  $scope.closeEditApp=function(index){
    $scope.showProject[index]=false;
  };

  //Billing
  $scope.initUpgradePlan=function() {
    $("#upgradeModal").modal();
  };

  $scope.selectThisPlan=function(){
    $scope.openBillingPlan=false;
    WarningNotify("Thank you for your interest, paid plans are launching soon!");
  };
  $scope.toggleBillingPlan=function(){
    if($scope.openBillingPlan){
      $scope.openBillingPlan=false;
    }else{
      $scope.openBillingPlan=true;
    }
  };
  $scope.closeBillingPlan=function(){   
    $scope.openBillingPlan=false;   
  };
  //Billing

  function projectList(){
    //listing start
    projectService.projectList()         
    .then(function(data){
      $rootScope.dataLoading=false; 
      $scope.projectListObj=data;

      //getBeacon
      getBeacon();                              
    },function(error){
      $rootScope.dataLoading=false; 
      $scope.loadingError='Cannot connect to server. Please try again.';
    });
     //listing ends
  }

  function addDefaultTables(project){
    var q=$q.defer();

      CB.CloudApp.init(SERVER_URL,project.appId, project.keys.master);

      var roleTable = new CB.CloudTable("Role"); 

      tableService.saveTable(roleTable)
      .then(function(roledata){      

        var userTable = new CB.CloudTable("User");          
        return tableService.saveTable(userTable);

      }).then(function(userdata){      
        q.resolve(userdata);
      },function(error){
        q.reject(error);                       
      });

    return q.promise;
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

  //get Beacon Obj from backend
  function getBeacon(){
    beaconService.getBeacon()         
    .then(function(beaconObj){
        $scope.beacon=beaconObj; 
        //Start the beacon
        initBeacons();                           
    },function(error){      
    });
  }

  //update Beacon
  function updateBeacon(){   
    beaconService.updateBeacon($scope.beacon)         
    .then(function(beaconObj){
        //$scope.beacon=beaconObj;                            
    },function(error){      
    });
  } 

  function initBeacons(){
    var x = 0;
    addCircleToFirstApp(x);
    addCircleToCreateApp(x);
    setInterval(function () {
        if (x === 0) {
            x = 1;
        }
        addCircleToFirstApp(x);
        addCircleToCreateApp(x);
        x++;
    }, 1200);
  }

  $scope.$on('addApp', function(event, args) {
      var requestApp = args.app;
      $scope.projectListObj.push(requestApp);      
  });

  function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  }

  function addCircleToFirstApp(id) {
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
  function addCircleToCreateApp(id) {
      $('.create-app-beacon-container').append('<div  id="' + id + '" class="circlepulse create-app-beacon"></div>');

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
  

}]);

