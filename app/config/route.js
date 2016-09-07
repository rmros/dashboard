app.config([
  '$urlRouterProvider',
  '$stateProvider',
  '$httpProvider',
  '$locationProvider',  
  function($urlRouterProvider,$stateProvider,$httpProvider,$locationProvider){

  $urlRouterProvider.otherwise('/');
   $stateProvider.state('apps',
    {
      url:'/',
      templateUrl:'app/views/apps.html',
      controller: 'appsController'             
    }); 

   $stateProvider.state('tableDesigner', {
      url: '/:appId/table',
      templateUrl: 'app/views/table-designer.html',
      controller: 'tableDesignerController'
    });

    $stateProvider.state('dataBrowser', {
        url: '/:appId/table/:tableName',
        templateUrl: 'app/views/data-browser.html',
        controller: 'dataBrowserController'
    });   

    $stateProvider.state('analytics', {
        url: '/:appId/analytics',
        templateUrl: 'app/views/analytics.html',
        controller: 'analyticsController'
    });

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'app/views/profile.html',
        controller: 'profileController'
    });

    $stateProvider.state('admin', {
        url: '/admin',
        templateUrl: 'app/views/admin.html',
        controller: 'adminController',
        resolve:{
          validate:  function($rootScope) {
            if($rootScope.user && !$rootScope.user.isAdmin){
              //$location.path('/');
            }
          }
        }  
    });

    $stateProvider.state('queues', {
        url: '/:appId/queues',
        templateUrl: 'app/views/queues.html',
        controller: 'queuesController'
    });

    $stateProvider.state('cache', {
        url: '/:appId/cache',
        templateUrl: 'app/views/cache.html',
        controller: 'cacheController'
    });

    $stateProvider.state('files', {
        url: '/:appId/files',
        templateUrl: 'app/views/file-browser.html',
        controller: 'fileBrowserController'
    });

    $stateProvider.state('push', {
        url: '/:appId/push',
        templateUrl: 'app/views/push-browser.html',
        controller: 'pushBrowserController'
    });

    $stateProvider.state('settings', {
        url: '/:appId/settings',
        templateUrl: 'app/views/app-settings.html',
        controller: 'appSettingsController'
    });        

  //cors.
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];   

}]);

app.filter('validUser', function($rootScope) {
  return function(app) {
    if(app.developers && app.developers.length>0 && $rootScope.user){

      return _.find(app.developers, function(eachObj){ 
        if(eachObj.userId==$rootScope.user._id && eachObj.role=="Admin"){
          return true;
        }
      });

    }else {
      return false;
    }
    
  }
});

app.filter('checkUnseenNotifications', function($rootScope) {
  return function(notifications) {
    if(notifications && notifications.length>0){

      return _.find(notifications, function(eachObj){ 
        if(eachObj.seen==false){
          return true;
        }
      });

    }else {
      return false;
    }
    
  }
});

app.filter('countUnseenNotifications', function($rootScope) {
  return function(notifications) {
    if(notifications && notifications.length>0){
      var count=0;
      for(var i=0;i<notifications.length;++i){
        if(notifications[i].seen==false){
          ++count;
        }
      }
     
      return count;
    }else {
      return 0;
    }    
  }
});

app.filter('stringifyjson', function($rootScope) {
  return function(json) {
    if(Object.prototype.toString.call(json)=="[object Object]" || Object.prototype.toString.call(json)=="[object Array]"){
      return JSON.stringify(json);
    }else{
      return json;
    }       
  }
});

app.filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);

app.filter('debug', function() {
  return function(input) {
        console.log(input);

    if (input === '') return console.log('empty string');
    return input ? input : ('' + input);
  };
});


app.filter('extension', function() {
  return function(val) {
    if(val){
      var valArray=val.split(".");    
      return valArray[valArray.length-1];
    }else{
      return false;
    }
    
  }
});

app.filter('convertIsoToDate', function() {
  return function(input) {
    return new Date(input);
  };
});

app.filter('ISO2DateObject', function() {
  return function(val) {
    if(val){
      return new Date(val);
    }else{
      return new Date();
    }
    
  }
});


app.filter('getImageFromArray', function() {
  return function(array) {
    if(array && array.length>0){
      return _.find(array, function(eachCol){ 
        if(eachCol.dataType=="File"){
          return eachCol;
        }
      });
    }else {
      return null;
    }
    
  }
});

app.filter('getTextFromArray', function() {
  return function(array) {
    if(array && array.length>0){
      return _.find(array, function(eachCol){ 
        if(eachCol.dataType=="Text"){
          return eachCol;
        }
      });
    }else {
      return null;
    }
    
  }
});

app.filter('getFileNameFromURL', function() {
  return function(url) {
    if(url){
      return url.split("/").reverse()[0];
    }else{
      return url;
    }
  }
});