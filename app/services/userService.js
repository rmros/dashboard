angular.module('CloudBoostDashboard')
.factory('userService', ['$q','$http',function ($q,$http) {

    var global = {};

    global.signUp=function(name,email,password,isAdmin){
      var q=$q.defer();
      $http.post(serverURL+'/user/signup', {name:name,email:email,password:password,isAdmin:isAdmin}).
        success(function(data, status, headers, config) {
              q.resolve(data);

              if(!__isDevelopment){
                /****Tracking*********/                
                 mixpanel.alias(data._id);

                 mixpanel.people.set({ "Name": data.name,"$email": data.email});
                 //mixpanel.identify(data._id);

                 mixpanel.register({ "Name": data.name,"Email": data.email});
                 mixpanel.track('AdminUserSignup', { "Name": data.name,"Email": data.email});
                /****End of Tracking*****/
              }
              
        }).
        error(function(data, status, headers, config) {
            q.reject(data);
        });
      return q.promise;
    }

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

      global.getUserBySkipLimit = function(skip,limit){
        var q=$q.defer();       

        $http.get(serverURL+'/user/list/'+skip+'/'+limit).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

      global.updateUserActive = function(userId,isActive){
        var q=$q.defer();       

        $http.get(serverURL+'/user/active/'+userId+'/'+isActive).
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

       global.updateUserRole = function(userId,isAdmin){
            var q=$q.defer();       

            $http.get(serverURL+'/user/changerole/'+userId+'/'+isAdmin).
             success(function(data, status, headers, config) {
                q.resolve(data);
             }).
             error(function(data, status, headers, config) {
                q.reject(data);
             });
           
            return  q.promise;
       };


        global.deleteUser = function(userId){
            var q=$q.defer();
            $http.delete(serverURL+'/user/'+userId).
            success(function(data, status, headers, config) { 
                q.resolve(status);                 
            }).
            error(function(data, status, headers, config) {
                q.reject(status);
                if(status===401){
                  $rootScope.logOut();
                }
            });

            return  q.promise;
        };

        global.getUserByIdByAdmin = function(email){
            var q=$q.defer();
            $http.post(serverURL+'/user/byadmin',{email:email}).
            success(function(data, status, headers, config) { 
                q.resolve(data);                 
            }).
            error(function(data, status, headers, config) {
                q.reject(status);
                if(status===401){
                  $rootScope.logOut();
                }
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

    return global;

}]);