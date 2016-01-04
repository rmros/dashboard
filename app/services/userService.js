angular.module('CloudBoostDashboard')
.factory('userService', ['$q','$http',function ($q,$http) {

    var global = {};

    global.signUp=function(name,email,password,isAdmin){
      var q=$q.defer();
      $http.post(frontendServerURL+'/user/signup', {name:name,email:email,password:password,isAdmin:isAdmin}).
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

        $http.post(frontendServerURL+'/user/logout').
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

        $http.get(frontendServerURL+'/user').
         success(function(data, status, headers, config) {
            q.resolve(data);
         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });
       
        return  q.promise;
      };

      global.getUserBySkipLimit = function(skip,limit,skipUserIds){
        var q=$q.defer();       

        $http.put(frontendServerURL+'/user/list/'+skip+'/'+limit,{skipUserIds:skipUserIds}).
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

        $http.get(frontendServerURL+'/user/active/'+userId+'/'+isActive).
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

            $http.get(frontendServerURL+'/user/changerole/'+userId+'/'+isAdmin).
             success(function(data, status, headers, config) {
                q.resolve(data);
             }).
             error(function(data, status, headers, config) {
                q.reject(data);
             });
           
            return  q.promise;
       };


        global.searchDevelopers = function(keyword){
            var q=$q.defer();
            $http.post(frontendServerURL+'/user/list/bykeyword', {keyword:keyword}).
             success(function(data, status, headers, config) {
               q.resolve(data);
             }).
             error(function(data, status, headers, config) {
                var erroObj={
                  data:data,
                  status:status
                };
                q.reject(erroObj);
                if(status===401){
                  $rootScope.logOut();
                }
             });

             return  q.promise;
        };

        global.deleteUser = function(userId){
            var q=$q.defer();
            $http.delete(frontendServerURL+'/user/'+userId).
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
            $http.post(frontendServerURL+'/user/byadmin',{email:email}).
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
        
        $http.post(frontendServerURL+'/user/update',newData).
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

        $http.post(frontendServerURL+'/file',fd,{
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

        $http.delete(frontendServerURL+'/file/'+fileId).
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

        $http.post(frontendServerURL+'/user/list',{IdArray:IdArray}).
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