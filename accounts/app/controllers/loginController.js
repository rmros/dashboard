app.controller('loginController',
  ['$scope','userService','$http','$cookies','$rootScope',
  function($scope,userService,$http,$cookies,$rootScope){

  $scope.init=function()  {   
      $scope.showSpinner=false;     
  }

  $scope.logIn=function(isValid){
    if(isValid)
      {
          $scope.showSpinner=true;

          var logInPromise=userService.logIn($scope.email,$scope.password);

          logInPromise.then(
              function(data){
                  $cookies.userId = data._id;
                  $cookies.userFullname = data.name; 
                  $cookies.email = data.email;
                  $cookies.createdAt = data.createdAt;
                  
                  window.location.href=dashboardURL;
                  //$scope.showSpinner=false;
              },
              function(error){
                   $scope.showSpinner=false;
                   $scope.err=error.message;
              }
          );

      }
  };


 }]);
