'use strict';

app.controller('dataViewController',
function($scope, 
$rootScope,
$q,
$location,
$stateParams,
utilityService,
tableTypeService,
columnDataTypeService,
tableErrorService,
projectService,
tableService,     
$resource,
$timeout,
$filter,
cloudObjectService) {

  var id;
  var tableId;
  $rootScope.isFullScreen=true; 
  $scope.showAddColPopUp=false; 

  $scope.init = function() {      
      id = $stateParams.appId;
      tableId= $stateParams.tableId;
      $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
      if($rootScope.currentProject && $rootScope.currentProject.appId === id){
        //if the same project is already in the rootScope, then dont load it. 
        getProjectTables();              
      }else{
        loadProject(id);              
      }     
  };

  $scope.loadTableData = function(t) {          

    if(t){   
        var query = new CB.CloudQuery(t.name);       
        query.find({success : function(list){ 
          //count no objects                    
          query.count({ success: function(count){ 
            $scope.currentTableData=list;
            $scope.$digest();            
          },error: function(err) {          
          } });
          //count no objects                                  

        }, error : function(error){                
            $.gritter.add({
              position: 'top-right',
              title: 'Opps! something went wrong',
              text: 'We cannot load your data at this point in time. Please try again later.',
              class_name: 'danger'
            });
        }});       
    }                  
          
  };  


  /* PRIVATE FUNCTIONS */

  function loadProject(id){

      projectService.getProject(id)
      .then(function(currentProject){
          if(currentProject){
            $rootScope.currentProject=currentProject;
            initCbApp();
            getProjectTables();                                        
          }                              
      },
      function(error){                         
         $.gritter.add({
              position: 'top-right',
              title: 'Opps! something went wrong',
              text: 'We cannot load your project at this point in time. Please try again later.',
              class_name: 'danger'
          });  
      });
  }

  function getProjectTables(){

   tableService.getProjectTables($rootScope.currentProject)
   .then(function(data){       

      if(!data){
      
        $rootScope.currentProject.tables=[];                       
      }     
      else if(data){                        
          $rootScope.currentProject.tables=data;
          getProjectTableById();
      }else{                                                                   
         $rootScope.currentProject.tables=[];
      }          
           
    }, function(error){                                    
        $.gritter.add({
          position: 'top-right',
          title: 'Opps! something went wrong',
          text: "We cannot load your tables at this point in time. Please try again later.",
          class_name: 'danger'
        });
    });
  } 

  function getProjectTableById(){

    tableService.getProjectTableById(tableId)
    .then(function(table){
        if(table){
            $rootScope.currentProject.currentTable=table; 
            $scope.loadTableData(table);                 
        }
    }, function(error){                         
       $.gritter.add({
            position: 'top-right',
            title: 'Opps! something went wrong',
            text: 'We cannot load your table at this point in time. Please try again later.',
            class_name: 'danger'
        }); 
    });
  }

  function initCbApp(){
    CB.CloudApp.init($rootScope.currentProject.appId,$rootScope.currentProject.keys.master);    
  }

  /*------Partial & Table Definition Functions---------------*/ 

  $scope.goToTables=function(){
    window.location.href="#/"+id+"/data";
  };
  
  $scope.goToDataBrowser=function(t){
    window.location.href="#/"+id+"/data/table/"+t.id;
  };

  $scope.filterDataType=function(dataTypeObj){
    if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation"){
      return dataTypeObj;
    }
  };

  $scope.initiateColumnSettings = function() {
    var newColName="newColumn";
    var incrementor=0;
    (function iterator(i) {
            $scope.checkErrorsForCreate(newColName,$rootScope.currentProject.currentTable.columns,"column");
            if($scope.columnErrorForCreate){
                ++incrementor;
                newColName="newColumn"+incrementor;
                iterator(i+1);
            }
    })(0);          

    var uniqueId=utilityService.makeId(); 

    var newcol = {
        id:uniqueId,
        name: newColName,
        dataType: 'Text',
        relatedTo: null,
        relationType: null,
        required: false,
        unique: false,
        isRenamable: true,
        isEditable: true,
        isDeletable: true,
    }; 

    $scope.newColumnObj=newcol; 
    $scope.showAddColPopUp=true;   
  };

  $scope.addColumn = function(valid) {
    if(valid){
      $rootScope.currentProject.currentTable.columns.push($scope.newColumnObj);

      tableService.saveTable($rootScope.currentProject.appId, $rootScope.currentProject.currentTable)
      .then(function(table){        
        $scope.newColumnObj=null;
        $scope.showAddColPopUp=false;                                      
      },
      function(error){               
      });                        
    }            
  };

  $scope.cancelAddNewCol=function(){
    $scope.showAddColPopUp=false;
  };

  $scope.checkErrorsForCreate=function(name,arrayList,type){
    var result=tableErrorService.checkErrorsForCreate(name,arrayList,type);
    if(result){
          if(type=="table"){
              $scope.tableErrorForCreate=result;
          }
          if(type=="column"){
            $scope.columnErrorForCreate=result;
          }

    }else{
      $scope.tableErrorForCreate=null;
      $scope.columnErrorForCreate=null;
    }

  }; 
  /*------/Partial & Table Definition Functions---------------*/ 

});
