app.controller('usersController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'userService',
function($scope,
$rootScope,
$stateParams,
$location,
userService){  
 
  $rootScope.isFullScreen=false;
  $rootScope.page='users';  
 
  $scope.init= function() {  
    $rootScope.pageHeaderDisplay="Manage Users";  
  }; 

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
