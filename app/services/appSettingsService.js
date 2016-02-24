app.factory('appSettingsService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};    

    global.getSettings = function(appId,masterKey){
        var q=$q.defer();

        var params = {};
        params.key = masterKey;

        $http.post(SERVER_URL+'/settings/'+appId,params).
          success(function(data, status, headers, config) {
              q.resolve(data);
          }).
          error(function(data, status, headers, config) {
            q.reject(status);             
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
