app.factory('cacheService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};    

    global.createCache = function(name){
      var q=$q.defer();

        var cache = new CB.CloudCache(name);
            cache.create({
            success : function(cache){
                //cache is an empty the object of the CB.CloudCache instance.
                q.resolve(cache);


                if(!__isDevelopment){
                  /****Tracking*********/              
                   mixpanel.track('Create Cache', {"App id": $rootScope.currentProject.appId,"Cache Name": name});
                  /****End of Tracking*****/
                }


            }, error : function(error){
                q.reject(error);
            }
        });

      return  q.promise;
    };


    global.upsertItem = function(cache,jsonObj){
      var q=$q.defer();
        
        cache.set(jsonObj.key,jsonObj.value, {
          success : function(item){              
            q.resolve(item);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    global.deleteItem = function(cache,jsonObj){
      var q=$q.defer();
        
        cache.deleteItem(jsonObj.key,{
            success : function(key){
              q.resolve(key);
            }, error : function(error){
              q.reject(error);
            }
        });

      return  q.promise;
    };

 

    global.getAllCacheItems = function(cache){
      var q=$q.defer();
        
        cache.getAll({
          success : function(items){                
            q.resolve(items);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    global.getAllCaches = function(){
      var q=$q.defer();

        CB.CloudCache.getAll({
          success : function(caches){
              //caches is the an array of CloudCache Objects
              q.resolve(caches);
          }, error : function(error){
              q.reject(error);
          }
        });

      return  q.promise;
    };

    global.getItemsCount = function(cache){
      var q=$q.defer();

        cache.getItemsCount({
          success : function(count){                
            q.resolve(count);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    global.clearCache = function(cache){
      var q=$q.defer();

        cache.clear({
          success : function(cache){                
            q.resolve(cache);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    global.deleteCache = function(cache){
      var q=$q.defer();

        cache.delete({
          success : function(cache){                
            q.resolve(cache);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    global.getCacheInfo = function(cache){
      var q=$q.defer();

        cache.getInfo({
          success : function(cache){
            q.resolve(cache);
          }, error : function(error){
            q.reject(error);
          }
        });

      return  q.promise;
    };

    return global;

}]);
