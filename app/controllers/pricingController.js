app.controller('pricingController',
	['$scope','$rootScope','$stateParams','projectService','paymentService',
	function($scope,$rootScope,$stateParams,projectService,paymentService){
		
	var id;
	$scope.rt=true;
	var data = [
		    {
		        value: 300,
		        color:"#F7464A",
		        highlight: "#FF5A5E",
		        label: "Red"
		    },
		    {
		        value: 50,
		        color: "#46BFBD",
		        highlight: "#5AD3D1",
		        label: "Green"
		    }
		];

	// For a pie chart
	var ctx = $("#circle-donut").get(0).getContext("2d");
	window.myDoughnut = new Chart(ctx).Doughnut(data, {responsive : true});	

	//credit card info
	$scope.creditcardInfo={	 
	  "object": "card",
	  "number":null,  
	  "exp_month":null,
	  "exp_year":null,
	  "cvc":null,
	  "name":null,	
	  "address_line1": null,
	  "address_line2": null,
	  "address_city": null,
	  "address_state": null,
	  "address_zip": null,
	  "address_country": null	  
	};
		
	$scope.init = function(){
		$rootScope.page='pricing';
		id = $stateParams.appId;
      	if($rootScope.currentProject && $rootScope.currentProject.appId === id){
         //if the same project is already in the rootScope, then dont load it. 
          getCrediCardInfo();             
        }else{
          loadProject(id);              
        }
        
	};	

	$scope.creditCardModal=function(){
		$("#credit-card").modal();		
	};

	$scope.addOrEditCreditCard=function(){
		$("#credit-card").modal("hide");
		
		if(!isNaN($scope.creditcardInfo.number) && $scope.creditcardInfo.number.length==16){

			paymentService.addOrEditCreditCard($scope.creditcardInfo).then(
                 function(data){
                 	if(data){
                 		var number="************"+data.stripeCardObject.last4;
                  	
	                  	$scope.creditcardInfo.number=number;
	                  	$scope.creditcardInfo.cvc=null;
	                  	$scope.creditcardInfo.name=data.stripeCardObject.name;

	                  	$scope.creditcardInfo.exp_month=data.stripeCardObject.exp_month;
	                  	$scope.creditcardInfo.exp_year=data.stripeCardObject.exp_year;   

	                  	$scope.creditcardInfo.address_line1=data.stripeCardObject.address_line1;
	                  	$scope.creditcardInfo.address_line2=data.stripeCardObject.address_line2;

	                  	$scope.creditcardInfo.address_city=data.stripeCardObject.address_city;
	                  	$scope.creditcardInfo.address_state=data.stripeCardObject.address_state;
	                  	$scope.creditcardInfo.address_zip=data.stripeCardObject.address_zip;
	                  	$scope.creditcardInfo.address_country=data.stripeCardObject.address_country;

                 		$.gritter.add({
	                      position: 'top-right',
	                      title: 'Success',
	                      text: 'Your Credit information is safe with us.',
	                      class_name: 'success'
	                    });  
                 	}                                      
                 },
                 function(error){                    
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Error',
                      text: 'We cannot Add/Edit your credit card info at this point in time. Please try again later.',
                      class_name: 'danger'
                    });
                });

		}else{
			$.gritter.add({
              position: 'top-right',
              title: 'Error',
              text: 'Please Enter the proper Card number.',
              class_name: 'danger'
            });
		}

	};

	/* PRIVATE FUNCTIONS */

        function loadProject(id){

            projectService.getProject(id).then(
             function(currentProject){
                  if(currentProject){
                    $rootScope.currentProject=currentProject; 
                    getCrediCardInfo();                           
                  }                              
             },
             function(error){
                 
                $.gritter.add({
                    position: 'top-right',
                    title: 'Error',
                    text: "We cannot load your project at this point in time. Please try again later.",
                    class_name: 'danger'
                });
             }
           );
        } 	


        function getCrediCardInfo(){

           paymentService.getCrediCardInfo().then(
               function(data){
                if(data){
                  	console.log(data);

                  	var number="************"+data.stripeCardObject.last4;

                  	$scope.creditcardInfo.number=number;
                  	$scope.creditcardInfo.cvc=null;
                  	$scope.creditcardInfo.name=data.stripeCardObject.name;

                  	$scope.creditcardInfo.exp_month=data.stripeCardObject.exp_month;
                  	$scope.creditcardInfo.exp_year=data.stripeCardObject.exp_year;   

                  	$scope.creditcardInfo.address_line1=data.stripeCardObject.address_line1;
                  	$scope.creditcardInfo.address_line2=data.stripeCardObject.address_line2;

                  	$scope.creditcardInfo.address_city=data.stripeCardObject.address_city;
                  	$scope.creditcardInfo.address_state=data.stripeCardObject.address_state;
                  	$scope.creditcardInfo.address_zip=data.stripeCardObject.address_zip;
                  	$scope.creditcardInfo.address_country=data.stripeCardObject.address_country;
                }  	
                  	                   
               }, function(error){                                             
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Error',
                      text: "We cannot load your Credit Card Info at this point in time. Please try again later.",
                      class_name: 'danger'
                  });
               });
        }     

				
		
}]);
