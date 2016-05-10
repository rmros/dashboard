app.factory('queueService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};  

    global.createQueue = function(name,type){
      var q=$q.defer();
      var queue = new CB.CloudQueue(name);
      queue.create({
          success : function(queueObject){
            q.resolve(queueObject); 

            if(!__isDevelopment){

              /****Tracking*********/              
               mixpanel.track('Create Queue', {"App id": $rootScope.currentProject.appId,"Queue Name": name});

              /****End of Tracking*****/
            }

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

    global.getAllMessages = function(queue){
      var q=$q.defer();

      queue.getAllMessages({
        success : function(list){
          q.resolve(list);
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

    global.insertMessageIntoQueue = function(queue,message,timeout,delay,expire){
      var q=$q.defer();

      var queueMessage = new CB.QueueMessage();
      queueMessage.message = message;

      if(timeout>0){
        queueMessage.timeout = timeout;
      }     

      if(delay>0){
        queueMessage.delay = delay;
      }     

      if(expire){
        queueMessage.expires = expire;
      }

      queue.addMessage(queueMessage, {
        success : function(queueMessage){
          q.resolve(queueMessage);  
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.editMessage = function(queue,queueMessage){
      var q=$q.defer();      

      queue.updateMessage(queueMessage, {
        success : function(updatedQueueMsg){
          q.resolve(updatedQueueMsg);  
        }, error : function(error){
          q.reject(error);
        }
      });

      return  q.promise;
    };

    global.deleteMsgById = function(queue,messageId){
      var q=$q.defer();

      queue.deleteMessage(messageId, {
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