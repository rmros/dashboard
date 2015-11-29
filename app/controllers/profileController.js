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

  $scope.cardAddEditText="Add Credit Card";
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
  $scope.isCardAdded=false;

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
    $scope.loadingProfile=true; 
    userService.upsertFile(fileObj)
    .then(function(obj){ 
      if(obj && obj.document.url){
        getImgSize(obj.document.url);
        $scope.file=obj;
        $rootScope.profilePic=obj;
        $scope.user.fileId=obj.document.id;    
      }  
      
      $scope.savePicSpinner=false;     
    }, function(error){          
      errorNotify(error);    
      $scope.savePicSpinner=false;
      $scope.loadingProfile=false;  
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

  $scope.addOrEditCreditCard=function(valid){   
    if(valid){
      $scope.validCardShowSpinner=true; 
      var validation=validateCrediCardInfo();

      if(validation.isValid){

        paymentService.addOrEditCreditCard($scope.creditcardInfo)
        .then( function(data){
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

            $scope.cardAddEditText="Securely Update CreditCard";             
            $scope.isCardAdded=true; 
            successNotify("Successfully Done!");                     
          }
          $scope.validCardShowSpinner=false;                                      
         },
         function(error){                    
           errorNotify(error);
           $scope.validCardShowSpinner=false;    
        });

      }else{         
        errorNotify(validation.message);
        $scope.validCardShowSpinner=false;    
      }
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

        $scope.cardAddEditText="Securely Update Card";       
        $scope.isCardAdded=true;                                              
          
      }  
                             
     }, function(error){                                          
        errorNotify(error);
     });
  }

  function validateCrediCardInfo(){
    var validation={
      isValid:true,
      message:null
    };

    if(!Stripe.card.validateCardNumber($scope.creditcardInfo.number)){
      $scope.validCardShowSpinner=false;
      $("#credit-card").modal("hide");

      validation.isValid=false;
      validation.message='Please enter card number with no letters, spaces and special characters.';

      return validation;
    }
    if(!Stripe.card.validateExpiry($scope.creditcardInfo.exp_month, $scope.creditcardInfo.exp_year)){
      $scope.validCardShowSpinner=false;
      $("#credit-card").modal("hide");

      validation.isValid=false;
      validation.message='Please enter the correct month and year of expiry';
      
      return validation;
    } 
    
    if(!Stripe.card.validateCVC($scope.creditcardInfo.cvc)){
      $scope.validCardShowSpinner=false;
      $("#credit-card").modal("hide");

      validation.isValid=false;
      validation.message='Please enter the valid CVC.';
      
      return validation;        
    }
    if(!Stripe.card.cardType($scope.creditcardInfo.number)){
      $scope.validCardShowSpinner=false;
      $("#credit-card").modal("hide");

      validation.isValid=false;
      validation.message='The card is unknown. We accept Visa, MasterCard, American Express, Discover, Diners Club, and JCB';
      
      return validation;        
    }

    return validation;
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
