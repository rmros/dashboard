app.controller('queuesController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'queueService',
'sharedDataService',
'tableService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
queueService,
sharedDataService,
tableService){      

  
  var id;
  $rootScope.isFullScreen=false;
  $rootScope.page='queues';

  //Queues Specific
  $scope.showCreateQueueBox=false;
  $scope.queueList=[];
  $scope.queueSettings=[];
  $scope.activeQueue=[];
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

  $scope.openQueueDetails=function(queue){
    if($scope.previousIndex==0 || $scope.previousIndex>0){
      $scope.activeQueue.splice($scope.previousIndex,1);
    }

    var index=$scope.queueList.indexOf(queue);

    if(index!=$scope.previousIndex){
      $scope.previousIndex=index;           

      queueService.getQueueInfo(queue)
      .then(function(queueInfo){        
        $scope.activeQueue[index]=queueInfo; 
      }, function(error){       
        errorNotify(error);        
      });
    }
    
  };

  $scope.editQueueACL=function(queue){
    var index=$scope.queueList.indexOf(queue);
    $scope.closeQueueSettings(index);
    $scope.editableQueue=queue;   
      
    sharedDataService.aclObject=queue.ACL;
    $("#md-queueaclviewer").modal();  
  };

  $scope.saveQueueACL=function(updatedQueueACL){
    $("#md-queueaclviewer").modal("hide"); 
    $scope.editableQueue.ACL=updatedQueueACL;
    sharedDataService.aclObject=null;

    queueService.updateQueue($scope.editableQueue)
    .then(function(resp){
      var index=$scope.queueList.indexOf($scope.editableQueue);
      $scope.queueList[index].ACL=updatedQueueACL;
      $scope.editableQueue=null;
    }, function(error){       
      errorNotify(error);        
    });
  };

  $scope.deleteQueue=function(queue){
    var index=$scope.queueList.indexOf(queue);
    $scope.closeQueueSettings(index);

    queueService.deleteQueue(queue)
    .then(function(resp){
      $scope.queueList.splice(index,1); 
    }, function(error){       
      errorNotify(error);        
    });
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

  $scope.openQueueSettings=function(index){
    if(!$scope.queueSettings[index] || $scope.queueSettings[index]==false){
      $scope.queueSettings[index]=true;
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

      /*list[0].push("como estas nawaz bhai", {
        success : function(queueMessage){
         console.log(queueMessage);  
        }, error : function(error){
          console.log(error);
        }
      }); */

    }, function(error){      
      errorNotify(error);        
    });
  }

  //Private Functions
  function loadProject(id){
    
    if($rootScope.currentProject){
      initCB();
      getAllQueues();
      getProjectTables();      
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB();
          getAllQueues();
          getProjectTables();   
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;         
        }                              
      }, function(error){          
      });
    }
    
  }

  function getProjectTables(){
  var promises=[];  

  if(!$rootScope.currentProject.tables || $rootScope.currentProject.tables.length==0){    
    promises.push(tableService.getProjectTables());     
  }  

  $q.all(promises).then(function(list){
    if(list.length==1){      
      $rootScope.currentProject.tables=list[0];           
    }
  }, function(err){      
  });

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