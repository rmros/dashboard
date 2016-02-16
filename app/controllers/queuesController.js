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
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='queues';
  $scope.firstVisit=true;

  //Queues Specific
  $scope.showCreateQueueBox=false;
  $scope.queueList=[];
  $scope.queueListLoading=true;
  $scope.activatedQueue=[];
  $scope.selectedQueue={};
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
    var index=$scope.queueList.indexOf(queue);

    if(index!=$scope.previousIndex){
      if($scope.previousIndex==0 || $scope.previousIndex>0){
        $scope.activatedQueue.splice($scope.previousIndex,1);
        var prevQ=$scope.queueList[$scope.previousIndex];
        $scope.selectedQueue[prevQ.id]=false;
      }

      $scope.previousIndex=index; 
      $scope.activatedQueue[index]=queue;
      $scope.selectedQueue[queue.id]=true;
      $scope.messagesLoading=true;
      $scope.messagesError=null;         

      queueService.getAllMessages(queue)
      .then(function(list){ 
        $scope.queueMessagesList=list; 
        $scope.messagesLoading=false;
      }, function(error){ 
        $scope.messagesLoading=false;        
        $scope.messagesError=error;        
      });
    }
    
  };

  $scope.editQueueACL=function(queue){
    var index=$scope.queueList.indexOf(queue);    
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
        $scope.activatedQueue.splice(index,1);
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

      if($scope.newMessage.expires){
        $scope.newMessage.expires=new Date($scope.newMessage.expires);
      } 

      $scope.queueModalError=null; 
      $scope.addMsgSpinner=true;

      queueService.insertMessageIntoQueue($scope.activatedQueue[$scope.previousIndex],$scope.newMessage.msg,$scope.newMessage.timeout,$scope.newMessage.delay,$scope.newMessage.expires)
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

  $scope.initEditMessage=function(msgObj){
    $scope.requestedIndex=$scope.queueMessagesList.indexOf(msgObj);
    $scope.requestedMessage=angular.copy(msgObj);
    $("#md-editmsg").modal();
  };

  $scope.editMessage=function(){    
    if($scope.requestedMessage.message){

      if($scope.requestedMessage.expires){
        $scope.requestedMessage.expires=new Date($scope.requestedMessage.expires);
      }

      $scope.queueModalError=null;              
      $scope.editMsgSpinner=true;
      
      queueService.editMessage($scope.activatedQueue[$scope.previousIndex],$scope.requestedMessage)
      .then(function(resp){

        $scope.queueMessagesList[$scope.requestedIndex]=resp;

        $("#md-editmsg").modal("hide");     

        $scope.queueModalError=null;              
        $scope.editMsgSpinner=false;
        $scope.requestedMessage=null;
        $scope.requestedIndex=null;

      }, function(error){  
        $scope.queueModalError=error; 
        $scope.editMsgSpinner=false;       
      });

    }else{
      $scope.queueModalError="Message shoudn't be empty";
    }
  };


  $scope.initDeleteMessage=function(msgObj){
    $scope.requestedMessage=msgObj;
    $("#md-deletemsg").modal();
  };

  $scope.deleteMessage=function(){
    var index=$scope.queueMessagesList.indexOf($scope.requestedMessage);

    $scope.queueModalError=null;              
    $scope.deleteMsgSpinner=true;

    queueService.deleteMsgById($scope.activatedQueue[$scope.previousIndex],$scope.requestedMessage.id)
    .then(function(resp){

      $("#md-deletemsg").modal("hide");     

      $scope.queueMessagesList.splice(index,1);
      $scope.queueModalError=null;              
      $scope.deleteMsgSpinner=false;
       $scope.requestedMessage=null;

    }, function(error){  
      $scope.queueModalError=error; 
      $scope.deleteMsgSpinner=false;       
    });
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
        $scope.openQueueDetails($scope.queueList[0]); 
      }
     
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

