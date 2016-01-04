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

    global.updateQueue = function(queue){
      var q=$q.defer();
      
      queue.update({
        success : function(updatedQueue){
          q.resolve(updatedQueue);            
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.deleteQueue = function(queue){
      var q=$q.defer();

      queue.delete({
        success : function(resp){
          q.resolve(resp);
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.getQueueInfo = function(queue){
      var q=$q.defer();

      queue.get({
        success : function(queueInfo){
          q.resolve(queueInfo);
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.getMessageById = function(queue,messageId){
      var q=$q.defer();

      queue.getMessageById(messageId,{
        success : function(message){
          q.resolve(message);
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.insertDataIntoQueue = function(message,timeout,delay,expire){
      var q=$q.defer();

      var queueMessage = new CB.QueueMessage();
      queueMessage.message = message;

      if(timeout==0 || timeout>0){
        queueMessage.timeout = 3600;
      }     

      if(delay==0 || delay>0){
        queueMessage.delay = delay;
      }     

      if(expire){
        queueMessage.expire = expire;
      }

      queue.push(queueMessage, {
        success : function(queueMessage){
          q.resolve(queueMessage);  
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.getDataFromQueue = function(queue){
      var q=$q.defer();

      queue.pull({
        success : function(queueMessage){ 
          q.resolve(queueMessage);          
        }, error : function(error){ 
          q.reject(error);        
        }
      });

      return  q.promise;
    };

    return global;

}]);