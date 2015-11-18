app.controller('cacheController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'cacheService',
function($scope,
$rootScope,
$stateParams,
$location,
projectService,
cacheService){	    

  
  var id;
  $rootScope.isFullScreen=false;
  $rootScope.page='cache';

  //Queues Specific
  $scope.showCreateCacheBox=false;
  $scope.cacheList=[];
  $scope.cacheSettings=[];
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB(); 
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                   
    }else{
      loadProject(id);              
    }
  };  

  $scope.createQueue=function(){
    var rt={id:2};
    $scope.cacheList.push(rt);
  };


  $scope.initAddNewItem=function(){
    $("#md-addnewitem").modal();
  }; 

  $scope.initDeleteCache=function(){
    $("#md-deletecache").modal();
  };

  $scope.initClearCache=function(){
    $("#md-clearcache").modal();
  };   

  $scope.closeCacheSettings=function(index){
    if($scope.cacheSettings[index]==true){
      $scope.cacheSettings[index]=false;
    }
  };

  //Private Functions
  function loadProject(id){
    
    if($rootScope.currentProject){
      initCB();      
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB(); 
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;          
        }                              
      }, function(error){          
      });
    }
    
  }

  function initCB(){
    CB.CloudApp.init($rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }    				
		
}]);
