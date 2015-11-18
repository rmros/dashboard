app.controller('profileController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
function($scope,
$rootScope,
$stateParams,
$location){
  
 
  $rootScope.isFullScreen=false;
  $rootScope.page='profile'; 
  
  $scope.init= function() {  
   $rootScope.pageHeaderDisplay="edit Profile"; 
  };      				
		
}]);
