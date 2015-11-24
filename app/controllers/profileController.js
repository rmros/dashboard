app.controller('profileController',
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
  $rootScope.page='profile';

  //Profile Specific
  $scope.editType=null; 
  $scope.editableFile=null;
  
  $scope.init= function() {  
   $rootScope.pageHeaderDisplay="edit Profile"; 
   getUserInfo();
  }; 

  $scope.initEditProfile=function(type){
    $scope.editUser=angular.copy($scope.user);
    $scope.editUser.oldPassword=null;
    $scope.editUser.newPassword=null;
    $scope.editUser.newConfirmPassword=null;

    if(type=="password"){
      $scope.editType="Change Password";
    }else if(type=="name"){
      $scope.editType="Change Name";
    }

    $("#md-changeprofile").modal();
  };

  $scope.updateUserInfo=function(){

    if($scope.editType=="Change Password"){
      if($scope.editUser.oldPassword && $scope.editUser.newPassword && ($scope.editUser.newPassword==$scope.editUser.newConfirmPassword)){
         if(!$scope.editUser.name){
          $scope.editUser.name=$scope.user.name;
         } 
         modifyUser();
      }else{
        $scope.modifyModalError="Password doesn't match or empty";   
      }
    }else if($scope.editType=="Change Name"){
      if($scope.editUser.name){
        modifyUser();
      }else{
        $scope.modifyModalError="Name shouldn't be empty";  
      }
    }
  };

  function modifyUser(){
    $scope.modifyModalError=null;
    $scope.modifySpinner=true;
    userService.updateUserInfo($scope.editUser.name,$scope.editUser.oldPassword,$scope.editUser.newPassword)
    .then(function(obj){ 
      $scope.modifySpinner=false; 
      $("#md-changeprofile").modal("hide");

      if($scope.editType=="Change Password"){        
        $rootScope.logOut();
      }else if($scope.editType=="Change Name"){
        $scope.user.name=obj.name; 
        $scope.editUser=null;        
      }     
      
    }, function(error){     
      $scope.modifySpinner=false;      
      $scope.modifyModalError=error;    
    });
  }  

  $scope.openFileModal=function(){
    if($scope.file){
      $scope.editableFile=angular.copy($scope.file);
    }else{
      $scope.editableFile=null;
    }

  	$("#md-fileviewer").modal();
  }; 

  $scope.saveFile=function(fileObj){
    $("#md-fileviewer").modal("hide");

    userService.upsertFile(fileObj)
    .then(function(obj){           
      $scope.file=obj;
      $scope.user.fileId=obj.document.id;
    }, function(error){          
      console.log(error);     
    });
  }; 

  $scope.deleteFile=function(){
    $("#md-fileviewer").modal("hide");

    if($scope.user && $scope.file){
      userService.deleteFileById($scope.file.document.id)
      .then(function(resp){           
        $scope.file=null;
        $scope.user.fileId=null;
      }, function(error){          
        console.log(error);     
      });
    }
  };

  //Private Functions
  function getUserInfo(){
    userService.getUserInfo()
    .then(function(obj){           
      $scope.user=obj.user;
      if(obj.file){
        $scope.file=obj.file;
      }else{
        $scope.file=null;
      }      
      
    }, function(error){          
      console.log(error);     
    });
  }  

}]);
