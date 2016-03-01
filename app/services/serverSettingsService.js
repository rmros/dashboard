
app.service('serverSettingsService', function($q,$http){ 

  this.getServerSettings=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/server').
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

    $http.post(frontendServerURL+'/server',{id:id,allowedSignUp:allowedSignUp}).
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

  this.upsertAPI_URL=function(apiURL){
    var q=$q.defer();

    $http.post(frontendServerURL+'/server/url',{apiURL:apiURL}).
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

  this.isHosted=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/server/isHosted').
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

});
