app.controller('signupController',
  ['$scope','userService','$rootScope',
  function($scope,userService,$rootScope){   

      $scope.init = function(){             
          $scope.showSpinner=false;                  
      };

      $scope.signUp=function(isValid){

        if(isValid)
          {

              $scope.showSpinner=true;

              var signUpPromise=userService.signUp($scope.name,$scope.email,$scope.password);
              signUpPromise
              .then(function(data){
                 //$scope.showSpinner=false;                 
                $.cookie('userId', data._id, { path: '/' });
                $.cookie('userFullname', data.name, { path: '/' });
                $.cookie('email', data.email, { path: '/' });
                $.cookie('createdAt', data.createdAt, { path: '/' });

                window.location.href=dashboardURL;
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
