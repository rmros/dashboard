app.controller('indexController',
	['$scope','$rootScope','$cookies',
	function($scope,$rootScope,$cookies){

  
    $scope.userFullname=$cookies.userFullname; 

		$scope.toggleSideMenu=function(){			
			//Toggle side menu
      var b = $("#sidebar-collapse")[0];
      var w = $("#cl-wrapper");
      var s = $(".cl-sidebar");
      
      if(w.hasClass("sb-collapsed")){
        $(".fa",b).addClass("fa-angle-left").removeClass("fa-angle-right");
        w.removeClass("sb-collapsed");
        $.cookie('FLATDREAM_sidebar','open',{expires:365, path:'/'});
      }else{
        $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
        w.addClass("sb-collapsed");
        $.cookie('FLATDREAM_sidebar','closed',{expires:365, path:'/'});
      }			
		}; 

    $scope.logOut=function(){
      var logOutPromise=userService.logOut();
      logOutPromise.then(
         function(data){
              $cookies.userId = null;
              $cookies.userFullname = null; 
              $cookies.email = null;
              $cookies.createdAt = null;
              window.location.href="http://www.cloudboost.io";
         },
         function(error){
           
         }
       );      
    };   
				
		
	}]);
