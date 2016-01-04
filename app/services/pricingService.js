app.factory('pricingService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

  var global = {};
    
  global.getStatisticsByAppId = function(appId,category,subCategory){
    var q=$q.defer();
 
    $http.post(analyticsURL+'/statistics',{appId:appId,category:category,subCategory:subCategory}).
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
