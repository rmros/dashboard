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
  $scope.firstVisit=true;

  //Queues Specific
  $scope.showCreateQueueBox=false;
  $scope.queueList=[];
  $scope.queueListLoading=true;
  $scope.queueSettings=[];
  $scope.activeQueue=[];
  $scope.queueMessagesList=[];
  $scope.newQueueType="pull";//Default
  $scope.creatingQueue=false;
  $scope.openMsgAdvanceOptions=false;
  
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

  $scope.initCreateQueue=function(){
    $("#md-createqueuemodel").modal();
  };

  $scope.createQueue=function(){
    if($scope.newQueueName){
      $scope.queueModalError=null;
      $scope.creatingQueue=true;
      queueService.createQueue($scope.newQueueName,$scope.newQueueType)
      .then(function(queueObj){
        $scope.queueList.push(queueObj);
        $scope.creatingQueue=false; 
        $scope.newQueueName=null;
        $scope.firstVisit=false;
        $("#md-createqueuemodel").modal("hide");                                   
      }, function(error){ 
        $scope.creatingQueue=false; 
        $scope.queueModalError=error;       
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

      $scope.messagesLoading=true;
      $scope.messagesError=null;          

      queueService.getQueueInfo(queue)
      .then(function(queueInfo){        
        $scope.activeQueue[index]=queueInfo; 
        $scope.queueMessagesList=queueInfo.messages; 
        $scope.messagesLoading=false;
      }, function(error){         
        $scope.messagesError=error;        
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

  $scope.initDeleteQueue=function(queue){
    $scope.deletableQueue=queue;
    $scope.confirmQueueName=null;
    $("#md-deletequeue").modal();
  };

  $scope.deleteQueue=function(){
    if($scope.confirmQueueName==$scope.deletableQueue.name){

      var index=$scope.queueList.indexOf($scope.deletableQueue);     

      $scope.queueModalError=null; 
      $scope.confirmSpinner=true;
      queueService.deleteQueue($scope.deletableQueue)
      .then(function(resp){
        $scope.queueList.splice(index,1);
        $scope.activeQueue.splice(index,1);
        $("#md-deletequeue").modal("hide");

        $scope.confirmSpinner=false; 
        $scope.confirmQueueName=null;
        $scope.deletableQueue=null;

      }, function(error){       
        $scope.queueModalError=error; 
        $scope.confirmSpinner=false;         
      });

    }else{
      $scope.queueModalError="Queue Name doesn't match";
    }
  };

  $scope.initAddNewMessage=function(){
    $scope.newMessage={
      msg:null,
      timeout:null,
      delay:null,
      expires:null,
    };

    $("#md-addnewmsg").modal();
  };

  $scope.addNewMessage=function(){
    if($scope.newMessage.msg){

      $scope.queueModalError=null; 
      $scope.addMsgSpinner=true;

      queueService.insertMessageIntoQueue($scope.activeQueue[$scope.previousIndex],$scope.newMessage.msg,$scope.newMessage.timeout,$scope.newMessage.delay,$scope.newMessage.expires)
      .then(function(resp){

        $("#md-addnewmsg").modal("hide");

        if(!$scope.queueMessagesList){
          $scope.queueMessagesList=[];
        }

        $scope.queueMessagesList.push(resp);
        $scope.queueModalError=false; 
        $scope.newMessage=null;        
        $scope.addMsgSpinner=false; 
      }, function(error){  
        $scope.queueModalError=error; 
        $scope.addMsgSpinner=false;       
      });

    }else{
      $scope.queueModalError="Message shoudn't be empty";
    }

  };  

  $scope.initEditMessage=function(){
    $("#md-editmsg").modal();
  };

  $scope.initDeleteMessage=function(msgObj){
    $scope.requestedMessage=msgObj;
    $("#md-deletemsg").modal();
  };

  $scope.deleteMessage=function(){
    var index=$scope.queueMessagesList.indexOf($scope.requestedMessage);

    $scope.queueModalError=null;              
    $scope.deleteMsgSpinner=true;

    queueService.deleteMsgById($scope.activeQueue[$scope.previousIndex],$scope.requestedMessage.id)
    .then(function(resp){

      $("#md-deletemsg").modal("hide");     

      $scope.queueMessagesList.splice(index,1);
      $scope.queueModalError=null;              
      $scope.deleteMsgSpinner=false;

    }, function(error){  
      $scope.queueModalError=error; 
      $scope.deleteMsgSpinner=false;       
    });
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

  $scope.toggleMsgAdvanceOptions=function(){
    if($scope.openMsgAdvanceOptions==true){
      $scope.openMsgAdvanceOptions=false;
    }else{
      $scope.openMsgAdvanceOptions=true;
    }
  };

  function getAllQueues(){
    $scope.queueListLoading=true;
    queueService.getAllQueues()
    .then(function(list){
      $scope.queueList=list;

      $scope.queueListLoading=false;
      if($scope.queueList.length>0){
        $scope.firstVisit=false; 
      }

      /*list[0].push("como estas nawaz bhai", {
        success : function(queueMessage){
         console.log(queueMessage);  
        }, error : function(error){
          console.log(error);
        }
      }); */

    }, function(error){  
      $scope.queueListLoading=false;    
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
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }           
    
}]);

