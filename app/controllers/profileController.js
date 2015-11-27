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

  //credit card info
  $scope.creditcardInfo={  
    "object": "card",
    "number":null,  
    "exp_month":null,
    "exp_year":null,
    "cvc":null,
    "name":null,  
    "address_line1": null,
    "address_line2": null,
    "address_city": null,
    "address_state": null,
    "address_zip": null,
    "address_country": null   
  };

  $scope.showInputForEdit={
    email:false,
    name:false,
    password:false
  };
  
  $scope.init= function() {  
   $rootScope.pageHeaderDisplay="Edit Profile"; 
   getUserInfo();
   getCrediCardInfo();
  }; 

  $scope.initEditProfile=function(type){
    $scope.editUser=angular.copy($scope.user);
    $scope.editUser.oldPassword=null;
    $scope.editUser.newPassword=null;
    $scope.editUser.newConfirmPassword=null;
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
      }
    }else if(editType=="Change Name"){
      if($scope.editUser.name){
        modifyUser(editType);
      }else{
        $scope.modifyModalError="Name shouldn't be empty";  
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
      getImgSize(obj.document.url);        
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
    $scope.loadingProfile=true; 
    userService.getUserInfo()
    .then(function(obj){           
      $scope.user=obj.user;
      if(obj.file){
        getImgSize(obj.file.document.url);
        $scope.file=obj.file;
      }else{
        $scope.file=null;
      }      
      
    }, function(error){          
      console.log(error);     
    });
  }  

  function getImgSize(imgSrc) {
      var newImg = new Image();

      newImg.onload = function() {
        var height = newImg.height;
        var width = newImg.width;
        
        if(width>height){
          $(".profile-photo").css({"width":"auto","height":"150px"});
        }else if(height>width){
          $(".profile-photo").css({"width":"150px","height":"auto"});
        }
        $scope.loadingProfile=false; 
        $scope.$digest();
      }

      newImg.src = imgSrc; // this must be done AFTER setting onload
  }

  $scope.toggleTabs=function(tabName){
    if(tabName=="profile"){
      $scope.profileTabs.profile=true;
      $scope.profileTabs.billing=false;     
    }else if(tabName=="billing"){
      $scope.profileTabs.profile=false;
      $scope.profileTabs.billing=true;
    }
  };

  function getCrediCardInfo(){

    paymentService.getCrediCardInfo()
    .then(function(data){
      if(data){                 
        
        var number="************"+data.stripeCardObject.last4;

        $scope.creditcardInfo.number=number;
        $scope.creditcardInfo.cvc="###";
        $scope.creditcardInfo.name=data.stripeCardObject.name;

        $scope.creditcardInfo.exp_month=data.stripeCardObject.exp_month;
        $scope.creditcardInfo.exp_year=data.stripeCardObject.exp_year;   

        $scope.creditcardInfo.address_line1=data.stripeCardObject.address_line1;
        $scope.creditcardInfo.address_line2=data.stripeCardObject.address_line2;

        $scope.creditcardInfo.address_city=data.stripeCardObject.address_city;
        $scope.creditcardInfo.address_state=data.stripeCardObject.address_state;
        $scope.creditcardInfo.address_zip=data.stripeCardObject.address_zip;
        $scope.creditcardInfo.address_country=data.stripeCardObject.address_country;                                
          
      }  
                             
     }, function(error){                                          
        
     });
  }

}]);
