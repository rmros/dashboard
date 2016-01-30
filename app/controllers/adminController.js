app.controller('adminController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'userService',
'serverSettingsService',
function($scope,
$rootScope,
$stateParams,
$location,
userService,
serverSettingsService){  
 
  $rootScope.isFullScreen=false;
  $rootScope.page='admin';  

  //Users Page Specific
  $scope.newUser={
    name:null,
    email:null,
    password:null,
    isAdmin:false
  };
  $scope.addUserSpinner=false;

  $scope.usersList=[];
  $scope.skip=0;
  $scope.limit=15;
  $scope.loadingUsers=false;
  $scope.updatingUser=[];
  $scope.newlyAddedUserIds=[];
 
  $scope.init= function() {  
    $rootScope.pageHeaderDisplay="Admin Dashboard";
    getUserBySkipLimit($scope.skip,$scope.limit); 
    getServerSettings(); 
  }; 

  $scope.addUser=function(){
    if($scope.newUser.name && $scope.newUser.email && $scope.newUser.password){
      $scope.addUserSpinner=true;    
      
      userService.signUp($scope.newUser.name,$scope.newUser.email,$scope.newUser.password,$scope.newUser.isAdmin)             
      .then(function(data){        
        return userService.getUserByIdByAdmin($scope.newUser.email);      
      }).then(function(addedUser){
        $scope.addUserSpinner=false; 
        $scope.newUser={
          name:null,
          email:null,
          password:null,
          isAdmin:false
        };
        
        if(addedUser){
          $scope.newlyAddedUserIds.push(addedUser._id);
          $scope.usersList.unshift(addedUser);
        }
        
      },function(error){
        $scope.addUserSpinner=false;
        errorNotify(error);
      });      
    }
  };


  $scope.updateUserActive=function(userId,isActive,index){
    if($rootScope.user._id!=userId){
      var activate;
      if(isActive){
        activate=false;
      }else if(!isActive){
        activate=true;
      }

      $scope.updatingUser[index]=true; 
      userService.updateUserActive(userId,activate)
      .then(function(user){       
         $scope.updatingUser[index]=false;  
      },function(error){
        errorNotify(error);
        $scope.updatingUser[index]=false;               
      });

    }else{
      errorNotify("You can't perfom this action on yourself!");
      isActive=isActive;
    }
    
  };

  $scope.updateUserRole=function(userId,isAdmin,index){
    if($rootScope.user._id!=userId){
      if(isAdmin=="true"){
        isAdmin=true;
      }else{
        isAdmin=false;
      }

      $scope.updatingUser[index]=true; 
      userService.updateUserRole(userId,isAdmin)
      .then(function(user){       
        $scope.updatingUser[index]=false;  
      },function(error){
        errorNotify(error);
        $scope.updatingUser[index]=false;

        if(isAdmin==true){
          $scope.usersList[index].isAdmin="false";
        }else{
          $scope.usersList[index].isAdmin="true";
        }

      });
    }else{
      errorNotify("You can't perfom this action on yourself!");
    }
  };

   $scope.deleteUser=function(userId,index){    
    if($rootScope.user._id!=userId){
      $scope.updatingUser[index]=true; 
      userService.deleteUser(userId)
      .then(function(resp){ 
        $scope.usersList.splice(index,1);      
        $scope.updatingUser[index]=false;  
      },function(error){
        errorNotify(error);
        $scope.updatingUser[index]=false;               
      });
    }else{
      errorNotify("You can't perfom this action on yourself!");
    }
  };

  $scope.loadMoreUsers=function(){    
    $scope.loadingUsers=true;
    userService.getUserBySkipLimit($scope.limit,10,$scope.newlyAddedUserIds)
    .then(function(userList){ 
      if(userList && userList.length>0){
        $scope.limit=$scope.limit+userList.length;

        if($scope.usersList.length>0){
          $scope.usersList = $scope.usersList.concat(userList);           
        }else{
          $scope.usersList=userList;
        }        
      }  
      $scope.loadingUsers=false;   
    },function(error){
      errorNotify("Cannot Load more records..");
      $scope.loadingUsers=false;              
    });
  };

  $scope.toggleAllowSignUp=function(){
    serverSettingsService.updateServerSettings($scope.serverSettings._id,$scope.serverSettings.allowSignUp)
    .then(function(serverSettings){ 
      $scope.serverSettings=serverSettings;         
    },function(error){   
      errorNotify(error);                  
    });
  };

  $scope.upsertAPI_URL=function() {
    $scope.upsertAPISpinner=true;    
    serverSettingsService.upsertAPI_URL($scope.serverSettings.myURL)
    .then(function(serverSettings){ 
      $scope.upsertAPISpinner=false;        
    },function(error){   
      $scope.upsertAPISpinner=false;
      errorNotify(error);                  
    });
  };

  /********Private Functions**************/
  function getUserBySkipLimit(skip,limit){
    $scope.loadList=true;    
    userService.getUserBySkipLimit(skip,limit,$scope.newlyAddedUserIds)
    .then(function(userList){ 
      if(userList && userList.length>0){
        $scope.usersList=userList;
      } 
      $scope.loadList=false;         
    },function(error){
      $scope.loadList=false;  
      $scope.loadUsersError=error;                 
    });
  }

  function getServerSettings(){
       
    serverSettingsService.getServerSettings()
    .then(function(serverSettings){ 
      $scope.serverSettings=serverSettings;         
    },function(error){   
      errorNotify(error);                  
    });
  }
 
}]);
