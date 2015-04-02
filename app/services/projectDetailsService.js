app.factory('projectDetailsService', ['$q','$http',function ($q,$http) {

    var global = {};

     global.getProjectSettings = function(appId){
         var q=$q.defer();

         $http.get(serverURL+'/projectdetails/get/'+appId).
           success(function(data, status, headers, config) {
                 q.resolve(data);
           }).
           error(function(data, status, headers, config) {
                 q.reject(data);
           });

           return  q.promise;

      };

   global.saveSettings = function(data){
       var q=$q.defer();
       $http.post(serverURL+'/projectdetails/save',data).
         success(function(data, status, headers, config) {
               q.resolve(data);

              /****Tracking*********/            
               mixpanel.track('Project Settings', {"appId": data.appId,
                "isReleasedInProduction": data.isReleasedInProduction
              });
              /****End of Tracking*****/
         }).
         error(function(data, status, headers, config) {
               q.reject(status);
         });

         return  q.promise;
    };
   
    return global;

}]);
