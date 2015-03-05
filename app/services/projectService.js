app.factory('projectService', ['$q','$http',function ($q,$http) {

    var global = {};

     global.projectList = function(){
         var q=$q.defer();

         $http.get(serverURL+'/project/list').
           success(function(data, status, headers, config) {
                 q.resolve(data);
           }).
           error(function(data, status, headers, config) {
                 q.reject(data);
           });

           return  q.promise;

      };

   global.createProject = function(name,appId){
       var q=$q.defer();
       $http.post(serverURL+'/project/create', {name:name,appId:appId}).
         success(function(data, status, headers, config) {
               q.resolve(data);
         }).
         error(function(data, status, headers, config) {
               q.reject(status);
         });

         return  q.promise;
    };

    global.deleteProject = function(appId){
       var q=$q.defer();
       $http.post(serverURL+'/project/delete/'+appId, null).
         success(function(data, status, headers, config) {
              if(status===200)
               q.resolve(status);
             else 
               q.reject(status);
         }).
         error(function(data, status, headers, config) {
               q.reject(status);
         });

         return  q.promise;
    };


    global.editProject = function(id,name){
        var q=$q.defer();
        $http.put(serverURL+'/project/edit/'+id, {name:name}).
          success(function(data, status, headers, config) {
                q.resolve(data);
          }).
          error(function(data, status, headers, config) {
                q.reject(status);
          });

          return  q.promise;
     };

     global.getProject = function(id){
        var q=$q.defer();
        $http.get(serverURL+'/project/get/'+id).
          success(function(data, status, headers, config) {
                q.resolve(data);
          }).
          error(function(data, status, headers, config) {
                q.reject(status);
          });

          return  q.promise;
     };
    return global;

}]);
