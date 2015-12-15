angular.module('CloudBoostDashboard')
.factory('userService', ['$q','$http',function ($q,$http) {

    var global = {};

     global.logOut = function(){
        var q=$q.defer();

        $http.post(serverURL+'/user/logout').
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });

        return  q.promise;

      };

      global.getUserInfo = function(){
        var q=$q.defer();       

        $http.get(serverURL+'/user').
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

      global.updateUserInfo = function(name,oldPassword,newPassword){
        var q=$q.defer(); 

        var newData={};
        newData.name=name;
        newData.oldPassword=oldPassword;
        newData.newPassword=newPassword;
        
        $http.post(serverURL+'/user/update',newData).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

      global.upsertFile = function(file){
        var q=$q.defer();

        var fd = new FormData();
        fd.append('file', file);

        $http.post(serverURL+'/file',fd,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;

      }; 

      global.deleteFileById = function(fileId){
        var q=$q.defer();       

        $http.delete(serverURL+'/file/'+fileId).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      }; 

       global.getUserListByIds = function(IdArray){
        var q=$q.defer();       

        $http.post(serverURL+'/user/list',{IdArray:IdArray}).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

    return global;

}]);