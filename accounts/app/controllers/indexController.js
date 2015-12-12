app.controller('indexController',
	['$scope','$rootScope','$cookies','userService','$location','cloudboostServerService',
function($scope,$rootScope,$cookies,userService,$location,cloudboostServerService){	 

	/*$scope.init=function(){
	  if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){	
	  	isNewServer();     	
	  }else{
	  	window.location.href=dashboardURL;
	  }	  
	}; */

	$scope.$watch(function(scope) {
      return $location.path();
    },function(newPath,oldPath) {
        if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){         
        	isNewServer(newPath,oldPath);                 
        }else{
          window.location.href=dashboardURL;
        }            
    });

	function isNewServer(newPath,oldPath){
	    cloudboostServerService.isNewServer()
	    .then(function(response){ 
	      if(response==true && newPath!="/newServer"){
	        window.location.href=dashboardURL+"/accounts/#/newServer"
	      }else if(newPath=="/newServer" && (!response || response==false)){
	      	window.location.href=dashboardURL+"/accounts/#"+oldPath;
	      }     
	    }, function(error){
	      //console.log(error);           
	    });
	} 				
	
}]);
