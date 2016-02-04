app.controller('pricingController',
	['$scope',
	'$rootScope',
	'$stateParams',
	'projectService',
	'paymentService',	
	'$timeout',
	'analyticsService',
	'$filter',
	'$q',
	function($scope,
	$rootScope,
	$stateParams,
	projectService,
	paymentService,	
	$timeout,
	analyticsService,
	$filter,
	$q){
		
	var id;

	$rootScope.isFullScreen=false;	

	$scope.init = function(){
		$rootScope.page='pricing';
		id = $stateParams.appId;

      	if($rootScope.currentProject && $rootScope.currentProject.appId === id){        
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                                        
        }else{
          loadProject(id);              
        }
        _loadUsage();
	};	


	/* PRIVATE FUNCTIONS */

    function loadProject(id){
        projectService.getProject(id)
        .then(function(currentProject){
            if(currentProject){
                $rootScope.currentProject=currentProject;                 
                $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                                			                          
            }                              
        },function(error){              
            errorNotify("We cannot load your project at this point in time. Please try again later.");
        });
    } 	   


    function _loadUsage() {
		$scope.usageSpinner=true;

		var promises=[];
		promises.push(analyticsService.api(id));
		promises.push(analyticsService.storage(id));
		//promises.push(analyticsService.getStatisticsByAppId(id,"Object","Queues"));

		$q.all(promises).then(function(dataList){			

			//API
			if(dataList[0]){
				$scope.apiUsage=dataList[0];

				var apiObj=angular.copy(_sanitizeGraph(dataList[0],"dayApiCount"));
				$scope.apiLabels=angular.copy(apiObj.labels);				
				$scope.apiData=angular.copy([apiObj.data]);	

				$scope.apiUsage.categoryName="API";
				$scope.apiUsage.displayGraph=true;
			}else{
				var defParams={
					totalApiCount:0,					
					categoryName:"API",
					displayGraph:false
				};
				$scope.apiUsage=defParams;
			}

			//Storage
			if(dataList[1]){
				$scope.storageUsage=dataList[1];

				var storageObj=angular.copy(_sanitizeGraph(dataList[1],"size"));
				$scope.storageLabels=angular.copy(storageObj.labels);				
				$scope.storageData=angular.copy([storageObj.data]);	

				$scope.storageUsage.categoryName="Storage";
				$scope.storageUsage.displayGraph=true;
			}else{
				var defParams={
					totalStorage:0,										
					categoryName:"Storage",
					displayGraph:false
				};
				$scope.storageUsage=defParams;
			}			

					

			//Queues
			/*if(dataList[2]){
				$scope.queuesUsage=dataList[2];	
				$scope.searchUsage.category="Queues";	
				var queuesObj=angular.copy(_sanitizeGraph(dataList[2]));
				$scope.queuesUsage.totalApiCount=queuesObj.apiCount;
				$scope.queuesUsage.totalCost=queuesObj.totalCost;

				$scope.queuesLabels=angular.copy(queuesObj.labels);
				$scope.queuesData=angular.copy(queuesObj.data);
				$scope.queuesUsage.displayGraph=true;
			}else{
				var defParams={
					totalApiCount:0,
					totalCost:0,
					category:"Queues",
					displayGraph:false
				};
				$scope.queuesUsage=defParams;
			}*/			

			$scope.usageSpinner=false;
		},function(error){			
			$scope.usageSpinner=false;
		});	
	}

	function _sanitizeGraph(data,dataStringName){			

		var labels=_.pluck(data.usage, 'timeStamp');
		for(var i=0;i<labels.length;++i){				
			labels[i]=new Date(labels[i]);				
		}
		labels=$filter('orderBy')(labels);

		var newLabels=[];
		for(var i=0;i<labels.length;++i){
			
			if((i+1)%2==0){
				newLabels.push("");
			}else{
				var dateFormated=$filter('date')(labels[i], 'MM/dd');
				newLabels.push(dateFormated);	
			}
		}		
		var mainData=_.pluck(data.usage, dataStringName);		

		var response={};		
		response.labels=newLabels;
		response.data=mainData;
		return response;
	}


    function nextBillingCycleDays(){
    	var nxt_year=null;
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
      		nxt_year=today.getFullYear()+1; 
      	}else{
      		month=month+1;
      	}

      	if(nxt_year){
      		nxtMonth.setYear(nxt_year);
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

		
}]);
