app.controller('loginController',
  ['$scope','userService','$http','$cookies','$rootScope',
  function($scope,userService,$http,$cookies,$rootScope){

  $scope.accountVerified=true; 
  $scope.resentCode=false; 
  $scope.init=function()  {   
    $scope.showSpinner=false;
    loadBlog();
    trackMixpanel();           
  }

  $scope.logIn=function(isValid){
    if(isValid){
      $scope.showSpinner=true;

      userService.logIn($scope.email,$scope.password)
      .then(function(data){               

        $.cookie('userId', data._id, { expires: 29,path: '/' });
        $.cookie('userFullname', data.name, { expires: 29,path: '/' });
        $.cookie('email', data.email, { expires: 29,path: '/' });
        $.cookie('createdAt', data.createdAt, { expires: 29,path: '/' });
        
        if(data.isAdmin){
          window.location.href=dashboardURL+"/#/admin";
        }else{
          window.location.href=dashboardURL;
        }
        
        //$scope.showSpinner=false;
      }, function(error){
        $scope.showSpinner=false;
        if(error && error.message=="Account verification needed"){
          $scope.accountVerified=false;
        }else if(error && error.message){
          $scope.err=error.message;
        }else{
          $scope.err="Something went wrong, try again.";
        }
        
      });

      if(!__isDevelopment){
        /****Tracking*********/          
         mixpanel.track('Portal:Clicked LogIn Button', { "Clicked": "LogIn Button in portal!"});
        /****End of Tracking*****/
      } 
    }
  };

  $scope.resendVerificationEmail=function(){
   
    $scope.showSpinner=true;
    $scope.err=null;
    userService.resendVerificationEmail($scope.email)
    .then(function(data){ 
      $scope.resentCode=true; 
      $scope.showSpinner=false;       
    }, function(error){
      $scope.showSpinner=false;
      $scope.err=error.message;        
    });
    
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
            $scope.feed.link=$scope.feed.link.replace("http://cbblog.azurewebsites.net", "http://blog.cloudboost.io");                        
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

  function trackMixpanel(){
    if(!__isDevelopment){
      /****Tracking*********/          
       mixpanel.track('Portal:Visited LogIn Page', { "Visited": "Visited Log In page in portal!"});
      /****End of Tracking*****/
    } 
  } 

 }]);
