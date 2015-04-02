app.controller('pricingController',
	['$scope','$rootScope','$stateParams','projectService','paymentService','invoiceService',
	function($scope,$rootScope,$stateParams,projectService,paymentService,invoiceService){
		
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
	$scope.cardAddEditText="Securely Add CreditCard";
	$scope.cardAddEditBtn="Add Credit Card";	
	$scope.spendingLimitBtn="Add Spending Limit";
	$scope.autoScale=false;
	$scope.isCardAdded=false;
	

	$scope.init = function(){
		$rootScope.page='pricing';
		id = $stateParams.appId;
      	if($rootScope.currentProject && $rootScope.currentProject.appId === id){
         //if the same project is already in the rootScope, then dont load it.            
          getinvoiceSettings();                                      
        }else{
          loadProject(id);              
        }
        
	};	

	$scope.removeSpendingLimit=function(){
		$scope.invoiceSettings.spendingLimit=0;
		$scope.addOrRemoveSpendingLimit(true);
	};

	$scope.spendingLimitModal=function(){
		$("#spending-limit").modal();
		$scope.tempInvoiceSettings=angular.copy($scope.invoiceSettings);			
	};

	$scope.addOrRemoveSpendingLimit=function(valid){
		if(valid){
			if($scope.isCardAdded){
				$scope.spendingLimitSpinner=true;
				invoiceService.addOrRemoveSpendingLimit($rootScope.currentProject.appId,$scope.invoiceSettings.spendingLimit).then(
	             function(data){
	             	$("#spending-limit").modal("hide");
	             	$scope.spendingLimitSpinner=false; 

	             	if(data){                		
	             		$scope.invoiceSettings=data;

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
	                      title: 'Success',
	                      text: 'Your Spending Limit is successfully saved.',
	                      class_name: 'success'
	                    });  

	             	}  
	             	                                   
	             },
	             function(error){   
	             	$("#spending-limit").modal("hide");
	             	$scope.spendingLimitSpinner=false; 
	             	$scope.invoiceSettings=$scope.tempInvoiceSettings;
	             	                
	                $.gritter.add({
	                  position: 'top-right',
	                  title: 'Error',
	                  text: 'Cannot add/Remove Spending Limit at this point of time.',
	                  class_name: 'danger'
	                });
	            });
			}else{
				$("#spending-limit").modal("hide");
				$scope.spendingLimitSpinner=false; 				
				$scope.invoiceSettings=$scope.tempInvoiceSettings;				

				$.gritter.add({
	              position: 'top-right',
	              title: 'Warning',
	              text: 'Please Add CrediCard to add Spending Limit.',
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
			                      title: 'Success',
			                      text: 'Your Credit information is successfully saved and safe with us.',
			                      class_name: 'success'
			                    });  
		                 	}                                      
		                 },
		                 function(error){                    
		                    $.gritter.add({
		                      position: 'top-right',
		                      title: 'Error',
		                      text: error,
		                      class_name: 'danger'
		                    });
		                });

				}else{

					$.gritter.add({
		              position: 'top-right',
		              title: 'Error',
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
	              title: 'Warning',
	              text: 'Please Add CrediCard before you make Autoscale ON.',
	              class_name: 'prusia'
	            });
	            $scope.autoScale=false;

			}else if($scope.invoiceSettings.spendingLimit>0){
				$.gritter.add({
	              position: 'top-right',
	              title: 'Warning',
	              text: 'Remove Spending Limit to make AutoScale ON.',
	              class_name: 'prusia'
	            });

	            $scope.autoScale=false;
			}
		}else{ // to be false confidtions 
			if($scope.invoiceSettings.spendingLimit==0){
				$.gritter.add({
	              position: 'top-right',
	              title: 'Warning',
	              text: 'Please Add Spending Limit before you make Autoscale OFF.',
	              class_name: 'prusia'
	            });
	            $scope.autoScale=true;
			}
		}		
		
	};

	/* PRIVATE FUNCTIONS */

        function loadProject(id){

            projectService.getProject(id).then(
             function(currentProject){
                  if(currentProject){
                    $rootScope.currentProject=currentProject; 
                    getinvoiceSettings();                               			                          
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
                	console.log("na");
                	$scope.cardAddEditText="Securely Add CreditCard";
                	$scope.cardAddEditBtn="Add Credit Card";
                	$scope.isCardAdded=false;
                	$scope.autoScale=false;                	
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

        function getinvoiceSettings(){
        	invoiceService.getinvoiceSettings($rootScope.currentProject.appId).then(
               function(data){
                if(data){
                  	$scope.invoiceSettings=data;
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
                  	                } 
                getinvoice();//Get Invoice 

               }, function(error){                                             
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Error',
                      text: 'Cannot get Invoice Settings at this point of time.',
                      class_name: 'danger'
                  });
               });
          
        }

        function getinvoice(){
        	invoiceService.getinvoice($rootScope.currentProject.appId).then(
               function(data){
                if(data){
                  	$scope.invoice=data;
                  	$scope.currentInvoice=data.currentInvoice;

                  	$scope.nextBillingCycle=nextBillingCycleDays();
                  	spendingLimitCircle();//Spending Limit Cicle Graph
                  	getCrediCardInfo();//Get Card Info                	
                } 	                   
               }, function(error){                                             
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Error',
                      text:'Cannot Show Invoice at this point of time.',
                      class_name: 'danger'
                  });
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
				validation.message='Please Enter the proper Card number with No Letters and Spaces.';

				return validation;
			}
			if(!Stripe.card.validateExpiry($scope.creditcardInfo.exp_month, $scope.creditcardInfo.exp_year)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='Please Enter the proper Expiry Month and Year.';
				
				return validation;
			} 
			
			if(!Stripe.card.validateCVC($scope.creditcardInfo.cvc)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='Please Enter the valid CVC.';
				
				return validation;				
			}
			if(!Stripe.card.cardType($scope.creditcardInfo.number)){
				$scope.validCardShowSpinner=false;
				$("#credit-card").modal("hide");

				validation.isValid=false;
				validation.message='The Entered card type is Unknown, we accept Visa, MasterCard, American Express, Discover, Diners Club, and JCB';
				
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
        	}

	        var data = [
	        	{
			        value: used,
			        color: "#B3B3BC",
			        highlight:"#B3B3BC",
			        label: "USED"
			    },
			    {
			        value: left,
			        color:"#00CC00",
			        highlight: "#00CC00",
			        label: "LEFT"
			    }			    
			];
			// For a pie chart
			var ctx = $("#circle-donut").get(0).getContext("2d");
			window.myDoughnut = new Chart(ctx).Doughnut(data, {responsive : true});	
		}

		
}]);
