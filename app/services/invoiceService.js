app.factory('invoiceService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

      global.getinvoiceSettings = function(appId){
         var q=$q.defer();

         $http.get(serverURL+'/'+appId+'/invoice/settings').
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

      global.getinvoice = function(appId){
         var q=$q.defer();

          $http.get(serverURL+'/'+appId+'/invoice').
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

      global.addOrRemoveSpendingLimit = function(appId,spendingLimit){
        var q=$q.defer();

          $http.put(serverURL+'/'+appId+'/invoice/settings', {spendingLimit:spendingLimit}).
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
