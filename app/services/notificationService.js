app.factory('notificationService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.getNotifications = function(skip,limit){
      var q=$q.defer();
      $http.get(frontendServerURL+'/notification/'+skip+'/'+limit).
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
        if(status===401){
          $rootScope.logOut();
        }
      });

      return  q.promise;
    };

    global.updateNotificationsSeen = function(){
      var q=$q.defer();
      $http.get(frontendServerURL+'/notification/seen').
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
        if(status===401){
          $rootScope.logOut();
        }
      });

      return  q.promise;
    };

    global.removeNotification= function(notifyId){
        var q=$q.defer();
        $http.delete(frontendServerURL+'/notification/'+notifyId).
        success(function(data, status, headers, config) {           
          q.resolve(data);                 
             
        }).error(function(data, status, headers, config) {
            q.reject(status);
            if(status===401){
              $rootScope.logOut();
            }
        });

        return  q.promise;
    };
    
    return global;

}]);
