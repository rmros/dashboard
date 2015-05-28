app.controller('indexController',
	['$scope','$rootScope','$cookies','userService','$location',
	function($scope,$rootScope,$cookies,userService,$location){	    

    $scope.$watch(function(scope) {
     return $location.path()
     },
      function(newPath,oldPath) {
        if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){          
          window.location.href="/accounts";
        }else{
           $scope.userFullname=$.cookie('userFullname'); 
        }            
      }
    );  

    $rootScope.logOut=function(){
      var logOutPromise=userService.logOut();
      logOutPromise.then(
         function(data){           

              $.removeCookie('userId', { path: '/' });
              $.removeCookie('userFullname', { path: '/' });
              $.removeCookie('email', { path: '/' });
              $.removeCookie('createdAt', { path: '/' });

              window.location.href="/accounts";
         },
         function(error){
           console.log(error);
         }
       );      
    }; 

    $scope.toggleSideMenu=function(){     
      /*Collapse sidebar*/
      toggleSideBar();         
    }; 

    function toggleSideBar(_this){
          var b = $("#sidebar-collapse")[0];
          var w = $("#cl-wrapper");
          var s = $(".cl-sidebar");
         
          $(".fa",b).removeClass("fa-angle-left").addClass("fa-angle-right");
          w.addClass("sb-collapsed");
          $.cookie('FLATDREAM_sidebar','closed',{expires:365, path:'/'});         
          //updateHeight();
    } 
      				
		
	}]);
