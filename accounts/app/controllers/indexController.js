app.controller('indexController',
	['$scope','$rootScope','$q','$cookies','userService','$location','serverSettingsService',
function($scope,$rootScope,$q,$cookies,userService,$location,serverSettingsService){	 


	$scope.$watch(function(scope) {
      return $location.path();
    },function(newPath,oldPath) {
        if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){ 
        	checkValidation(newPath,oldPath);        	                
        }else{
          window.location.href=dashboardURL;
        }            
    });

	function checkValidation(newPath,oldPath){
		var promises=[];
		promises.push(serverSettingsService.isNewServer());
		promises.push(serverSettingsService.getServerSettings());

		$q.all(promises).then(function(list){											
			if(list[0]==true && newPath!="/newServer"){//Speacial case
		        window.location.href=dashboardURL+"/accounts/#/newServer"
	     	}else if(newPath=="/newServer" && (!list[0] || list[0]==false)){	     	
	     		window.location.href=dashboardURL+"/accounts";	     		      		
	      	}else if(!list[1].allowSignUp && newPath!="/signup" && newPath!="/newServer"){	      		
	      		window.location.href=dashboardURL+"/accounts/#/"+newPath;      		
	      	}else if(!list[1].allowSignUp && newPath=="/signup"){//Speacial case
	      		window.location.href=dashboardURL+"/accounts";
	      	}

		}, function(error){
	      //console.log(error);           
	    });		
	}					
	
}]);
