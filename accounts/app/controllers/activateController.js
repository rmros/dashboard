app.controller('activateController',
  ['$scope','$location','userService','$rootScope',
  function($scope,$location,userService,$rootScope){
     
    $scope.init=function(){   
        $scope.showSpinner=true;
        if($location.search().code){

          userService.activate($location.search().code).then(function(data){
            $scope.showSpinner=false;
            $scope.err = "Thank you! We successfully activated your account.";
             
            $.cookie('userId', data._id, { path: '/' });
            $.cookie('userFullname', data.name, { path: '/' });
            $.cookie('email', data.email, { path: '/' });
            $.cookie('createdAt', data.createdAt, { path: '/' });

            window.location.href=dashboardURL;
            
          }, function(error){
              $scope.showSpinner=false;
              $scope.err = "We're sorry, but we can't activate your account at this point in time. Please try again later";                
          });
          
        }else{
          $scope.showSpinner=false;
          $scope.err = "We're sorry, We can't activate your account at this point in time. Please try again later";
        }        
        trackMixpanel();
    }

    function trackMixpanel(){
      if(!__isDevelopment){
        /****Tracking*********/          
         mixpanel.track('Portal:Visited Activation Page', { "Visited": "Visited Activation page in portal!"});
        /****End of Tracking*****/
      } 
    }

   
 }]);
