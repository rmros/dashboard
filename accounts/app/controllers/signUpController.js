app.controller('signupController',
  ['$scope','userService','$rootScope',
  function($scope,userService,$rootScope){   

      $scope.isUserSignedUp=false;

      $scope.init = function(){             
        $scope.showSpinner=false;
        trackMixpanel();                  
      };
      
      $scope.signUp=function(isValid){

        if(isValid){
          $scope.showSpinner=true;
          $scope.err=null;
          var isAdmin=false;
          
          userService.signUp($scope.name,$scope.email,$scope.password,isAdmin)             
          .then(function(data){
            $scope.showSpinner=false;
            $scope.isUserSignedUp=true;
          },function(error){
            $scope.showSpinner=false;
            $scope.err=error;
          });

          if(!__isDevelopment){
            /****Tracking*********/          
             mixpanel.track('Portal:Clicked SignUp Button', { "Clicked": "SignUp Button in portal!"});
            /****End of Tracking*****/
          } 
        }
      };


      $scope.facebookSignUp=function(){

        $scope.showSpinner=true;

        var facebookSignUpPromise=userService.facebookSignUp();
        facebookSignUpPromise
        .then(function(data){
          console.log(data);
          $scope.showSpinner=false;
          //console.log(data);
        },function(error){
          $scope.showSpinner=false;
          $scope.err=error;
        });

      };

      $scope.googleSignUp=function(){
        
        $scope.showSpinner=true;
        var facebookSignUpPromise=userService.facebookSignUp();
        facebookSignUpPromise
        .then(function(data){
          console.log(data);
          $scope.showSpinner=false;
          //console.log(data);
        },function(error){
            $scope.showSpinner=false;
            $scope.err=error;
        });
      };

      function trackMixpanel(){
        if(!__isDevelopment){
          /****Tracking*********/          
           mixpanel.track('Portal:Visited SignUp Page', { "Visited": "Visited Sign Up page in portal!"});
          /****End of Tracking*****/
        } 
      }

 }]);
