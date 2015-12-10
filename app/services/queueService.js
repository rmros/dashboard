app.factory('queueService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};    

    global.createQueue = function(name,type){
      var q=$q.defer();

      var queue = new CB.CloudQueue(name);
      queue.create({
          success : function(queueObject){
            q.resolve(queueObject);            
          }, error : function(error){
            q.reject(error);
          }
      });

      return  q.promise;
    };

    global.getAllQueues = function(){
      var q=$q.defer();

      CB.CloudQueue.getAll({
          success : function(list){
            q.resolve(list);
          }, error : function(error){
            q.reject(error);
          }
      });

      return  q.promise;
    };


    return global;

}]);
