app.factory('beaconService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};    

    global.getBeacon = function(){
        var q=$q.defer();
        $http.get(frontendServerURL+'/beacon/get').
          success(function(data, status, headers, config) {
              q.resolve(data);
          }).
          error(function(data, status, headers, config) {
              q.reject(status);
              if(status===401){
                $rootScope.logOut();
              }
          });

          return  q.promise;
    };

    global.updateBeacon = function(beaconObj){
        var q=$q.defer();
        $http.post(frontendServerURL+'/beacon/update',beaconObj).
        success(function(data, status, headers, config) {
            q.resolve(data);
        }).
        error(function(data, status, headers, config) {
            q.reject(status);
            if(status===401){
              $rootScope.logOut();
            }
        });

        return  q.promise;
     };


    return global;

}]);
