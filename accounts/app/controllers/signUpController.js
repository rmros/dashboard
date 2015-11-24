app.controller('signupController',
  ['$scope','userService','$rootScope',
  function($scope,userService,$rootScope){   

      $scope.isUserSignedUp=false;

      $scope.init = function(){             
        $scope.showSpinner=false;                  
      };

      $scope.signUp=function(isValid){

        if(isValid){
          $scope.showSpinner=true;
          $scope.err=null;
          userService.signUp($scope.name,$scope.email,$scope.password)             
          .then(function(data){
            $scope.showSpinner=false;
            $scope.isUserSignedUp=true;
          },function(error){
            $scope.showSpinner=false;
            $scope.err=error;
          });
        }
      };


      $scope.facebookSignUp=function(){

              $scope.showSpinner=true;

              var facebookSignUpPromise=userService.facebookSignUp();
              facebookSignUpPromise.then(
                  function(data){
                    console.log(data);
                     $scope.showSpinner=false;
                        //console.log(data);
                  },
                  function(error){
                        $scope.showSpinner=false;
                        $scope.err=error;
                  }
              );

      };

      $scope.googleSignUp=function(){
        
              $scope.showSpinner=true;
              var facebookSignUpPromise=userService.facebookSignUp();
              facebookSignUpPromise.then(
                  function(data){
                    console.log(data);
                     $scope.showSpinner=false;
                        //console.log(data);
                  },
                  function(error){
                        $scope.showSpinner=false;
                        $scope.err=error;
                  }
              );

      };


 }]);
