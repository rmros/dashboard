app.factory('analyticsService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

  var global = {};
    
  global.apiUsage = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/api/'+appId+'/usage').
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      q.reject(data);       
    });

    return  q.promise;
  };

  global.storageUsage = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/storage/'+appId+'/usage').
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      q.reject(data);       
    });

    return  q.promise;
  }; 


  global.apiCount = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/api/'+appId+'/count').
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      var defaultResp={                    
        appId:appId,
        error:data                             
      };
      q.reject(defaultResp);       
    });

    return  q.promise;
  };

  global.storageCount = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/storage/'+appId+'/count').
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      var defaultResp={                    
        appId:appId,
        error:data                             
      };
      q.reject(defaultResp);       
    });

    return  q.promise;
  }; 

  global.bulkApiStorageDetails = function(appIdArray){
    var q=$q.defer();
 
    $http.post(frontendServerURL+'/analytics/api-storage/bulk/count',{appIdArray:appIdArray}).
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {      
      q.reject(data);       
    });

    return  q.promise;
  };      
   
  return global;

}]);
