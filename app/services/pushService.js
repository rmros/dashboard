app.factory('pushService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.sendPush = function(pushData){

      var q=$q.defer();

      CB.CloudPush.send(pushData,{
          success:function(data){
            q.resolve(data);
          },
          error:function(error){
            q.reject(error);
          }
      });

      return  q.promise;

    };
    
    return global;

}]);
