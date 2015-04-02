app.factory('paymentService', ['$q','$http',function ($q,$http) {

    var global = {};
       global.getCrediCardInfo = function(){
         var q=$q.defer();

         $http.get(serverURL+'/payment/get/cardinfo').
           success(function(data, status, headers, config) {
                 q.resolve(data);
           }).
           error(function(data, status, headers, config) {
                 q.reject(data);
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
                $http.post(serverURL+'/payment/upsert/card',serverObj).
                 success(function(data, status, headers, config) {                  
                    q.resolve(data);

                    /****Tracking*********/            
                     mixpanel.track('add Or Edit Card', {"cardHolderName":data.stripeCardObject.name});
                    /****End of Tracking*****/
                 }).
                 error(function(data, status, headers, config) {                  
                    q.reject(status);
                 });
                //End of Hit Server          
            }
          });             

        return  q.promise;
      };
      
   
    return global;

}]);
