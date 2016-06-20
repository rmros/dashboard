app.controller('fileBrowserController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'fileService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
fileService){	
  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='files'; 


  $scope.orderBy="createdAt"; 
  $scope.orderByType="desc";  
  $scope.docsLimit=10;
  $scope.totalRecords=0;  
  $scope.loadingRecords=false;
  $scope.fileAllowedTypes="*";

  $scope.rootFolder=null;
  $scope.currentPath=null;
  $scope.foldersList=[];
  
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

  $scope.openFolder=function(folder){
    if(folder && folder.id && folder.document._type=="folder"){
      $scope.rootFolder=folder;
      if(!$scope.currentPath){
        $scope.currentPath=folder.name;
      }else{
        $scope.currentPath=$scope.currentPath.concat("/"+folder.name);
      }       
      $scope.foldersList=[];
      getAllFolders(false,folder.id,null,null,$scope.docsLimit,0);
    }    
  };

  $scope.selectFolder=function(folder){
    $scope.selectedFolder=folder;
  };

  $scope.deleteFolder=function(){
    if($scope.selectedFolder && $scope.selectedFolder.id){
      fileService.deleteFolder($scope.selectedFolder).then(function(resp){

        var index;
        for(var i=0;i<$scope.foldersList.length;++i){
          if($scope.foldersList[i].id==$scope.selectedFolder.id){
            index=i;
            break;
          }
        }

        if(index && index>-1){
          $scope.foldersList.splice(index,1);
        }
        
        $scope.selectedFolder=null;

      },function(error){
      });
    }
  };


  $scope.initUploadFile=function(){    
    $scope.metaData={
      path:$scope.currentPath
    };
    $scope.editFile=null;
    $("#md-fileviewer").modal();
  };

  $scope.setAndSaveFile=function(fileObj){
    $("#md-fileviewer").modal("hide");
    $scope.foldersList.push(fileObj);
  };

  $scope.addMoreFolders=function(){
    $scope.loadingRecords=true;
    var folderId=null;
    if($scope.rootFolder && $scope.rootFolder.id){
      folderId=$scope.rootFolder.id;
    }
    getAllFolders(true,folderId,null,null,4,$scope.totalRecords).then(function(list){
      $scope.loadingRecords=false;
    },function(error){
      $scope.loadingRecords=false;
    });
  };

  $scope.kuljaOpen=function(){
    console.log("sdsdjfgdh");
  };

  $scope.expandSearchFn=function(){
    $scope.expandSearch=true;
  };

  $scope.shrinkSearchFn=function(){
    $scope.expandSearch=false;
  };

  //Private Functions
  function loadProject(id){
    
    projectService.getProject(id)
    .then(function(currentProject){
      if(currentProject){
        $rootScope.currentProject=currentProject;
        $rootScope.pageHeaderDisplay=$rootScope.currentProject.name; 
        initCB(); 
        getAllFolders(false,null,null,null,$scope.docsLimit,0);                         
      }                              
    }, function(error){          
    });    
  }

  function getAllFolders(isAppend, folderId, orderBy, orderByType, limit, skip){
    var q=$q.defer();

    fileService.getAllFoldersBy(folderId, orderBy, orderByType, limit, skip).then(function(list){
      if(list && list.length>0){
        if($scope.foldersList.length>0 && isAppend){
          $scope.foldersList=$scope.foldersList.concat(list); 
        }else{
          $scope.foldersList=list;
        }
        $scope.totalRecords=$scope.totalRecords+list.length;
      }

      q.resolve(list);
    },function(error){
      q.reject(error);
    });

    return  q.promise;
  }

  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }  				
		
}]);
