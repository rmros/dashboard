app.controller('activateController',
  ['$scope','$location','userService','$rootScope',
  function($scope,$location,userService,$rootScope){
     
      $scope.init=function(){   
          $scope.showSpinner=true;
          if($location.search().code){

            userService.activate($location.search().code).then(function(data){
              $scope.showSpinner=false;
               $scope.err = "Thank you! We successfully activated your account.";
            }, function(error){
                $scope.showSpinner=false;
                $scope.err = "We're sorry, but we can't activate your account at this point in time. Please try again later";
                console.log(error);
            });
          }else{
               $scope.showSpinner=false;
               $scope.err = "We're sorry, but we can't activate your account at this point in time. Please try again later";
          }        

      }
   
 }]);
