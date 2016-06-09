app.controller('cacheController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'cacheService',
'$timeout',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
cacheService,
$timeout){	    

  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='cache';
  $scope.firstVisit=true;

  //Cache Specific
  $scope.cacheListLoading=true;
  $scope.showCreateCacheBox=false;
  $scope.newCacheName=null;
  $scope.createCacheSpinner=false;
  $scope.cacheList=[];
  $scope.cacheItemCount=[];
  $scope.cacheSettings=[];
  $scope.activeCache=[];

  //Item Specific
  $scope.cacheItemsList=[];
  $scope.showInputForEdit=[]; 
  $scope.editableItem=[];
  $scope.holdItem=[];
  $scope.itemSpinner=[];
  $scope.itemError=[];
  $scope.itemSaved=[];

  //Modal specific
  $scope.confirmCacheName=null;
  $scope.confirmSpinner=false;
  $scope.cacheModalError=null;  

  $scope.newItem={
    key:null,
    value:null
  };
  
  $scope.init= function() {            
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      initCB(); 
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;
      getAllCaches();                   
    }else{
      loadProject(id);              
    }
  };  

  $scope.initCreateCache=function(){
    $("#md-createcachemodel").modal();
  };

  $scope.createCache=function(){
    if($scope.newCacheName){
      $scope.cacheModalError=null;

      $scope.createCacheSpinner=true;
      cacheService.createCache($scope.newCacheName)
      .then(function(newCache){
        if(newCache){
          $scope.cacheList.push(newCache);
        }
        $scope.createCacheSpinner=false;
        $scope.newCacheName=null;
        $scope.firstVisit=false;
        $("#md-createcachemodel").modal("hide");

        if($scope.cacheList.length==1){
          $scope.openCacheDetails($scope.cacheList[0]);
        }
                                     
      }, function(error){ 
        $scope.createCacheSpinner=false;
        $scope.cacheModalError=error;         
      });

    }else{
      $scope.cacheModalError="Empty Cache name";
    }
  };

  $scope.openCacheDetails=function(cache){
    var index=$scope.cacheList.indexOf(cache);

    if(index!=$scope.previousIndex){
      
      if($scope.previousIndex==0 || $scope.previousIndex>0){
        $scope.activeCache.splice($scope.previousIndex,1);
      }

      $scope.previousIndex=index;    
      $scope.activeCache[index]=cache;
      $scope.activeCacheSize=angular.copy(cache.size);      

      $scope.cacheItemsList=[];
      $scope.itemsLoading=true;
      $scope.itemsError=null;

      //Get Cache Items
      cacheService.getAllCacheItems(cache)
      .then(function(items){
        $scope.cacheItemsList=items;        
        $scope.itemsLoading=false;
      }, function(error){  
        $scope.itemsLoading=false;
        $scope.itemsError=error;          
      });
    }    

  }; 

  $scope.addNewItem=function(){
    if($scope.newItem.key && $scope.newItem.value){

      $scope.cacheModalError=null; 
      $scope.confirmSpinner=true;
      cacheService.upsertItem($scope.activeCache[$scope.previousIndex],$scope.newItem)
      .then(function(resp){       

        $scope.cacheItemsList.push($scope.newItem);
        ++$scope.cacheItemCount[$scope.previousIndex];

        $scope.confirmSpinner=false; 
        $scope.newItem={
          key:null,
          value:null
        };
        $scope.deletableCache=null;

        getCacheInfo($scope.activeCache[$scope.previousIndex]);
      }, function(error){  
        $scope.cacheModalError=error; 
        $scope.confirmSpinner=false;       
      });

    }else{
      $scope.cacheModalError="Key,Value shoudn't be empty";
    }
  };

  $scope.initEditItem=function(item){     
    var index=$scope.cacheItemsList.indexOf(item);
    $scope.showInputForEdit[index]=true; 
    $scope.editableItem[index]=angular.copy(item.value);  
    $scope.holdItem[index]=angular.copy(item.value);      
  };

  $scope.updateItem=function(item){
    var index=$scope.cacheItemsList.indexOf(item);
    $scope.showInputForEdit[index]=false;

    var updateObj={};
    updateObj.key=item.key;
    updateObj.value=$scope.editableItem[index];

    $scope.cacheItemsList[index].value=$scope.editableItem[index];

    $scope.itemSpinner[index]=true;
    $scope.itemError[index]=null;
    cacheService.upsertItem($scope.activeCache[$scope.previousIndex],updateObj)
    .then(function(resp){
      $scope.cacheItemsList[index].value=resp;
      $scope.itemSpinner[index]=false;
      $scope.itemSaved[index]=true;
      $timeout(function(){ 
        $scope.itemSaved[index]=false;         
      }, 1500);

      getCacheInfo($scope.activeCache[$scope.previousIndex]);
    }, function(error){   
      $scope.cacheItemsList[index].value=angular.copy($scope.holdItem[index]); 
      $scope.itemSpinner[index]=false;
      $scope.itemError[index]=error;        
    });
  };

  $scope.deleteItem=function(item){
    var index=$scope.cacheItemsList.indexOf(item);

    var updateObj={};
    updateObj.key=item.key;
    updateObj.value=null;

    $scope.itemSpinner[index]=true;
    $scope.itemError[index]=null;
    cacheService.deleteItem($scope.activeCache[$scope.previousIndex],updateObj)
    .then(function(resp){
      $scope.cacheItemsList.splice(index,1);
      $scope.itemSpinner.splice(index,1);
            
      --$scope.cacheItemCount[$scope.previousIndex];
      getCacheInfo($scope.activeCache[$scope.previousIndex]);
    }, function(error){ 
      $scope.itemSpinner[index]=true;
      $scope.itemError[index]=null;               
    });
  };

  $scope.initDeleteCache=function(cacheObj){    
    $scope.deletableCache=cacheObj;
    $scope.confirmCacheName=null;
    $("#md-deletecache").modal();
  };

  $scope.deleteCache=function(){
    if($scope.confirmCacheName==$scope.deletableCache.name){

      var index=$scope.cacheList.indexOf($scope.deletableCache);

      $scope.cacheModalError=null; 
      $scope.confirmSpinner=true;
      cacheService.deleteCache($scope.deletableCache)
      .then(function(resp){

        $("#md-deletecache").modal("hide");  
        $scope.cacheList.splice(index,1);
        $scope.activeCache.splice(index,1);

        $scope.confirmSpinner=false; 
        $scope.confirmCacheName=null;
        $scope.deletableCache=null;

        if($scope.cacheList.length==0){
          $scope.firstVisit=true;
        }

      }, function(error){  
        $scope.cacheModalError=error; 
        $scope.confirmSpinner=false;       
      });

    }else{
      $scope.cacheModalError="Cache Name doesn't match";
    }
  };

  $scope.initClearCache=function(cacheObj){
    $scope.clearableCache=cacheObj;
    $scope.confirmCacheName=null;
    $("#md-clearcache").modal();
  }; 

  $scope.clearCache=function(){
    if($scope.confirmCacheName==$scope.clearableCache.name){

      var index=$scope.cacheList.indexOf($scope.clearableCache);

      $scope.cacheModalError=null; 
      $scope.confirmSpinner=true;
      cacheService.clearCache($scope.clearableCache)
      .then(function(resp){
        $("#md-clearcache").modal("hide");  
        $scope.cacheItemCount[index]=0;

        if($scope.activeCache[index] && ($scope.activeCache[index].name==$scope.clearableCache.name)){
          $scope.cacheItemsList=[];
        }

        $scope.confirmSpinner=false; 
        $scope.confirmCacheName=null;
        $scope.clearableCache=null;

        

      }, function(error){  
        $scope.cacheModalError=error; 
        $scope.confirmSpinner=false;       
      });

    }else{
      $scope.cacheModalError="Cache Name doesn't match";
    }
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
          getAllCaches();          
        }                              
      }, function(error){          
      });
    }
    
  }

  function getAllCaches(){      
    $scope.cacheListLoading=true; 
    cacheService.getAllCaches()
    .then(function(list){
      $scope.cacheList=list;      
      $scope.cacheListLoading=false; 

      //get Cache Items Count
      if(list.length){
        var promises=[];
        for(var i=0;i<list.length;++i){
          promises.push(cacheService.getItemsCount(list[i]));
        }

        $q.all(promises).then(function(itemCountList){
          for(var i=0;i<list.length;++i){
            $scope.cacheItemCount[i]=itemCountList[i];
          }
        },function(){
        });  
      }

      if($scope.cacheList.length>0){
        $scope.firstVisit=false;
         $scope.openCacheDetails($scope.cacheList[0]); 
      }      

    },function(error){
      $scope.cacheListError=error; 
      $scope.cacheListLoading=false;           
    });    
    
  }  

  function getCacheInfo(cache){  
    cacheService.getCacheInfo(cache)
    .then(function(cache){      
      $scope.activeCacheSize=cache.size;
    },function(error){                
    });
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  
 				
		
}]);
