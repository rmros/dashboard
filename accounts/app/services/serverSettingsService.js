
app.service('serverSettingsService', function($q,$http){ 

  this.isNewServer=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/server/isNewServer').
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }


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

});
