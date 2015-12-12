app.controller('usersController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'userService',
function($scope,
$rootScope,
$stateParams,
$location,
userService){  
 
  $rootScope.isFullScreen=false;
  $rootScope.page='users';  

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
 
  $scope.init= function() {  
    $rootScope.pageHeaderDisplay="Manage Users";
    getUserBySkipLimit($scope.skip,$scope.limit);  
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
    userService.getUserBySkipLimit($scope.limit,$scope.limit+10)
    .then(function(userList){ 
      if(userList.length>0){

        if($scope.usersList.length>0){
          $scope.usersList = $scope.usersList.concat(userList);           
        }else{
          $scope.usersList=userList;
        }
        
      }  
      $scope.loadingUsers=false;   
    },function(error){
      errorNotify(error);
      $scope.loadingUsers=false;              
    });
  };

  /********Private Functions**************/
  function getUserBySkipLimit(skip,limit){
    userService.getUserBySkipLimit(skip,limit)
    .then(function(userList){ 
      if(userList.length>0){
        $scope.usersList=userList;
      }          
    },function(error){
      errorNotify(error);                 
    });
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
           bgcolor:'#19B698',
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
