app.factory('projectService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.projectList = function(){
      var q=$q.defer();

      $http.get(frontendServerURL+'/app').
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

    global.createProject = function(name){
        var q=$q.defer();
        $http.post(frontendServerURL+'/app/create', {name:name}).
         success(function(data, status, headers, config) {
           q.resolve(data);

           if(!__isDevelopment){
            /****Tracking*********/              
             mixpanel.track('Create App', {"App id": data.appId,"App Name": data.name});
            /****End of Tracking*****/
           } 
          
         }).
         error(function(data, status, headers, config) {
            var erroObj={
              data:data,
              status:status
            };
            q.reject(erroObj);
            if(status===401){
              $rootScope.logOut();
            }
         });

         return  q.promise;
    };  

    global.deleteProject = function(appId){
        var q=$q.defer();
        $http.delete(frontendServerURL+'/app/'+appId).
        success(function(data, status, headers, config) {
            if(status===200)
              q.resolve(status);
            else 
              q.reject(status);

              if(!__isDevelopment){
                 /****Tracking*********/              
                  mixpanel.track('Delete App', {"App id": appId});
                /****End of Tracking*****/
              }  
             
        }).
        error(function(data, status, headers, config) {
            q.reject(status);
            if(status===401){
              $rootScope.logOut();
            }
        });

        return  q.promise;
    };


    global.removeDeveloperFromProject = function(appId,userId){
        var q=$q.defer();
        $http.delete(frontendServerURL+'/app/'+appId+'/removedeveloper/'+userId).
        success(function(data, status, headers, config) {
          if(status===200)
            q.resolve(data);
          else 
            q.reject(data);            
        }).
        error(function(data, status, headers, config) {
            q.reject(data);
            if(status===401){
              $rootScope.logOut();
            }
        });

        return  q.promise;
    };

    global.removeUserFromInvited = function(appId,email){
        var q=$q.defer();
        $http.post(frontendServerURL+'/app/'+appId+'/removeinvitee',{email:email}).
        success(function(data, status, headers, config) {
          if(status===200)
            q.resolve(data);
          else 
            q.reject(data);            
        }).
        error(function(data, status, headers, config) {
            q.reject(data);
            if(status===401){
              $rootScope.logOut();
            }
        });

        return  q.promise;
    };


    global.editProject = function(id,name){
        var q=$q.defer();
        $http.put(frontendServerURL+'/app/'+id, {name:name}).
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

    global.changeAppMasterKey = function(id){
      var q=$q.defer();
      $http.get(frontendServerURL+'/app/'+id+'/change/masterkey').
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

     global.changeAppClientKey = function(id){
      var q=$q.defer();
      $http.get(frontendServerURL+'/app/'+id+'/change/clientkey').
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

      global.getProject = function(id){
        var q=$q.defer();
        $http.get(frontendServerURL+'/app/'+id).
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

      global.inviteUser = function(appId,email){
        var q=$q.defer();
        $http.post(frontendServerURL+'/app/'+appId+'/invite',{email:email}).
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

      global.addDeveloper = function(appId,email){
        var q=$q.defer();
        $http.get(frontendServerURL+'/app/'+appId+'/adddeveloper/'+email).
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

      global.changeRole = function(appId,userId,role){
        var q=$q.defer();
        $http.get(frontendServerURL+'/app/'+appId+'/changerole/'+userId+'/'+role).
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

    return global;

}]);
