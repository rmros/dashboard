app.controller('queuesController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
function($scope,
$rootScope,
$stateParams,
$location,
projectService){	    

  
  var id;
  $rootScope.isFullScreen=false;
  $rootScope.page='queues';

  //Queues Specific
  $scope.showCreateQueueBox=false;
  $scope.queueList=[];
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB();                   
    }else{
      loadProject(id);              
    }
  };  

  $scope.createQueue=function(){
    var rt={id:2};
    $scope.queueList.push(rt);
  };

  $scope.openCreateQueueBox=function(){
    if($scope.showCreateQueueBox==false){
      $scope.showCreateQueueBox=true;
    }
  };

  $scope.closeCreateQueueBox=function(){
    if($scope.showCreateQueueBox==true){
      $scope.showCreateQueueBox=false;
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
        }                              
      }, function(error){          
      });
    }
    
  }

  function initCB(){
    CB.CloudApp.init($rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }    				
		
}]);
