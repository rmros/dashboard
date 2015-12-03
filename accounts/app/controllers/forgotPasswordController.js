app.controller('forgotPasswordController',
  ['$scope','$location','userService','$rootScope',
  function($scope,$location,userService,$rootScope){
   
      $scope.init=function(){
          if($location.search().code){
            $scope.showNewPasswordForm = true;
          }else{
            $scope.showNewPasswordForm = false;
          }
          trackMixpanel();
      };

      $scope.requestResetPassword = function(isValid){
      
        if(isValid){
          $scope.showSpinner = true;
          userService.requestResetPassword($scope.email).then(function(){
            $scope.showSpinner = false;
            $scope.err = 'We have sent you an email with a password reset link. Please check your spam (just in case).';
          }, function(error){
            $scope.showSpinner = false;
            $scope.err = error;
          });
          if(!__isDevelopment){
            /****Tracking*********/          
             mixpanel.track('Portal:Clicked ResetPassword Button', { "Clicked": "ResetPassword Button in portal!"});
            /****End of Tracking*****/
          }
        }
      };

      $scope.changePassword = function(isValid){      
        if(isValid){
          if($scope.password==$scope.confirmPassword){
              $scope.showSpinner = true;
              userService.changePassword($location.search().code, $scope.password, $scope.confirmPassword)
              .then(function(){
                $scope.showSpinner = false;
                 window.location.href="/accounts";
              }, function(error){
                $scope.showSpinner = false;
                $scope.err = error;
              });

              if(!__isDevelopment){
                /****Tracking*********/          
                 mixpanel.track('Portal:Clicked ChangePassword Button', { "Clicked": "ChangePassword Button in portal!"});
                /****End of Tracking*****/
              } 
          }else{
            $scope.err = "password doesn't match with confirm password";
          }          
        }
      };

      function trackMixpanel(){
        if(!__isDevelopment){
          /****Tracking*********/          
           mixpanel.track('Portal:Visited ForgotPassword Page', { "Visited": "Visited ForgotPassword page in portal!"});
          /****End of Tracking*****/
        } 
      }
     
 }]);
