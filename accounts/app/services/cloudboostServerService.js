
app.service('cloudboostServerService', function($q,$http){ 

  this.isNewServer=function(){
    var q=$q.defer();

    $http.get(serverURL+'/cloudboost/isNewServer').
      success(function(data, status, headers, config) {
        q.resolve(data);
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });
    return q.promise;
  }

});
