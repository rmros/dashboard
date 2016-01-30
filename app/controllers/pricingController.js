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
		promises.push(analyticsService.getStatisticsByAppId(id,null,null));
		promises.push(analyticsService.getStatisticsByAppId(id,"Object","Search"));
		promises.push(analyticsService.getStatisticsByAppId(id,"Object","Queues"));

		$q.all(promises).then(function(dataList){

			//API
			if(dataList[0]){
				$scope.apiUsage=dataList[0];		
				var apiObj=angular.copy(_sanitizeGraph(dataList[0]));
				$scope.apiUsage.totalApiCount=apiObj.apiCount;
				$scope.apiUsage.totalCost=apiObj.totalCost;

				$scope.apiLabels=angular.copy(apiObj.labels);				
				$scope.apiData=angular.copy([apiObj.data]);	
				$scope.apiUsage.displayGraph=true;
			}else{
				var defParams={
					totalApiCount:0,
					totalCost:0,
					category:"API",
					displayGraph:false
				};
				$scope.apiUsage=defParams;
			}			

			//Search
			if(dataList[1]){
				$scope.searchUsage=dataList[1];	
				$scope.searchUsage.category="Search";	
				var searchObj=angular.copy(_sanitizeGraph(dataList[1]));
				$scope.searchUsage.totalApiCount=searchObj.apiCount;
				$scope.searchUsage.totalCost=searchObj.totalCost;

				$scope.searchLabels=angular.copy(searchObj.labels);
				$scope.searchData=angular.copy([searchObj.data]);
				$scope.searchUsage.displayGraph=true;
			}else{
				var defParams={
					totalApiCount:0,
					totalCost:0,
					category:"Search",
					displayGraph:false
				};
				$scope.searchUsage=defParams;
			}			

			//Queues
			if(dataList[2]){
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
			}			

			$scope.usageSpinner=false;
		},function(error){			
			$scope.usageSpinner=false;
		});	
	}

	function _sanitizeGraph(data){
		data.totalApiCount=$filter('number')(data.totalApiCount);
		data.totalCost=$filter('number')(data.totalCost);		

		var labels=_.pluck(data.usage, '_id');
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
		var apiCountData=_.pluck(data.usage, 'apiCount');		

		var response={};
		response.apiCount=data.totalApiCount;
		response.totalCost=data.totalCost;
		response.labels=newLabels;
		response.data=apiCountData;
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
