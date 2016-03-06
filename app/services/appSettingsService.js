app.factory('appSettingsService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};    

    global.getSettings = function(appId,masterKey){
        var q=$q.defer();

        var params = {};
        params.key = masterKey;       

        var data = new FormData();
        data.append('key', masterKey);

        var xhttp = new XMLHttpRequest();
        xhttp.onload  = function() {
          if (xhttp.readyState == 4 && xhttp.status == 200) {
            if(xhttp.responseText){
              var resp=JSON.parse(xhttp.responseText);
              q.resolve(resp);
            }            
          }else{
            q.reject(xhttp.responseText);
          }
        };
        xhttp.open("POST", SERVER_URL+'/settings/'+appId, true);        
        xhttp.send(data);

        return  q.promise;
    };

    global.putSettings = function(appId,masterKey,categoryName,settingsObject){
        var q=$q.defer();
        
        var data = new FormData();
        data.append('key', masterKey);
        data.append('settings', JSON.stringify(settingsObject));

        var xhttp = new XMLHttpRequest();
        xhttp.onload  = function() {
          if(xhttp.readyState == 4 && xhttp.status == 200) {
            if(xhttp.responseText){
              var resp=JSON.parse(xhttp.responseText);
              q.resolve(resp);
            }            
          }else{
            q.reject(xhttp.responseText);
          }
        };
        xhttp.open("PUT", SERVER_URL+'/settings/'+appId+'/'+categoryName, true);        
        xhttp.send(data);

        return  q.promise;
     };

    return global;

}]);
