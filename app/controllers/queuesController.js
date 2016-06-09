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
  $scope.editableQueue=[];  
  $scope.queueSizes=[];

  $scope.queueDataTypes=["Text","JSON"];
  $scope.queueActiveTab="Text";

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

    //Flush Acl data in sharedDataService
    sharedDataService.flushAclArray();
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

        $scope.queueSizes[$scope.queueList.length-1]=0;

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
    $scope.editableQueue.push(queue);   
    
    //Sharing Data through a service         
    sharedDataService.pushAclObject(queue.ACL);    
    $("#md-queueaclviewer").modal();  
  };

  $scope.saveQueueACL=function(updatedQueueACL){
    $("#md-queueaclviewer").modal("hide"); 
    $scope.editableQueue[$scope.editableQueue.length-1].ACL=updatedQueueACL;  
    
    var currentQ=$scope.editableQueue[$scope.editableQueue.length-1];

    var index=$scope.queueList.indexOf(currentQ);
   
    updateQWrapper(currentQ,index)
    .then(function(resp){               
      $scope.queueList[resp.rowIndex].ACL=updatedQueueACL;
      $scope.editableQueue.splice(resp.rowIndex,1);
      sharedDataService.spliceAclObjectByIndex(resp.rowIndex); 
    }, function(errorResp){                         
      sharedDataService.spliceAclObjectByIndex(resp.rowIndex);
      $scope.editableQueue.splice(resp.rowIndex,1);     
      errorNotify(error);    
    });    
  };

  function updateQWrapper(queue,rowIndex){
    var q=$q.defer();

    queueService.updateQueue(queue)
    .then(function(resp){
      var respObj={
        resp:resp,
        rowIndex:rowIndex
      };              
      q.resolve(respObj);
      
    }, function(error){   
      var respObj={
        error:error,
        rowIndex:rowIndex
      };                         
      q.reject(respObj);     
    });   

    return  q.promise; 
  }

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

        $scope.queueSizes.splice(index,1);
        if($scope.queueList.length==0){
          $scope.firstVisit=true;
        }

      }, function(error){       
        $scope.queueModalError=error; 
        $scope.confirmSpinner=false;         
      });

    }else{
      $scope.queueModalError="Queue Name doesn't match";
    }
  };

  $scope.initAddNewMessage=function(){
    $scope.queueActiveTab="Text";    
    $scope.newMessage={
      msg:null,
      timeout:null,
      delay:null,
      expires:null,
    };

    $("#md-addnewmsg").modal();
  };

  $scope.addNewMessage=function(){
    var validate=validateQ($scope.newMessage);
    if(!validate){ 

      if($scope.newMessage.msg){

        if($scope.newMessage.expires){
          $scope.newMessage.expires=new Date($scope.newMessage.expires);
        }        

        if(_isJsonString($scope.newMessage.msg)){
          $scope.newMessage.msg=JSON.parse($scope.newMessage.msg);
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

          $scope.queueSizes[$scope.previousIndex]=++$scope.queueSizes[$scope.previousIndex];         

        }, function(error){  
          $scope.queueModalError=error; 
          $scope.addMsgSpinner=false;       
        });

      }else{
        $scope.queueModalError="Message shoudn't be empty";
      }

    }else{
      $scope.queueModalError=validate;
    }

  };  

  $scope.initEditMessage=function(msgObj){
    $scope.queueActiveTab="Text";    

    $scope.requestedIndex=$scope.queueMessagesList.indexOf(msgObj);
    $scope.requestedMessage=angular.copy(msgObj);    

    if($scope.requestedMessage.expires){
      var date=new Date($scope.requestedMessage.expires).getDate();
      var month=new Date($scope.requestedMessage.expires).getMonth()+1;
      var year=new Date($scope.requestedMessage.expires).getFullYear();
      
      var hours=new Date($scope.requestedMessage.expires).getHours();
      var minutes=new Date($scope.requestedMessage.expires).getMinutes();
      var seconds=new Date($scope.requestedMessage.expires).getSeconds();      

      $scope.requestedMessage.expires=year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;      
    }

    if(_isJsonString($scope.requestedMessage.message)){
      $scope.requestedMessage.message=JSON.parse($scope.requestedMessage.message);      
    }

    if(Object.prototype.toString.call($scope.requestedMessage.message)=="[object Object]" || Object.prototype.toString.call($scope.requestedMessage.message)=="[object Array]"){
      $scope.queueActiveTab="JSON";      
      $scope.requestedMessage.message=JSON.stringify($scope.requestedMessage.message,null,2);
    }     

    $scope.requestedSplDelay=$scope.requestedMessage.delay;
    
    $("#md-editmsg").modal();
  };

  $scope.editMessage=function(){ 
    $scope.requestedMessage.delay=angular.copy($scope.requestedSplDelay);
    $scope.requestedSplDelay=null;

    var validate=validateQ($scope.requestedMessage); 

    if(!validate){
     
      if($scope.requestedMessage.message){

        if(_isJsonString($scope.requestedMessage.message)){
          $scope.requestedMessage.message=JSON.parse($scope.requestedMessage.message);
        }

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
    }else{
      $scope.queueModalError=validate;
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

      $scope.queueSizes[$scope.previousIndex]=--$scope.queueSizes[$scope.previousIndex];

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
      if(list && list.length>0){
        $scope.queueList=list;
      }
      
      $scope.queueListLoading=false;
      if($scope.queueList && $scope.queueList.length>0){
        $scope.firstVisit=false;
        $scope.openQueueDetails($scope.queueList[0]);

        for(var i=0;i<$scope.queueList.length;++i){
          $scope.queueSizes[i]=$scope.queueList[i].size;
        } 
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

  function validateQ(q){
    if(q.timeout){
      q.timeout=parseInt(q.timeout);
      if(!q.timeout){
        return "timeout should be a number";
      }
      if(typeof q.timeout!="number"){
        return "timeout should be a number";
      }          
    }

    if(q.delay){
      q.delay=parseInt(q.delay);
      if(!q.delay){
        return "delay should be a number";
      }
      if(typeof q.delay!="number"){
        return "delay should be a number";
      }       
    }

    if(q.expires && !q.expires instanceof Date){
      return "expires should be a date object";
    }
    return null;
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }           
    
}]);

