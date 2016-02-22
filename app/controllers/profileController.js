app.controller('profileController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'userService',
'paymentService',
function($scope,
$rootScope,
$stateParams,
$location,
userService,
paymentService){
  
 
  $rootScope.isFullScreen=false;
  $rootScope.page='profile';

  //Profile Specific  
  $scope.loadingProfile=false; 
  $scope.editableFile=null;
  $scope.editType=null;
  $scope.profileTabs={
    profile:true,
    billing:false
  };
  $scope.savePicSpinner=false;
  $scope.fileAllowedTypes="image/*";//Images

  $scope.showInputForEdit={
    email:false,
    name:false,
    password:false
  };
  
  $scope.init= function() {  
   $rootScope.pageHeaderDisplay="Edit Profile"; 
   getUserInfo();   
  }; 

  $scope.initEditProfile=function(type){
    $scope.editUser=angular.copy($scope.user);
    $scope.editUser.oldPassword=null;
    $scope.editUser.newPassword=null;
    $scope.editUser.newConfirmPassword=null;
    $scope.modifyModalError=null;
    $("#md-changeprofile").modal();
  };

  $scope.updateUserInfo=function(editType){

    if(editType=="Change Password"){
      if($scope.editUser.oldPassword && $scope.editUser.newPassword && ($scope.editUser.newPassword==$scope.editUser.newConfirmPassword)){
         if(!$scope.editUser.name){
          $scope.editUser.name=$scope.user.name;
         } 
         modifyUser(editType);
      }else{
        $scope.modifyModalError="Password doesn't match or empty"; 
        errorNotify("Password doesn't match or empty");   
      }
    }else if(editType=="Change Name"){
      if($scope.editUser.name){
        modifyUser(editType);
      }else{
        $scope.modifyModalError="Name shouldn't be empty"; 
        errorNotify("Name shouldn't be empty");  
      }
    }
  };
  

  function modifyUser(editType){
    $scope.modifyModalError=null;
    $scope.editType=editType;
    $scope.modifySpinner=true;
    userService.updateUserInfo($scope.editUser.name,$scope.editUser.oldPassword,$scope.editUser.newPassword)
    .then(function(obj){ 
      $scope.modifySpinner=false; 
      $("#md-changeprofile").modal("hide");

      if(editType=="Change Password"){        
        $rootScope.logOut();
      }else if(editType=="Change Name"){
        $scope.user.name=obj.name;
        $rootScope.userFullname=obj.name; 
        $scope.editUser=null;        
      }     
      successNotify("Changed Password Successfully!");  
    }, function(error){     
      $scope.modifySpinner=false;      
      errorNotify(error);  
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

    $scope.savePicSpinner=true;
   
    userService.upsertFile(fileObj)
    .then(function(obj){ 
      if(obj && obj.document.url){
        getImgSize(obj.document.url);
        $scope.file=obj;
        $rootScope.profilePic=obj;
        $scope.user.fileId=obj.document.id;    
      }      
           
    }, function(error){          
      errorNotify(error);    
      $scope.savePicSpinner=false;       
    });
  }; 

  $scope.deleteFile=function(){
    $("#md-fileviewer").modal("hide");

    $scope.savePicSpinner=true;
    if($scope.user && $scope.file){
      userService.deleteFileById($scope.file.document.id)
      .then(function(resp){           
        $scope.file=null;
        $scope.user.fileId=null;
        $rootScope.profilePic=null; 
        $scope.savePicSpinner=false; 
      }, function(error){          
        errorNotify(error); 
        $scope.savePicSpinner=false;    
      });
    }
  };  

  //Private Functions
  function getUserInfo(){
    $scope.loadingProfile=true; 
    userService.getUserInfo()
    .then(function(obj){           
      $scope.user=obj.user;
      if(obj.file){
        getImgSize(obj.file.document.url);
        $scope.file=obj.file;
        $rootScope.profilePic=obj.file; 
      }else{
        $scope.file=null;
        $scope.loadingProfile=false;
      }      
      
    }, function(error){          
      errorNotify(error);     
    });
  }  

  function getImgSize(imgSrc) {
      var newImg = new Image();

      newImg.onload = function() {
        var height = newImg.height;
        var width = newImg.width;
        
        if(width>height){
          $(".profile-photo").css({"width":"auto","height":"150px"});
          $(".profile-avatar").css({"width":"auto","height":"28px"});
        }else if(height>width){
          $(".profile-photo").css({"width":"150px","height":"auto"});
          $(".profile-avatar").css({"width":"28px","height":"auto"});
        }
        $scope.loadingProfile=false; 
        $scope.savePicSpinner=false;
        $scope.$digest();
      }

      newImg.src = imgSrc; // this must be done AFTER setting onload
  }

  $scope.toggleTabs=function(tabName){
    if(tabName=="profile"){
      $scope.profileTabs.profile=true;
      //$scope.profileTabs.billing=false;     
    }else if(tabName=="billing"){
      //$scope.profileTabs.profile=false;
      //$scope.profileTabs.billing=true;
    }
  };


}]);
