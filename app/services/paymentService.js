app.factory('paymentService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};
  
  	global.createSale = function(appId,cardDetails){
        var q=$q.defer();

         var args = {
	        sellerId: twoCheckoutCredentials.sellerId,
	        publishableKey: twoCheckoutCredentials.publishableKey,
	        ccNo:"4000000000000002",
	        cvv:"123" ,
	        expMonth:"10",
	        expYear: "2018"
	    };

        //Pull in the public encryption key for our environment
        TCO.loadPubKey('sandbox', function() {	

		    _tokenRequest(args)
		    .then(function(data){

		    	if(!data){
		    		console.log("Try again.");		    		
		    	}else{

		    		var reqObj={			    		
			    		token:data.response.token.token,
			    		billingAddr:{},
			    		planId:0
			    	};
			    	
			    	return $http.post(frontendServerURL+'/'+appId+'/sale',reqObj);
		    	}
		    	
		    }).then(function(responseData){
		    	console.log(responseData);
		    },function(error){
		    	console.log(error);
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

  return global;

}]);




