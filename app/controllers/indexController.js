app.controller('indexController',
	['$scope','$rootScope','userService','$location',
	function($scope,$rootScope,userService,$location){	

    getUserInfo();

    $scope.$watch(function(scope) {
     return $location.path()
     },
      function(newPath,oldPath) {
        if(!$.cookie('userId') || $.cookie('userId')=="null" || $.cookie('userId')=="undefined"){          
          window.location.href="/accounts";
        }else{
          $rootScope.userFullname=$.cookie('userFullname'); 
        }            
    });  

    $rootScope.logOut=function(){
      userService.logOut()      
      .then(function(data){           

        $.removeCookie('userId', { path: '/' });
        $.removeCookie('userFullname', { path: '/' });
        $.removeCookie('email', { path: '/' });
        $.removeCookie('createdAt', { path: '/' });

        window.location.href="/accounts";
      },function(error){
           console.log(error);
      });      
    }; 

    //Private Functions
  function getUserInfo(){    
    userService.getUserInfo()
    .then(function(obj){     
      if(obj && obj.file){
        getImgSize(obj.file.document.url);      
        $rootScope.profilePic=obj.file; 
      }else{
        $rootScope.profilePic=null; 
      }      
    }, function(error){         
    });
  }  

  function getImgSize(imgSrc) {
      var newImg = new Image();

      newImg.onload = function() {
        var height = newImg.height;
        var width = newImg.width;
        
        if(width>height){
          $(".profile-avatar").css({"width":"auto","height":"28px"});
        }else if(height>width){
          $(".profile-avatar").css({"width":"28px","height":"auto"});
        }        
      }

      newImg.src = imgSrc; // this must be done AFTER setting onload
  }

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
