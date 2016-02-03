app.factory('analyticsService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

  var global = {};
    
  global.api = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/api/'+appId).
    success(function(data, status, headers, config) {
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      q.reject(data);       
    });

    return  q.promise;
  };

  global.storage = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/storage/'+appId).
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
