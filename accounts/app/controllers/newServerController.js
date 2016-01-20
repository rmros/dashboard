app.controller('newServerController',
  ['$scope','userService','$rootScope',
  function($scope,userService,$rootScope){      
     
    $scope.init = function(){
      $scope.userData={}; 
      $scope.userData.name=null;
      $scope.userData.email=null; 
      $scope.userData.password=null; 
      $scope.showSpinner=false;                              
    };

    $scope.submitData=function(){

      if($scope.userData.name && $scope.userData.email && $scope.userData.password){
        $scope.showSpinner=true;
        $scope.err=null;
        var isAdmin=true;
        
        userService.signUp($scope.userData.name,$scope.userData.email,$scope.userData.password,isAdmin)             
        .then(function(data){
          $scope.showSpinner=false;

          $.cookie('userId', data._id, { expires: 29,path: '/' });
          $.cookie('userFullname', data.name, { expires: 29,path: '/' });
          $.cookie('email', data.email, { expires: 29,path: '/' });
          $.cookie('createdAt', data.createdAt, { expires: 29,path: '/' });
          
          window.location.href=dashboardURL+"/#/admin"; 
                
        },function(error){
          $scope.showSpinner=false;
          $scope.err=error;
        });           
      }
    };

 }]);
