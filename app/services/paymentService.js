app.factory('paymentService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};
  
  	global.createSale = function(appId,cardDetails,planId){
        var q=$q.defer();

         var args = {
	        sellerId: twoCheckoutCredentials.sellerId,
	        publishableKey: twoCheckoutCredentials.publishableKey,
	        ccNo:cardDetails.number,
	        cvv:cardDetails.cvc,
	        expMonth:cardDetails.expMonth,
	        expYear:cardDetails.expYear,
	    };

        //Pull in the public encryption key for our environment
        TCO.loadPubKey(twoCheckoutCredentials.mode, function() {	

		    _tokenRequest(args)
		    .then(function(data){

		    	if(!data){
		    		
		    		var tokenFailedQ=$q.defer();
		    		tokenFailedQ.reject("Create Token failed,try again..");
		    		return  tokenFailedQ.promise;		    		

		    	}else{

		    		var reqObj={			    		
			    		token:data.response.token.token,
			    		billingAddr:cardDetails.billing,
			    		planId:planId
			    	};
			    	
			    	return $http.post(frontendServerURL+'/'+appId+'/sale',reqObj);
		    	}
		    	
		    }).then(function(responseData){
		    	q.resolve(responseData);
		    },function(error){
		    	q.reject(error);
		    });
		});		

        return  q.promise;
    };

    var _tokenRequest = function(args) {  
 
	 	var q=$q.defer();

	    TCO.requestToken(function(data) {
	    	q.resolve(data);		
		},function(data) {
			if (data.errorCode === 200) {
				q.reject("Opps! Something went wrong, Try again.");	
			} else {
			  	q.reject(data.errorMsg);
			}
		},args);

		return  q.promise;
	};

	global.cancelRecurring = function(appId){
        var q=$q.defer();

        $http.delete(frontendServerURL+'/'+appId+'/removecard').
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

  return global;

}]);




