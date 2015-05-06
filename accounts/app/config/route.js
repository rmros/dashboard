app.config(
    function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {
        $stateProvider.state('login',
        {
            url:'',
            templateUrl: 'app/views/login.html',
            controller:'loginController'            
        });

        $stateProvider.state('signup',
        {
            url:'/signup',
            templateUrl: 'app/views/signup.html',
            controller:'signupController'            
        }); 

        $stateProvider.state('forgotpassword',
        {
            url:'/forgotpassword',
            templateUrl: 'app/views/forgotpassword.html',
            controller:'forgotPasswordController'            
        }); 

        $stateProvider.state('activation',{
            url:'/activate',
            templateUrl:'app/views/activation.html',
            controller:'activateController'
        });

         //For to enable cross-origin resource sharing
	    $httpProvider.defaults.withCredentials = true;
	  	$httpProvider.defaults.useXDomain = true;
	 	delete $httpProvider.defaults.headers.common['X-Requested-With'];	  	      

    });




