app.factory('analyticsService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

  var global = {};
    
  global.getStatisticsByAppId = function(appId){
    var q=$q.defer();
 
    $http.get(frontendServerURL+'/analytics/'+"bull99").
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
