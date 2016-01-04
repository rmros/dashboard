app.factory('paymentService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};
      global.getCrediCardInfo = function(){
        var q=$q.defer();

         $http.get(frontendServerURL+'/user/card').
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

      global.addOrEditCreditCard = function(creditcardInfo){
        var q=$q.defer();
      
          //Get Stripe Token
          Stripe.card.createToken(creditcardInfo,function(status, response) {
            if (response.error) {
              q.reject(response.error);
            } else {  

                var serverObj={
                  cardInfo:creditcardInfo,
                  stripeResponse:response
                }
                  
                //Hit Server
                $http.put(frontendServerURL+'/user/card',serverObj).
                 success(function(data, status, headers, config) {                  
                    q.resolve(data);

                    if(!__isDevelopment){
                      /****Tracking************/            
                       mixpanel.track('add Or Edit Card', {"cardHolderName":data.stripeCardObject.name});
                      /****End of Tracking*****/
                    }                     
                }).
                error(function(data, status, headers, config) {                  
                    q.reject(status);
                    if(status===401){
                      $rootScope.logOut();
                    }
                });
                //End of Hit Server          
            }
          });             

        return  q.promise;
      };      
   
    return global;

}]);
