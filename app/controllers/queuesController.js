app.controller('queuesController',
['$scope',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'queueService',
function($scope,
$rootScope,
$stateParams,
$location,
projectService,
queueService){	    

  
  var id;
  $rootScope.isFullScreen=false;
  $rootScope.page='queues';

  //Queues Specific
  $scope.showCreateQueueBox=false;
  $scope.queueList=[];
  $scope.queueSettings=[];
  $scope.newQueueType="pull";//Default
  $scope.creatingQueue=false;
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB(); 
      getAllQueues();
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                    
    }else{
      loadProject(id);              
    }
  };  

  $scope.createQueue=function(){
    if($scope.newQueueName){
      $scope.creatingQueue=true;
      queueService.createQueue($scope.newQueueName,$scope.newQueueType)
      .then(function(queueObj){
        $scope.queueList.push(queueObj);
        $scope.creatingQueue=false; 
        $scope.newQueueName=null;                                   
      }, function(error){ 
        $scope.creatingQueue=false; 
        errorNotify(error);        
      });
    }
    
  };

  $scope.initAddNewMessage=function(){
    $("#md-addnewmsg").modal();
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

  $scope.closeQueueSettings=function(index){
    if($scope.queueSettings[index]==true){
      $scope.queueSettings[index]=false;
    }
  };

  function getAllQueues(){
    queueService.getAllQueues()
    .then(function(list){
      $scope.queueList=list;                                   
    }, function(error){      
      errorNotify(error);        
    });
  }

  //Private Functions
  function loadProject(id){
    
    if($rootScope.currentProject){
      initCB();
      getAllQueues()      
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB();
          getAllQueues()   
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;         
        }                              
      }, function(error){          
      });
    }
    
  }

  function initCB(){
    CB.CloudApp.init($rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }

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
