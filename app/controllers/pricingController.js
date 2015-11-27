app.controller('pricingController',
	['$scope',
	'$rootScope',
	'$stateParams',
	'projectService',
	'paymentService',
	'invoiceService',
	'$timeout',
	function($scope,
	$rootScope,
	$stateParams,
	projectService,
	paymentService,
	invoiceService,
	$timeout){
		
	var id;

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

	$scope.validCardShowSpinner=false;
	$scope.spendingLimitSpinner=false;
	$scope.cardAddEditText="Add Credit Card";
	$scope.cardAddEditBtn="Add Credit Card";	
	$scope.spendingLimitBtn="Add Spending Limit";
	$scope.autoScale=false;
	$scope.isCardAdded=false;
	$rootScope.isFullScreen=false;	

	$scope.init = function(){
		$rootScope.page='pricing';
		id = $stateParams.appId;

      	if($rootScope.currentProject && $rootScope.currentProject.appId === id){
         //if the same project is already in the rootScope, then dont load it.            
          getinvoiceSettings();
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                                        
        }else{
          loadProject(id);              
        }

	};	

	$scope.removeSpendingLimit=function(){
		$scope.invoiceSettings.spendingLimit=0;
		$scope.addOrRemoveSpendingLimit(true);
	};

	$scope.spendingLimitModal=function(){
		$("#remove-spendinglimit-alert").modal("hide");
		$scope.tempInvoiceSettings=angular.copy($scope.invoiceSettings);
		$("#spending-limit").modal();
					
	};
	$scope.cancelSpendingLimitModal=function(){
		$scope.invoiceSettings=$scope.tempInvoiceSettings;		
	};

	$scope.addOrRemoveSpendingLimit=function(valid){
		if(valid){
			if($scope.isCardAdded){
				$scope.spendingLimitSpinner=true;
				invoiceService.addOrRemoveSpendingLimit($rootScope.currentProject.appId,$scope.invoiceSettings.spendingLimit)
				.then(function(data){
	             	$("#spending-limit").modal("hide");
	             	$scope.spendingLimitSpinner=false; 

	             	if(data){                		
	             		$scope.invoiceSettings=data;
	             		$scope.tempSpendingLimit=angular.copy(data.spendingLimit);

	             		if(data.spendingLimit>0){
	                  		$scope.autoScale=false;
	                  		$scope.spendingLimitBtn="Manage Spending Limit";	                  		
	                  		spendingLimitCircle();
	                  		
	                  	}else if(data.spendingLimit==0){
	                  		$scope.spendingLimitBtn="Add Spending Limit";	                  	
	                  		if($scope.isCardAdded){
	                  			$scope.autoScale=true;
	                  		}else{
	                  			$scope.autoScale=false;
	                  		}	                  		
	                  	}

	             		$.gritter.add({
	                      position: 'top-right',
	                      title: 'Spending Limit Saved.',
	                      text: 'Your Spending Limit is successfully saved.',
	                      class_name: 'success'
	                    });  

	             	}  
	             	                                   
	             },
	             function(error){   
	             	$("#spending-limit").modal("hide");
	             	$scope.spendingLimitSpinner=false; 
	             	$scope.invoiceSettings=$scope.tempInvoiceSettings;
					$scope.tempSpendingLimit=angular.copy($scope.invoiceSettings.spendingLimit);
	             	                
	                $.gritter.add({
	                  position: 'top-right',
	                  title: 'Opps! something went wrong',
	                  text: 'Cannot add / remove spending limit at this point of time.',
	                  class_name: 'danger'
	                });
	            });
			}else{
				$("#spending-limit").modal("hide");
				$scope.spendingLimitSpinner=false; 				
				$scope.invoiceSettings=$scope.tempInvoiceSettings;
				$scope.tempSpendingLimit=angular.copy($scope.invoiceSettings.spendingLimit);				

				$.gritter.add({
	              position: 'top-right',
	              title: 'Add Credit Card.',
	              text: 'Please add credit card to add spending limit.',
	              class_name: 'prusia'
	            });
			}		

		}		
	};
	$scope.creditCardModal=function(){
		$("#credit-card").modal();		
	};

	$scope.addOrEditCreditCard=function(valid){		
		if(valid){

				$scope.validCardShowSpinner=true;	
				var validation=validateCrediCardInfo();

				if(validation.isValid){

					paymentService.addOrEditCreditCard($scope.creditcardInfo).then(
		                 function(data){
		                 	if(data){
		                 		$scope.isCardAdded=true;
		                 		$scope.validCardShowSpinner=false;
		                 		$("#credit-card").modal("hide");

		                 		var number="************"+data.stripeCardObject.last4;
		                  	
			                  	$scope.creditcardInfo.number=number;
			                  	$scope.creditcardInfo.cvc="###";
			                  	$scope.creditcardInfo.name=data.stripeCardObject.name;

			                  	$scope.creditcardInfo.exp_month=data.stripeCardObject.exp_month;
			                  	$scope.creditcardInfo.exp_year=data.stripeCardObject.exp_year;   

			                  	$scope.creditcardInfo.address_line1=data.stripeCardObject.address_line1;
			                  	$scope.creditcardInfo.address_line2=data.stripeCardObject.address_line2;

			                  	$scope.creditcardInfo.address_city=data.stripeCardObject.address_city;
			                  	$scope.creditcardInfo.address_state=data.stripeCardObject.address_state;
			                  	$scope.creditcardInfo.address_zip=data.stripeCardObject.address_zip;
			                  	$scope.creditcardInfo.address_country=data.stripeCardObject.address_country;

			                  	$scope.cardAddEditText="Securely Update CreditCard";
			                  	$scope.cardAddEditBtn="Edit Credit Card";
			                  	$scope.isCardAdded=true;

			                  	if($scope.invoiceSettings && $scope.invoiceSettings.spendingLimit>0){                  		
			                  		$scope.autoScale=false;
			                  	}else{
			                  		$scope.autoScale=true;
			                  	}

		                 		$.gritter.add({
			                      position: 'top-right',
			                      title: 'Credit Card Added',
			                      text: 'Credit card added successfully. ',
			                      class_name: 'success'
			                    });  
		                 	}                                      
		                 },
		                 function(error){                    
		                    $.gritter.add({
		                      position: 'top-right',
		                      title: 'Sorry!',
		                      text: error,
		                      class_name: 'danger'
		                    });
		                });

				}else{

					$.gritter.add({
		              position: 'top-right',
		              title: 'Incorrect Input',
		              text: validation.message,
		              class_name: 'danger'
		            });
				}

		}
	};

	$scope.toggleAutoScale=function(autoScale){		
		
		if(autoScale){//to be true conditions
			if(!$scope.isCardAdded){
				$.gritter.add({
	              position: 'top-right',
	              title: 'Add Credit Card.',
	              text: 'Please add your credit card before you turn auto-scale on',
	              class_name: 'prusia'
	            });
	            $scope.autoScale=false;

			}else if($scope.invoiceSettings.spendingLimit>0){
				$.gritter.add({
	              position: 'top-right',
	              title: 'Remove Spending Limit.',
	              text: 'Remove spending limit to turn on the auto-scale feature.',
	              class_name: 'prusia'
	            });
	            $scope.autoScale=false;

	            //Open Remove Spending Limit Alert
	            $timeout(function(){ 
        			$("#remove-spendinglimit-alert").modal();
           		},2000);
	            
			}
		}else{ // to be false confidtions 
			if($scope.invoiceSettings.spendingLimit==0){
				$.gritter.add({
	              position: 'top-right',
	              title: 'Add Spending Limit.',
	              text: 'Before yoru turn off the auto-scale, Please add spending limit.',
	              class_name: 'prusia'
	            });
	            $scope.autoScale=true;
			}
		}		
		
	};

	/* PRIVATE FUNCTIONS */

        function loadProject(id){
            projectService.getProject(id)
            .then(function(currentProject){
                if(currentProject){
	                $rootScope.currentProject=currentProject; 
	                getinvoiceSettings(); 
	                $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                                			                          
                }                              
            },function(error){              
                errorNotify("We cannot load your project at this point in time. Please try again later.");
            });
        } 	


        function getCrediCardInfo(){

           paymentService.getCrediCardInfo()
           .then(function(data){
                if(data){               	
                		
                  	var number="************"+data.stripeCardObject.last4;

                  	$scope.creditcardInfo.number=number;
                  	$scope.creditcardInfo.cvc="###";
                  	$scope.creditcardInfo.name=data.stripeCardObject.name;

                  	$scope.creditcardInfo.exp_month=data.stripeCardObject.exp_month;
                  	$scope.creditcardInfo.exp_year=data.stripeCardObject.exp_year;   

                  	$scope.creditcardInfo.address_line1=data.stripeCardObject.address_line1;
                  	$scope.creditcardInfo.address_line2=data.stripeCardObject.address_line2;

                  	$scope.creditcardInfo.address_city=data.stripeCardObject.address_city;
                  	$scope.creditcardInfo.address_state=data.stripeCardObject.address_state;
                  	$scope.creditcardInfo.address_zip=data.stripeCardObject.address_zip;
                  	$scope.creditcardInfo.address_country=data.stripeCardObject.address_country;

                  	$scope.cardAddEditText="Securely Update CreditCard";
                  	$scope.cardAddEditBtn="Edit Credit Card";
                  	$scope.isCardAdded=true;                 
                  	

                  	if($scope.invoiceSettings.spendingLimit>0){
                  		$scope.autoScale=false;                  		                 		                  		
                  	}else if($scope.invoiceSettings.spendingLimit==0){             		
                  		if($scope.isCardAdded){
                  			$scope.autoScale=true;
                  		}else{
                  			$scope.autoScale=false;
                  		}
                  	}            	               
                  	
                }else{
                	
                	$scope.cardAddEditText="Securely Add CreditCard";
                	$scope.cardAddEditBtn="Add Credit Card";
                	$scope.isCardAdded=false;
                	$scope.autoScale=false;                	
                }  	
                  	                   
               }, function(error){                 
                  errorNotify("We cannot load your credit card at this point in time. Please try again later.");
               });
        }     

        function getinvoiceSettings(){
        	invoiceService.getinvoiceSettings($rootScope.currentProject.appId)
        	.then(function(data){
                if(data){
                  	$scope.invoiceSettings=data;
                  	$scope.tempSpendingLimit=angular.copy(data.spendingLimit);

                  	if(data.spendingLimit>0){
                  		$scope.autoScale=false;
                  		$scope.spendingLimitBtn="Manage Spending Limit"; 
                  		                 		                  		
                  	}else if(data.spendingLimit==0){                  		
                  		$scope.spendingLimitBtn="Add Spending Limit"
                  		if($scope.isCardAdded){
                  			$scope.autoScale=true;
                  		}else{
                  			$scope.autoScale=false;
                  		}                  		
                  	}  
                  	getinvoice();//Get Invoice 	                 	               	
                }                

            }, function(error){                
                errorNotify('We cannot get your payment info at this point in time. Please try again later.');
            });
          
        }

        function getinvoice(){
        	invoiceService.getinvoice($rootScope.currentProject.appId)
        	.then(function(data){
                if(data){
                  	$scope.invoice=data;
                  	$scope.currentInvoice=data.currentInvoice;

                  	$scope.nextBillingCycle=nextBillingCycleDays();
                  	spendingLimitCircle();//Spending Limit Cicle Graph
                  	getCrediCardInfo();//Get Card Info                	
                } 	                   
            }, function(error){  
            	errorNotify('We cannot get your payment info at this point in time. Please try again later.');                 
            });

          
        }

		function validateCrediCardInfo(){
			var validation={
				isValid:true,
				message:null
			};

			if(!Stripe.card.validateCardNumber($scope.creditcardInfo.number)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='Please enter card number with no letters, spaces and special characters.';

				return validation;
			}
			if(!Stripe.card.validateExpiry($scope.creditcardInfo.exp_month, $scope.creditcardInfo.exp_year)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='Please enter the correct month and year of expiry';
				
				return validation;
			} 
			
			if(!Stripe.card.validateCVC($scope.creditcardInfo.cvc)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='Please enter the valid CVC.';
				
				return validation;				
			}
			if(!Stripe.card.cardType($scope.creditcardInfo.number)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='The card is unknown. We accept Visa, MasterCard, American Express, Discover, Diners Club, and JCB';
				
				return validation;				
			}

			return validation;
        }

        function nextBillingCycleDays(){
			var one_day=1000*60*60*24;
          	var today = new Date();
          	var nxtMonth = new Date();
          	var month=today.getMonth(); 

          	today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0); 
            today=new Date(today);                  	

          	if(month==11){
          		month=0;
          	}else{
          		month=month+1;
          	}

          	nxtMonth.setMonth(month);
            nxtMonth.setDate(1);
            nxtMonth.setHours(0);
            nxtMonth.setMinutes(0);
            nxtMonth.setSeconds(0);
            nxtMonth=new Date(nxtMonth);

            today=today.getTime();
            nxtMonth=nxtMonth.getTime();
            var diff=Math.round((nxtMonth-today)/one_day);

            return diff;
        }

        function spendingLimitCircle(){ 

        
        	if($scope.invoiceSettings && $scope.invoiceSettings.spendingLimit>=$scope.invoice.currentInvoice){
        		var left=$scope.invoiceSettings.spendingLimit-$scope.invoice.currentInvoice;        		
        		var used=$scope.invoice.currentInvoice;
        		$scope.creditLeft=left;    		  			


	  			$timeout(function () {

				    $scope.labels= ["LEFT","USED"];
	  				$scope.data = [left, used];
	  				$scope.colours=["#00CC00","#B3B3BC"];
	  				$scope.$broadcast("$reload", {});

				}, 3000);

				$scope.$on('create', function (chart) {		  					  
				});	  			
        	}        	      	
	        
		}

		//Notification
		function errorNotify(errorMsg){
		  $.amaran({
		      'theme'     :'colorful',
		      'content'   :{
		         bgcolor:'#EE364E',
		         color:'#fff',
		         message:errorMsg
		      },
		      'position'  :'top right'
		  });
		}

		function successNotify(successMsg){
		  $.amaran({
		      'theme'     :'colorful',
		      'content'   :{
		         bgcolor:'#19B698',
		         color:'#fff',
		         message:successMsg
		      },
		      'position'  :'top right'
		  });
		}

		function WarningNotify(WarningMsg){
		  $.amaran({
		      'theme'     :'colorful',
		      'content'   :{
		         bgcolor:'#EAC004',
		         color:'#fff',
		         message:WarningMsg
		      },
		      'position'  :'top right'
		  });
		}    

		
}]);
