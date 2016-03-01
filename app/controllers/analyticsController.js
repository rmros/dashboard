app.controller('analyticsController',
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
	$rootScope.showAppPanel=true;
	$rootScope.isFullScreen=false;	

	$scope.analyticsTabs={
		api:true,
		storage:false
	};

	$scope.init = function(){
		$rootScope.page='analytics';
		id = $stateParams.appId;

		$scope.pricingPlans=pricingPlans;
      	if($rootScope.currentProject && $rootScope.currentProject.appId === id){        
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name; 
          _loadUsage();                                       
        }else{
          loadProject(id);              
        }
                
	};	


	/* PRIVATE FUNCTIONS */

    function loadProject(id){
        projectService.getProject(id)
        .then(function(currentProject){
            if(currentProject){
                $rootScope.currentProject=currentProject;                 
                $rootScope.pageHeaderDisplay=$rootScope.currentProject.name; 
                _loadUsage();                               			                          
            }                              
        },function(error){              
            errorNotify("We cannot load your project at this point in time. Please try again later.");
        });
    } 	   


    function _loadUsage() {

    	//APP PLAN
    	var appPlan=null;
	    var app=$rootScope.currentProject;
	    if(!app.planId || app.planId==1){
	      appPlan=1;
	    }else if(app.planId){
	      appPlan=app.planId;
	    }

	    var appPlan=_.first(_.where($scope.pricingPlans, {id: appPlan}));
	    var databaseUsage=_.first(_.where(appPlan.usage, {category: "DATABASE"}));

	    var planApiLimit=_.first(_.where(databaseUsage.features, {name: "API Calls"}));
	    var apiLimit=planApiLimit.limit.value;
	    

	    var planStorageLimit=_.first(_.where(databaseUsage.features, {name: "Storage"})); 
	    var storageLimit=planStorageLimit.limit.value; 
	    storageLimit=storageLimit*1000;
	    //APP PLAN
   

		$scope.usageSpinner=true;

		var promises=[];
		promises.push(analyticsService.apiUsage(id));
		promises.push(analyticsService.storageUsage(id));		

		$q.all(promises).then(function(dataList){			

			//API
			if(dataList[0]){
				$scope.apiUsage=dataList[0];

				var apiData=angular.copy(_sanitizeApiGraph(dataList[0]));
								
				$scope.apiData= [{
		            "key" : "API Calls" ,
		            "values" : apiData
		        }];	

				$scope.apiUsage.categoryName="API";
				$scope.apiUsage.displayGraph=true;
				$scope.apiUsage.options = {
		            chart: {
		                type: 'stackedAreaChart',
		                height: 360,
		                margin : {
		                    top: 30,
		                    right: 20,
		                    bottom: 30,
		                    left: 40
		                },
		                x: function(d){return d[0];},
		                y: function(d){return d[1];},	
		                	               
		                useVoronoi: false,
		                clipEdge: true,
		                duration: 100,
		                useInteractiveGuideline: true,
		                xAxis: {
		                    showMaxMin: false,
		                    tickFormat: function(d) {
		                        return d3.time.format('%x')(new Date(d))
		                    }
		                },
		                yAxis: {		                	
		                    tickFormat: function(d){
		                        return d3.format(',.2f')(d);
		                    }
		                },
		                zoom: {
		                    enabled: true,
		                    scaleExtent: [1, 10],
		                    useFixedDomain: false,
		                    useNiceScale: false,
		                    horizontalOff: false,
		                    verticalOff: true,
		                    unzoomEventType: 'dblclick.zoom'
		                },		                
		                showControls:false,		                
		                margin:{"left":55}
		            }
		            
		        };
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

				var storageData=angular.copy(_sanitizeStorageData(dataList[1]));			

				$scope.storageData = [{
		            "key" : "Space Consumed" ,
		            "values" : storageData
		        }];

				$scope.storageUsage.categoryName="Storage";
				$scope.storageUsage.displayGraph=true;

				$scope.storageUsage.options = {
		            chart: {
		                type: 'stackedAreaChart',
		                height: 360,
		                margin : {
		                    top: 20,
		                    right: 20,
		                    bottom: 30,
		                    left: 40
		                },
		                x: function(d){return d[0];},
		                y: function(d){return d[1];},	
		                	               
		                useVoronoi: false,
		                clipEdge: true,
		                duration: 100,
		                useInteractiveGuideline: true,
		                xAxis: {
		                    showMaxMin: false,
		                    tickFormat: function(d) {
		                        return d3.time.format('%x')(new Date(d))
		                    }
		                },
		                yAxis: {		                	
		                    tickFormat: function(d){
		                        return d3.format(',.2f')(d);
		                    }
		                },
		                zoom: {
		                    enabled: true,
		                    scaleExtent: [1, 10],
		                    useFixedDomain: false,
		                    useNiceScale: false,
		                    horizontalOff: false,
		                    verticalOff: true,
		                    unzoomEventType: 'dblclick.zoom'
		                },		                
		                showControls:false,
		                yDomain:[0,storageLimit],
		                margin:{"left":55}
		            }
		            
		        };

			}else{
				var defParams={
					totalStorage:0,										
					categoryName:"Storage",
					displayGraph:false
				};
				$scope.storageUsage=defParams;
			}		

			$scope.usageSpinner=false;
		},function(error){			
			$scope.usageSpinner=false;
		});       
	
	}

	function _sanitizeApiGraph(data){			
		var responseData=[];
		for(var i=0;i<data.usage.length;++i){
			var dateAndValue=[];
			dateAndValue.push(data.usage[i].timeStamp,data.usage[i].dayApiCount);
			responseData.push(dateAndValue);
		}
		return responseData;	
	}

	function _sanitizeStorageData(data){			
		var responseData=[];
		for(var i=0;i<data.usage.length;++i){
			var dateAndValue=[];
			dateAndValue.push(data.usage[i].timeStamp,data.usage[i].size);
			responseData.push(dateAndValue);
		}
		return responseData;
	}
      

    $scope.toggleTabs=function(tabName){
	    if(tabName=="api"){
	      $scope.analyticsTabs.api=true;
	      $scope.analyticsTabs.storage=false;     
	    }else if(tabName=="storage"){
	      $scope.analyticsTabs.api=false;
	      $scope.analyticsTabs.storage=true;
	    }
	};  

		
}]);
