app.factory('paymentService', ['$q','$http',function ($q,$http) {

    var global = {};
       global.getCrediCardInfo = function(appName){
         var q=$q.defer();

         $http.get(serverURL+'/payment/get/cardinfo/'+appName).
           success(function(data, status, headers, config) {
                 q.resolve(data);
           }).
           error(function(data, status, headers, config) {
                 q.reject(data);
           });

           return  q.promise;

      };

      global.addOrEditCreditCard = function(appName,creditcardInfo){
        var q=$q.defer();

        if(!isNaN(creditcardInfo.number) && creditcardInfo.number.length==16){
                //Get Stripe Token
                Stripe.card.createToken(creditcardInfo,function(status, response) {
                  if (response.error) {
                    q.reject(response.error);
                  } else {  
                            
                      var serverObj={
                        appId:appName,
                        cardInfo:response.card,
                        stripeToken:response.id
                      }
                        
                      //Hit Server
                      $http.post(serverURL+'/payment/upsert/card',serverObj).
                       success(function(data, status, headers, config) {                  
                          q.resolve(data);
                       }).
                       error(function(data, status, headers, config) {                  
                          q.reject(status);
                       });
                      //End of Hit Server          
                  }
                });
        }else{
             
              var serverObj={
                      appId:appName,
                      cardInfo:creditcardInfo,
                      stripeToken:null
                    }      
              //Hit Server
              $http.post(serverURL+'/payment/upsert/card',serverObj).
               success(function(data, status, headers, config) {                  
                  q.resolve(data);
               }).
               error(function(data, status, headers, config) {                  
                  q.reject(status);
               });
              //End of Hit Server 
        }         

        return  q.promise;
      };
      
   
    return global;

}]);
