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
   'paymentService', 
   'analyticsService',  
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
  userService,
  paymentService,
  analyticsService) {

  $rootScope.showAppPanel=false;  
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

  //App Usages
  $scope.apiCallsUsed=[];
  $scope.storageUsed=[];

  $scope.apiCallsLoading={};  
  $scope.apiCallsError={};

  $scope.storageLoading={};
  $scope.storageError={};
  //App Usages

  $scope.openBillingPlan=false;
  $scope.cardDetailsStep1=true;
  $scope.cardDetailsStep2=false;

  $scope.cardDetails={    
    number:null,
    expMonth:null,
    expYear:null,
    cvc:null,
    billing:{
      name:null,
      addrLine1:null,
      addrLine2:null,
      city:null,
      state:null,
      zipCode:null,
      country:null
    }
  };

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
    $scope.pricingPlans=pricingPlans; 
    $scope.cardCountries=paymentCountries;    
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
          .then(function(promiseList){ 

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

              //Get Usage Details
              $scope.loadApiCountByAppId(data);
              $scope.loadStorageCountByAppId(data);

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
            $scope.showSaveBtn = true;
            $scope.startCreatingApp=false;
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
            errorNotify("Something went wrong..Try again.");  
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
        errorNotify("Something went wrong to add developer!");          
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
      $scope.confirmAppName=$scope.selectedProject.name;
      $scope.processRemoveDeveloper(index,requestedUser);
    }   
  }; 

  $scope.processRemoveDeveloper =function(index,requestedUser) {
    if($scope.confirmAppName==$scope.selectedProject.name){    
      $("#removedevconform").modal("hide");
      
      $scope.appDevSpinner[index]=true;
      projectService.removeDeveloperFromProject($scope.selectedProject.appId,requestedUser._id)
      .then(function(data){     
        $scope.confirmAppName=null;
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
        $scope.confirmAppName=null;
        $scope.appDevSpinner[index]=false; 
        $scope.removeDevIndex=null;
        $scope.removeDevUser=null;
        errorNotify(error);                  
      });

    }else{
      warningNotify("confirm App Name doesn't match.");
    }
  };

  $scope.removeUserFromInvited=function(index,requestedInvitee){
    $scope.appInvitedSpinner[index]=true;
    projectService.removeUserFromInvited($scope.selectedProject.appId,requestedInvitee)
    .then(function(data){
      if(data){
       
        if($scope.invitees && $scope.invitees.length>0){
          for(var i=0;i<$scope.invitees.length;++i){
            if($scope.invitees[i].email==requestedInvitee){              
              $scope.invitees.splice(i,1);
            }
          }
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
            $scope.invitees.push({email:$scope.requestInviteEmail});
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
  $scope.initUpgradePlan=function(projectObj) {
    if($rootScope.isHosted){

      $("#upgradeModal").modal();
      $scope.upgradePlanApp=projectObj;

      $scope.cardDetailsStep1=true;
      $scope.cardDetailsStep2=false;
      $scope.cardAlreadyFreePlan=false;
      $scope.cardNeedFreePlan=false;

      //Show Next Plan
      if(projectObj.planId && projectObj.planId>1 && projectObj.planId<6){
        $scope.requestedPlan=getPlanById(projectObj.planId+1);
      }else if(projectObj.planId==6){
        $scope.requestedPlan=getPlanById(6);
      }else if(!projectObj.planId || projectObj.planId==1){
        $scope.requestedPlan=getPlanById(3);
      }
      
      if(!__isDevelopment){
        /****Tracking*********/              
         mixpanel.track('Upgrade Plan', {"App id": projectObj.appId,"App Name": projectObj.name});
        /****End of Tracking*****/
      }
    }
  
  };

  $scope.nextToBillingDetails=function(){
    var msg=validateCardMainDetails($scope.cardDetails)
    if(!msg){
      $scope.cardDetailsStep1=false;
      $scope.cardDetailsStep2=true;
      $scope.cardAlreadyFreePlan=false;
      $scope.cardNeedFreePlan=false;
    }else{
     WarningNotify(msg);
    }    
  };

  $scope.prevToCardDetails=function(){
    $scope.cardDetailsStep1=true;
    $scope.cardDetailsStep2=false;
    $scope.cardAlreadyFreePlan=false;
    $scope.cardNeedFreePlan=false;
  };

  $scope.addCard=function(){
    var errorMsg=validateBillingDetails($scope.cardDetails);

    if(!errorMsg){
      $scope.addCardSpinner=true;
      paymentService.createSale($scope.upgradePlanApp.appId,$scope.cardDetails,$scope.requestedPlan.id)
      .then(function(data){
        var index=$scope.projectListObj.indexOf($scope.upgradePlanApp);
        $scope.projectListObj[index].planId=data.data.planId;

        $scope.cardDetails={    
          number:null,
          expMonth:null,
          expYear:null,
          cvc:null,
          billing:{
            name:null,
            addrLine1:null,
            addrLine2:null,
            city:null,
            state:null,
            zipCode:null,
            country:null
          }
        };

        $scope.addCardSpinner=false;
        $("#upgradeModal").modal("hide");
        $scope.prevToCardDetails();
        $scope.requestedPlan=null;
        successNotify("Successfully you upgraded the Plan!");

        //Get Usage Details
        $scope.loadApiCountByAppId($scope.projectListObj[index]);
        $scope.loadStorageCountByAppId($scope.projectListObj[index]);

      },function(error){
        $scope.addCardSpinner=false;
        errorNotify(error);
      });

      if(!__isDevelopment){
        /****Tracking*********/              
         mixpanel.track('Purchase Plan Btn', {"App id": $scope.upgradePlanApp.appId});
        /****End of Tracking*****/
      }

    }else{
      WarningNotify(errorMsg);
    }    

  };

  $scope.confirmCancelRecurring=function(){
    $scope.showConfirmCancelRecurring=true;
  };

  $scope.cancelRecurring=function(){
    $scope.cancelRecurringSpinner=true;
    paymentService.cancelRecurring($scope.upgradePlanApp.appId)         
    .then(function(data){
        var index=$scope.projectListObj.indexOf($scope.upgradePlanApp);
        $scope.projectListObj[index].planId=1;
        $scope.cancelRecurringSpinner=false; 

        $("#upgradeModal").modal("hide"); 
        successNotify("Successfully cancelled!");
        $scope.showConfirmCancelRecurring=false;

        $scope.cardDetailsStep1=true;
        $scope.cardDetailsStep2=false;
        $scope.cardAlreadyFreePlan=false;
        $scope.cardNeedFreePlan=false;

        //Get Usage Details
        $scope.loadApiCountByAppId($scope.projectListObj[index]);
        $scope.loadStorageCountByAppId($scope.projectListObj[index]);

    },function(error){
      $scope.cancelRecurringSpinner=false; 
      $scope.showConfirmCancelRecurring=false; 
      errorNotify("Unable to cancel at this time.");
    });    
  };

  $scope.selectThisPlan=function(selctedPlan){
    $scope.openBillingPlan=false;
    $scope.requestedPlan=selctedPlan;  

    if(selctedPlan.id==1 && (!$scope.upgradePlanApp.planId || $scope.upgradePlanApp.planId==1)){
      $scope.cardDetailsStep1=false;
      $scope.cardDetailsStep2=false;
      $scope.cardAlreadyFreePlan=true;
      $scope.cardNeedFreePlan=false;
    }else if(selctedPlan.id==1 && $scope.upgradePlanApp.planId>1){
      $scope.cardDetailsStep1=false;
      $scope.cardDetailsStep2=false;
      $scope.cardAlreadyFreePlan=false;
      $scope.cardNeedFreePlan=true;
    }else{
      $scope.cardDetailsStep1=true;
      $scope.cardDetailsStep2=false;
      $scope.cardAlreadyFreePlan=false;
      $scope.cardNeedFreePlan=false;
    }    

    if(!__isDevelopment){
      /****Tracking*********/              
       mixpanel.track('Selected Plan', {"App id": $scope.upgradePlanApp.appId,"Plan Name": selctedPlan.label});
      /****End of Tracking*****/
    }
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

      if($scope.projectListObj && $scope.projectListObj.length>0){
        var appIdArray=_.pluck($scope.projectListObj, 'appId');
        getAppUsageDetails(appIdArray);
      }      

      //getBeacon
      getBeacon();                              
    },function(error){
      $rootScope.dataLoading=false; 
      $scope.loadingError='Cannot connect to server. Please try again.';
    });
    //listing ends
  }

  function getAppUsageDetails(appIdArray){
    //Load and errors
    for(var i=0;i<appIdArray.length;++i){
      $scope.apiCallsError[appIdArray[i]]=false; 
      $scope.apiCallsLoading[appIdArray[i]]=true;

      $scope.storageError[appIdArray[i]]=false; 
      $scope.storageLoading[appIdArray[i]]=true;
    }

    analyticsService.bulkApiStorageDetails(appIdArray).then(function(list){

      //For API
      for(var i=0;i<list.api.length;++i){

          var percentageObj=calculatePercentage(list.api[i],"api");
          var alreadyInserted=null;

          if($scope.apiCallsUsed && $scope.apiCallsUsed.length>0){
            alreadyInserted=_.first(_.where($scope.apiCallsUsed, {appId: list.api[i].appId}));
          }
          
          if(alreadyInserted){
            var matchedIndex=null;
            for(var i=0;i<$scope.apiCallsUsed.length;++i){
                if($scope.apiCallsUsed[i].appId==list.api[i].appId){
                  matchedIndex=i;
                  break;                      
                }
            }
            if(matchedIndex==0 || matchedIndex>0){
              $scope.apiCallsUsed[matchedIndex]=percentageObj;
            }
            
          }else{
            $scope.apiCallsUsed.push(percentageObj);
          }

          $scope.apiCallsLoading[list.api[i].appId]=false;
      }

      //For Storage
      for(var i=0;i<list.storage.length;++i){

          var percentageObj=calculatePercentage(list.storage[i],"storage");
          var alreadyInserted=null;

          if($scope.storageUsed && $scope.storageUsed.length>0){
            alreadyInserted=_.first(_.where($scope.storageUsed, {appId: list.storage[i].appId}));
          }
          
          if(alreadyInserted){
            var matchedIndex=null;
            for(var i=0;i<$scope.storageUsed.length;++i){
                if($scope.storageUsed[i].appId==list.storage[i].appId){
                  matchedIndex=i;
                  break;
                }
            }
            if(matchedIndex==0 || matchedIndex>0){
              $scope.storageUsed[matchedIndex]=percentageObj;
            }
          }else{
            $scope.storageUsed.push(percentageObj);
          } 

          $scope.storageLoading[list.storage[i].appId]=false;
      }  

    },function(error){
      //Load and errors
      for(var i=0;i<appIdArray.length;++i){
        $scope.apiCallsError[appIdArray[i]]=true; 
        $scope.apiCallsLoading[appIdArray[i]]=false;

        $scope.storageError[appIdArray[i]]=true; 
        $scope.storageLoading[appIdArray[i]]=false;
      }
    });     
  }


  $scope.loadApiCountByAppId=function(appObj){
    $scope.apiCallsError[appObj.appId]=false; 
    $scope.apiCallsLoading[appObj.appId]=true;

    analyticsService.apiCount(appObj.appId).then(function(respObj){

        var percentageObj=calculatePercentage(respObj,"api");
        var alreadyInserted=null;

        if($scope.apiCallsUsed && $scope.apiCallsUsed.length>0){
          alreadyInserted=_.first(_.where($scope.apiCallsUsed, {appId: respObj.appId}));
        }
        
        if(alreadyInserted){
          var matchedIndex=null;
          for(var i=0;i<$scope.apiCallsUsed.length;++i){
              if($scope.apiCallsUsed[i].appId==respObj.appId){
                matchedIndex=i;
                break;
              }
          }
          if(matchedIndex==0 || matchedIndex>0){
            $scope.apiCallsUsed[matchedIndex]=percentageObj;
          }
        }else{
          $scope.apiCallsUsed.push(percentageObj);
        }
        
        $scope.apiCallsLoading[respObj.appId]=false;
    },function(error){ 
        $scope.apiCallsLoading[error.appId]=false;
        $scope.apiCallsError[error.appId]=true;             
    });
  };

  $scope.loadStorageCountByAppId=function(appObj){
     $scope.storageError[appObj.appId]=false; 
     $scope.storageLoading[appObj.appId]=true;
     analyticsService.storageCount(appObj.appId).then(function(respObj){

        var percentageObj=calculatePercentage(respObj,"storage");
        var alreadyInserted=null;

        if($scope.storageUsed && $scope.storageUsed.length>0){
          alreadyInserted=_.first(_.where($scope.storageUsed, {appId: respObj.appId}));
        }
        
        if(alreadyInserted){
          var matchedIndex=null;
          for(var i=0;i<$scope.storageUsed.length;++i){
              if($scope.storageUsed[i].appId==respObj.appId){
                matchedIndex=i;
                break;
              }
          }
          if(matchedIndex==0 || matchedIndex>0){
            $scope.storageUsed[matchedIndex]=percentageObj;
          }
        }else{
          $scope.storageUsed.push(percentageObj);
        }        

        $scope.storageLoading[respObj.appId]=false;
     },function(error){
        $scope.storageLoading[error.appId]=false;
        $scope.storageError[error.appId]=true;              
     });
  };

  function calculatePercentage(respObj,featureName){
    var appPlan=null;
    var app=_.first(_.where($scope.projectListObj, {appId: respObj.appId}));
    if(!app.planId || app.planId==1){
      appPlan=1;
    }else if(app.planId){
      appPlan=app.planId;
    }

    var appPlan=_.first(_.where($scope.pricingPlans, {id: appPlan}));
    var databaseUsage=_.first(_.where(appPlan.usage, {category: "DATABASE"}));

    var planApiLimit=_.first(_.where(databaseUsage.features, {name: "API Calls"}));
    var apiLimit=planApiLimit.limit.value;
    var apiLabel=planApiLimit.limit.label;
    var apiColor="#4aa3df";

    var planStorageLimit=_.first(_.where(databaseUsage.features, {name: "Storage"})); 
    var storageLimit=planStorageLimit.limit.value; 
    var storageLabel=planStorageLimit.limit.label;
    var storageColor="#4aa3df";  
    

    if(featureName=="api" && respObj && respObj.monthlyApiCount){
      var used=respObj.monthlyApiCount;      
      var percentageUsed=used*(100/apiLimit);
              
      if(percentageUsed>0 && percentageUsed<1){
        percentageUsed=1;
      }      
      if(percentageUsed>100){
        percentageUsed=100;
      }      
      if(percentageUsed>80){
        apiColor="#C90606";
      }

      percentageUsed=Math.floor(percentageUsed);
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalCount:respObj.monthlyApiCount,
        limit:apiLabel,
        color:apiColor
      };
    }else if(featureName=="api"){
      var percentageUsed=0;
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalCount:0,
        limit:apiLabel,
        color:apiColor
      };
    }

    if(featureName=="storage" && respObj && respObj.size){
      var used=(respObj.size/1000);//Convert to GBs
      var limit=storageLimit;//(already in GBs)
      var percentageUsed=used*(100/limit);      
      if(percentageUsed>0 && percentageUsed<1){
        percentageUsed=1;
      }
      if(percentageUsed>100){
        percentageUsed=100;
      }
      if(percentageUsed>80){
        storageColor="#C90606";
      }
      percentageUsed=Math.floor(percentageUsed);
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalSize:used,
        limit:storageLabel,
        color:storageColor
      };
    }else if(featureName=="storage"){
      var percentageUsed=0;
      var resp={
        appId:respObj.appId,
        percentage:percentageUsed+"%",
        originalSize:0,
        limit:storageLabel,
        color:storageColor
      };
    }    
    
    return resp;
  }

  function getPlanById(planId){
    return _.first(_.where(pricingPlans, {id: planId}));
  }

  function addDefaultTables(project){
    var q=$q.defer();

      $rootScope.currentProject=project;

      CB.CloudApp.init(SERVER_URL,project.appId, project.keys.master);

      var roleTable = new CB.CloudTable("Role");

      tableService.saveTable(roleTable)
      .then(function(roledata){      

        var promises=[];

        var userTable = new CB.CloudTable("User");          
        promises.push(tableService.saveTable(userTable));

        var deviceTable = new CB.CloudTable("Device");          
        promises.push(tableService.saveTable(deviceTable));

        $q.all(promises).then(function(promiseList){
          q.resolve(promiseList);
          $rootScope.currentProject=null;
        },function(error){
          q.reject(error); 
          $rootScope.currentProject=null; 
        });
      
      },function(error){
        q.reject(error); 
        $rootScope.currentProject=null;                      
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

  function validateCardMainDetails(cardDetails){
    var errorMsg=null;
    if(!cardDetails.billing.name){
      return "Card holder's name is required";
    }
    if(cardDetails.billing.name && cardDetails.billing.name.length==129){
      return "Card holder's name shoudn't exceed 128 Chars";
    }

    if(!cardDetails.number || cardDetails.number.length!=16){
      return "Invalid Card";
    }

    var cardNumber=parseInt(cardDetails.number);
    if(isNaN(cardNumber)){
      return "Invalid Card, Only 16 digits allowed";
    }

    if(!cardDetails.expMonth || cardDetails.expMonth=="0" ||  cardDetails.expMonth.length>2){
      return "Invalid Exp Month";
    }

    if(!cardDetails.expYear || cardDetails.expYear=="0" ||  cardDetails.expYear.length>4){
      return "Invalid Exp Year";
    }

    if(!cardDetails.cvc || cardDetails.cvc.length!=3){
      return "Invalid CVC";
    }
    
    var cardCVC=parseInt(cardDetails.cvc);
    if(isNaN(cardCVC)){
      return "Invalid CVC, Only 3 digits allowed";
    }

    return errorMsg;
  }

  function validateBillingDetails(cardDetails){
    var errorMsg=null;
    if(!cardDetails.billing.addrLine1){
      return "Address1 cannot be null";
    }

    if(cardDetails.billing.addrLine1 && cardDetails.billing.addrLine1.length>64){
      return "Address1 should not exceed 64 Chars";
    }

    if(!cardDetails.billing.city){
      return "City cannot be null";
    }

    if(cardDetails.billing.city && cardDetails.billing.city.length>64){
      return "City should not exceed 64 Chars";
    }

    if(!cardDetails.billing.state && cardDetails.billing.country && fieldsRequiredForCountries(cardDetails.billing.country)){
      return "State cannot be null for selected country";
    }

    if(cardDetails.billing.state && cardDetails.billing.state.length>64){
      return "State should not exceed 64 Chars";
    }

    if(!cardDetails.billing.zipCode && cardDetails.billing.country && fieldsRequiredForCountries(cardDetails.billing.country)){
      return "Zipcode cannot be null for selected country";
    }

    if(cardDetails.billing.zipCode && cardDetails.billing.zipCode.length>16){
      return "Zipcode should not exceed 16 Chars";
    }

    if(!cardDetails.billing.country || cardDetails.billing.country=="0"){
      return "Country cannot be null";
    }

    if(cardDetails.billing.country && cardDetails.billing.country.length>64){
      return "Country should not exceed 64 Chars";
    }

    if(!cardDetails.billing.addrLine2 && cardDetails.billing.country && (cardDetails.billing.country=="CHN" || cardDetails.billing.country=="JPN" || cardDetails.billing.country=="RUS")){
      return "Address2 cannot be null for selected country.";
    }
  }

  function fieldsRequiredForCountries(country){
    country=country.trim();
    if(country=="ARG" || country== "AUS" || country== "BGR" || country== "CAN" || country== "CHN" || country== "CYP" || country== "EGY" || country== "FRA" || country== "IND" || country== "IDN" || country== "ITA" || country== "JPN" || country== "MYS" || country==
     "MEX" || country== "NLD" || country== "PAN" || country== "PHL" || country== "POL" || country== "ROU" || country== "RUS" || country== "SRB" || country== "SGP" || country== "ZAF" || country== "ESP" || country== "SWE" || country== "THA" || country== "TUR" || country== "GBR" || country== "USA"){
      return true;
    }
    return false;
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
      //Get Usage Details
      $scope.loadApiCountByAppId(requestApp);
      $scope.loadStorageCountByAppId(requestApp);      
  });

  $scope.$on('openUpgradeModal', function(event, args) {
    var requestAppId = args.appId;
    var appObj=_.first(_.where($scope.projectListObj, {appId: requestAppId}));
    $scope.initUpgradePlan(appObj);            
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

