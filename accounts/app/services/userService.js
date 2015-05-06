
app.service('userService', function($q,$http){

     this.signUp=function(name,email,password){
        var q=$q.defer();
        $http.post(serverURL+'/auth/register', {name:name,email:email,password:password}).
          success(function(data, status, headers, config) {
                q.resolve(data);

                /****Tracking*********/                
                 mixpanel.alias(data._id);

                 mixpanel.people.set({ "Name": data.name,"$email": data.email});
                 //mixpanel.identify(data._id);

                 mixpanel.register({ "Name": data.name,"Email": data.email});
                 mixpanel.track('Signup', { "Name": data.name,"Email": data.email});
                /****End of Tracking*****/
          }).
          error(function(data, status, headers, config) {
                q.reject(data);
          });
        return q.promise;
    }

    this.logIn=function(email,password){
       var q=$q.defer();

       $http.post(serverURL+'/auth/signin', {email:email,password:password}).
         success(function(data, status, headers, config) {          
           q.resolve(data);

            /****Tracking*********/
             mixpanel.identify(data._id);
             mixpanel.register({ "Name": data.name,"Email": data.email});
             mixpanel.track('LogIn', { "Name": data.name,"Email": data.email});
            /****End of Tracking*****/

         }).
         error(function(data, status, headers, config) {
            q.reject(data);
         });

       return q.promise;
   };

   this.requestResetPassword = function(email){
      var q=$q.defer();

       $http.post(serverURL+'/auth/requestResetPassword', {email:email}).
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

       $http.post(serverURL+'/auth/resetPassword', {code:code, password:newPass}).
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

       $http.post(serverURL+'/auth/activate', {code:code}).
         success(function(data, status, headers, config) {
           console.log(data);
           q.resolve(data);
         }).
         error(function(data, status, headers, config) {
               q.reject(data);
         });


       return q.promise;
   }



   this.facebookSignUp=function(){
      var q=$q.defer();

      $http.get(serverURL+'/auth/facebook').
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

     $http.get(serverURL+'/auth/google').
       success(function(data, status, headers, config) {
             q.resolve(data);
       }).
       error(function(data, status, headers, config) {
             q.reject(data);
       });
     return q.promise;
 }

});
