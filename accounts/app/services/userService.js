
app.service('userService', function($q,$http){

    this.signUp=function(name,email,password,isAdmin){
      var q=$q.defer();
      $http.post(frontendServerURL+'/user/signup', {name:name,email:email,password:password,isAdmin:isAdmin}).
        success(function(data, status, headers, config) {
          q.resolve(data);

          if(!__isDevelopment){
            /****Tracking*********/                
             mixpanel.alias(email);

             mixpanel.people.set({ "Name": name,"$email": email});
             //mixpanel.identify(data._id);

             mixpanel.register({ "Name": name,"Email": email});
             mixpanel.track('Signup', { "Name": name,"Email": email});
            /****End of Tracking*****/
          }
              
        }).
        error(function(data, status, headers, config) {
          q.reject(data);
        });
      return q.promise;
    }

    this.logIn=function(email,password){
       var q=$q.defer();

       $http.post(frontendServerURL+'/user/signin', {email:email,password:password}).
         success(function(data, status, headers, config) {          
           q.resolve(data);

            if(!__isDevelopment){
               /****Tracking*********/
               mixpanel.identify(data._id);
               mixpanel.register({ "Name": data.name,"Email": data.email});
               mixpanel.track('LogIn', { "Name": data.name,"Email": data.email});
              /****End of Tracking*****/
            }           

         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });

       return q.promise;
   };

   this.requestResetPassword = function(email){
      var q=$q.defer();

       $http.post(frontendServerURL+'/user/ResetPassword', {email:email}).
         success(function(data, status, headers, config) {
          q.resolve();
         }).
         error(function(data, status, headers, config) {
          q.reject(data);
         });

       return q.promise;
   };

   this.changePassword = function(code,newPass, confirmPass){
      var q=$q.defer();

      if(newPass !== confirmPass){
        q.reject('New password and confirm password do not match');
        return q.promise;
      }

      $http.post(frontendServerURL+'/user/updatePassword', {code:code, password:newPass}).
      success(function(data, status, headers, config) {
        q.resolve();
      }).
      error(function(data, status, headers, config) {
        q.reject(data);
      });

      return q.promise;
      
   };

  this.activate=function(code){
    var q=$q.defer();

    $http.post(frontendServerURL+'/user/activate', {code:code}).
    success(function(data, status, headers, config) {     
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      q.reject(data);
    });

    return q.promise;
  }

  this.resendVerificationEmail=function(email){
    var q=$q.defer();

    $http.post(frontendServerURL+'/user/resendverification', {email:email}).
    success(function(data, status, headers, config) {     
      q.resolve(data);
    }).
    error(function(data, status, headers, config) {
      q.reject(data);
    });

    return q.promise;
  }

  this.facebookSignUp=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/auth/facebook').
    success(function(data, status, headers, config) {
          q.resolve(data);
    }).
    error(function(data, status, headers, config) {
          q.reject(data);
    });

    return q.promise;
  }

  this.googleSignUp=function(){
    var q=$q.defer();

    $http.get(frontendServerURL+'/auth/google').
    success(function(data, status, headers, config) {
         q.resolve(data);
    }).
    error(function(data, status, headers, config) {
         q.reject(data);
    });

    return q.promise;
 }

});
