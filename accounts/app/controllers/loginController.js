app.controller('loginController',
  ['$scope','userService','$http','$cookies','$rootScope',
  function($scope,userService,$http,$cookies,$rootScope){

  $scope.init=function()  {   
    $scope.showSpinner=false;
    loadBlog();          
  }

  $scope.logIn=function(isValid){
    if(isValid){
      $scope.showSpinner=true;

      userService.logIn($scope.email,$scope.password)
      .then(function(data){               

        $.cookie('userId', data._id, { path: '/' });
        $.cookie('userFullname', data.name, { path: '/' });
        $.cookie('email', data.email, { path: '/' });
        $.cookie('createdAt', data.createdAt, { path: '/' });
        
        window.location.href=dashboardURL;
        //$scope.showSpinner=false;
      }, function(error){
        $scope.showSpinner=false;
        $scope.err=error.message;
      });
    }
  };

  function loadBlog(){ 

    $scope.isBlogLoading=true;

    $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent('https://blog.cloudboost.io/rss'))  
    .then(function(res){    
      var entries=res.data.responseData.feed.entries;

      if(entries.length>0){
        for(var i=0;i<entries.length;++i){
          if(entries[i].categories.length>0 && getAnnouncement(entries[i].categories)){          
            $scope.feed=entries[i];            
            break;        
          }
        }
        $scope.isBlogLoading=false;
      }else{
        $scope.feed=null;
        $scope.isBlogLoading=false;
      }
      
    }, function(error){
      console.log(error);
      $scope.isBlogLoading=false;
    });
  }

  function getAnnouncement(categories){
    var res=null;
    for(var j=0;j<categories.length;++j){
      if(categories[j]=="announcement"){
        res=categories[j];
        break;
      }
    }
    return res;
  }

 }]);
