angular.module('CloudBoostDashboard')
.factory('userService', ['$q','$http',function ($q,$http) {

    var global = {};

     global.logOut = function(){
        var q=$q.defer();

        $http.post(serverURL+'/user/logout').
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
