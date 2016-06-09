app.factory('pushService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.sendPush = function(pushData,query){

      var q=$q.defer();

      CB.CloudPush.send(pushData,query,{
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
