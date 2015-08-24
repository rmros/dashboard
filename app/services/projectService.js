app.factory('projectService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.projectList = function(){
      var q=$q.defer();

      $http.get(serverURL+'/app').
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

    global.createProject = function(name,appId){
       var q=$q.defer();
       $http.post(serverURL+'/app/create', {name:name,appId:appId}).
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
        $http.delete(serverURL+'/app/'+appId).
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


    global.editProject = function(id,name){
        var q=$q.defer();
        $http.put(serverURL+'/app/'+id, {name:name}).
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
        $http.get(serverURL+'/app/'+id).
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
