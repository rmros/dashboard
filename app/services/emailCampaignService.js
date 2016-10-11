app.factory('emailCampaignService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.sendCampaign = function(appId,masterKey,subject,body){
        var q=$q.defer();

        var data = new FormData();     
        data.append('key', masterKey);
        data.append('emailBody', body); 
        data.append('emailSubject', subject);        

        var xhttp = new XMLHttpRequest();
        xhttp.onload  = function() {
          if(xhttp.readyState == 4 && xhttp.status == 200) {
            q.resolve(true);
          }else if(xhttp.status != 200){
            q.reject(xhttp.responseText);
          }
        };
        xhttp.open("POST", SERVER_URL+"/email/"+appId+"/campaign", true);        
        xhttp.send(data);

        return  q.promise;
    };
    
    return global;

}]);
