app.controller('indexController',
	['$scope','$rootScope','$cookies','userService','$location',
	function($scope,$rootScope,$cookies,userService,$location){	    

    $scope.$watch(function(scope) {
     return $location.path()
     },
      function(newPath,oldPath) {
        if(!$cookies.userId || $cookies.userId=="null" || $cookies.userId=="undefined"){
          window.location.href="http://localhost:1444";
        }else{
           $scope.userFullname=$cookies.userFullname; 
        }            
      }
    );  

    $scope.logOut=function(){
      var logOutPromise=userService.logOut();
      logOutPromise.then(
         function(data){
              $cookies.userId = null;
              $cookies.userFullname = null; 
              $cookies.email = null;
              $cookies.createdAt = null;
              window.location.href="http://localhost:1444";
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
