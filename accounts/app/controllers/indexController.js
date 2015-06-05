app.controller('indexController',
	['$scope','$rootScope','$cookies','userService','$location',
	function($scope,$rootScope,$cookies,userService,$location){	 

    $scope.init=function(){
      if($.cookie('userId') && $.cookie('userId')!="null" && $.cookie('userId')!="undefined"){          
        window.location.href=dashboardURL;        
      }
    };  				
		
	}]);
