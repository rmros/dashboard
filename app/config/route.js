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

    $stateProvider.state('appSettings', {
        url: '/:appId/settings',
        templateUrl: 'app/views/app-settings.html',
        controller: 'appSettingsController'
    });

    $stateProvider.state('pricing', {
        url: '/:appId/pricing',
        templateUrl: 'app/views/pricing.html',
        controller: 'pricingController'
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

  //cors.
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

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