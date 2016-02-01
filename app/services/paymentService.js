app.factory('paymentService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};
  
  	global.upsertCard = function(cardDetails){
        var q=$q.defer();

        $http.post(frontendServerURL+'/payment/card',cardDetails).
		success(function(data, status, headers, config) {
			q.resolve(data);
		}).error(function(data, status, headers, config) {
			q.reject(status);
			if(status===401){
				$rootScope.logOut();
			}
		});

        return  q.promise;
    };

  return global;

}]);
