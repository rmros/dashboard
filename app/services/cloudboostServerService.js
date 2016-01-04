
app.service('cloudboostServerService', function($q,$http){ 

  this.getServerSettings=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/cloudboost').
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

  this.updateServerSettings=function(id,allowedSignUp){
    var q=$q.defer();

    $http.post(frontendServerURL+'/cloudboost',{id:id,allowedSignUp:allowedSignUp}).
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

});
