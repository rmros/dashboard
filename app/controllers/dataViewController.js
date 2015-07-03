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
cloudObjectService,
focus) {

  var id;
  var tableId;
  $scope.isTableLoaded=false;
  $rootScope.isFullScreen=true; 
  $scope.showAddColPopUp=false;
  $scope.isFileSelected=false;
  $scope.currentTableData=[];
  $scope.showSerialNo=[];
  $scope.rowsSelected=[];
  $scope.showInputForEdit=[[]]; 
  $scope.editableField=[[]];
  $scope.newListItem=null;   

  $scope.init = function() {      
      id = $stateParams.appId;
      tableId= $stateParams.tableId;
      $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
      if(id && tableId){        
        loadProject(id);             
      }     
  };

  $scope.loadTableData = function(t) {          
    var q=$q.defer();
    if(t){   
        var query = new CB.CloudQuery(t.name);       
        query.find({success : function(list){ 
            q.resolve(list);              

        }, error : function(error){ 
            q.reject(error); 

            $.gritter.add({
              position: 'top-right',
              title: 'Opps! something went wrong',
              text: 'We cannot load your data at this point in time. Please try again later.',
              class_name: 'danger'
            });
        }});       
    }                  
    return  q.promise;     
  };

  $scope.queryTableById = function(tableName,id) {          
    var q=$q.defer();
      
      var query = new CB.CloudQuery(tableName);       
      query.findById(id,{
      success : function(record){ 
         q.resolve(record);                 

      }, error : function(error){                
         q.reject(error);
      }}); 

    return  q.promise;           
  }; 

  //Save Boolean
  $scope.setAndSaveBoolean=function(row,column){
    row.set(column.name,!row.get(column.name));

    //Save Cloud Object
    $scope.saveCloudObject(row)
    .then(function(obj){
        //scope.$digest();
        if($scope.tableDef){
          convertISO2DateObj($scope.tableDef,obj);
        }
    }, function(error){ 
           
    });     
    
  };
  //End Boolean

  //DateTime
  //Invoke DateTime
  $scope.showDateTimeInput=function(row,column){
    nullifyFields();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index      

    //Enable column to edit
    var arry=[column.name];
    var arry2=[column.name];
    var index=angular.copy($scope.editableIndex);

    $scope.showInputForEdit[index]=arry;
    $scope.showInputForEdit[index][column.name]=true; 

    //Field or value     
    $scope.editableField[index]=arry2;
    $scope.editableField[index][column.name]=angular.copy(new Date(row.get(column.name)));
    
    focus(column.id+"column");    
  };
  //End DateTime

  //Text
  //Invoke Common Type Input enable
  $scope.showCommonTypes=function(row,column){
    nullifyFields();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index  

    var arry=[column.name];
    var arry2=[column.name];
    var index=angular.copy($scope.editableIndex);

    //Enable column to edit         
    $scope.showInputForEdit[index]=arry;
    $scope.showInputForEdit[index][column.name]=true;

    //Field or value     
    $scope.editableField[index]=arry2;
    $scope.editableField[index][column.name]=angular.copy(row.get(column.name));

    focus(column.id+"column");           
  };
  //End Text

  //ACL && JsonObject
  $scope.showJsonObject=function(row,column){
    nullifyEditable();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

    $scope.editableJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
       $scope.editableJsonObj=null;
    }
    $("#md-objectviewer").modal();
  };  
 
  $scope.setAndSaveJsonObject=function(){
      //Check if previous value is not equal to modified value
    if($scope.editableRow.get($scope.editableColumnName)!=$scope.editableJsonObj){
        $scope.editableRow.set($scope.editableColumnName,$scope.editableJsonObj);
    
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){  
          $("#md-objectviewer").modal("hide");
          $scope.editableJsonObj=null;
        }, function(error){ 
          $("#md-objectviewer").modal("hide");
          $scope.editableJsonObj=null;    
        });
    }else{
      $("#md-objectviewer").modal("hide");
      $scope.editableJsonObj=null;
    }     
    
  };  
  //End ACL && JsonObject  

  //Files
  $scope.showFile=function($event,row,column){
    $event.preventDefault();
    $.prettyPhoto.open(row.get(column.name).url);
  };
  $scope.editFile=function(row,column){
    nullifyEditable();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

    $scope.editableFile=angular.copy(row.get(column.name));

    $("#md-fileviewer").modal();
  };

  $scope.fileSelected=function(selectedFile,fileName,fileObj){
    $scope.isFileSelected=true;
    $scope.selectedFile=selectedFile;
    $scope.selectedfileName=fileName;
    $scope.selectedFileObj=fileObj;
    $scope.selectedFileExtension=fileName.split(".")[fileName.split(".").length-1]; 
  };

  $scope.setAndSaveFile=function(){    
    if($scope.selectedFileObj) {

        getCBFile($scope.selectedFileObj)
        .then(function(cloudBoostFile){
        
                $scope.editableRow.set($scope.editableColumnName,cloudBoostFile);            
                //Save Cloud Object
                $scope.saveCloudObject($scope.editableRow)
                .then(function(obj){  
                  $("#md-fileviewer").modal("hide");
                  $scope.removeSelectdFile();
                }, function(error){ 
                  $("#md-fileviewer").modal("hide");
                  $scope.removeSelectdFile();   
                });          

        }, function(err){
        });
              
    }
  };

  $scope.removeSelectdFile=function(){
    $scope.selectedFile=null;
    $scope.selectedfileName=null;
    $scope.selectedFileObj=null;
    $scope.selectedFileExtension=null;
  };

  $scope.deleteFile=function(){
    $scope.editableRow.set($scope.editableColumnName,null);            
    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){  
      $scope.editableFile=null;
      $scope.removeSelectdFile();
    }, function(error){ 
      $scope.editableFile=null;
      $scope.removeSelectdFile();    
    });
  };

  function getCBFile(fileObj){

    var q=$q.defer();

    var file = new CB.CloudFile(fileObj);
    file.save({
    success: function(newFile) {
      //got the file object successfully with the url to the file
      q.resolve(newFile); 
    },
    error: function(err) {
     //error in uploading file
      q.reject(err); 
    }
    });                

    return  q.promise;
  }  

  //End of Files

  //Relation
  $scope.addRelation=function(row,column){
    nullifyEditable();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

    $scope.relColumn=_.first(_.where($rootScope.currentProject.currentTable.columns,{name:column.name}));
    $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.relColumn.relatedTo}));
    
    if(row.get(column.name)){
      var tableName=row.get(column.name).document._tableName;
      var rowId=row.get(column.name).document._id;  

      //get table definition    
      getProjectTableById($scope.tableDef.id)
      .then(function(table){ 

            //get Table data
            $scope.queryTableById(tableName,rowId)
            .then(function(record){
              $scope.linkedRelatedDoc=record;
              $("#md-reldocumentviewer").modal();
            }, function(error){ 
                  
            });
            //End of get Table data

      }, function(error){           
      });
      //end of get table definition
    }else{
      $scope.linkedRelatedDoc=null;
      $("#md-reldocumentviewer").modal();
    }
    

    
  };
  $scope.searchRelationDocs=function(){

    $("#md-reldocumentviewer").modal("hide");

    //List Relations records 
    $scope.loadTableData($scope.tableDef)
    .then(function(list){

        //count no objects 
        var query = new CB.CloudQuery($scope.tableDef.name);                   
        query.count({ success: function(count){ 
           $scope.relationTableData=list;          
           $scope.$digest(); 
           $("#md-searchreldocument").modal();          
        },error: function(err) {          
        } });
        //count no objects
                                      
    },
    function(error){       
    });
    //List Relations records    
  };

  $scope.linkRecord=function(relationCBRecord){
    $scope.editableRow.set($scope.editableColumnName,relationCBRecord);            
    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){  
      $("#md-searchreldocument").modal("hide");
      
    }, function(error){ 
      $("#md-searchreldocument").modal("hide");
         
    });     
  };

  $scope.viewRelationData=function(row,column){
   
    var tableName=row.get(column.name).document._tableName;
    var rowId=row.get(column.name).document._id;

    $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: tableName}));

    //get table definition    
    getProjectTableById($scope.tableDef.id)
    .then(function(table){ 

          //get Table data
          $scope.queryTableById(tableName,rowId)
          .then(function(record){ 

            //Convert ISODate 2 DateObject
            convertISO2DateObj(table,record);           

            $scope.relatedTableDef=table;
            $scope.relatedTableRecord=record;
            $("#md-relationviewer").modal();

          }, function(error){ 
                
          });
          //End of get Table data

    }, function(error){           
    });
    //end of get table definition
       
  };

  function convertISO2DateObj(table,cloudObject){
      for(var i=0;i<table.columns.length;++i){
          if(table.columns[i].dataType=="DateTime"){
            var isoDate=cloudObject.get(table.columns[i].name);
            cloudObject.set(table.columns[i].name,new Date(isoDate));
          }
      }
  }
  //Relation ACL && JsonObject
  $scope.showRelJsonObject=function(row,column){
   
    $scope.relEditableRow=row;//row
    $scope.relEditableColumnName=column.name;

    $scope.relEditableJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
       $scope.relEditableJsonObj=null;
    }
    
    $("#md-rel-objectviewer").modal("show");
  };
  $scope.setAndSaveRelJsonObject=function(){
    $scope.relEditableRow.set($scope.relEditableColumnName,$scope.relEditableJsonObj);

    //Save Cloud Object
    $scope.saveCloudObject($scope.relEditableRow)
    .then(function(obj){ 
      $scope.relEditableRow=null;
      $scope.relEditableColumnName=null;
      $scope.relEditableJsonObj=null;
      $("#md-rel-objectviewer").modal("hide");
      convertISO2DateObj($scope.tableDef,obj);      
    }, function(error){
      $scope.relEditableRow=null;
      $scope.relEditableColumnName=null;
      $scope.relEditableJsonObj=null;
      $("#md-rel-objectviewer").modal("hide");                 
    });
  }; 

  //Relation File
  $scope.relEditFile=function(row,column){    
    $scope.relEditableRow=row;//row
    $scope.relEditableColumnName=column.name;//column name
    $scope.relEditableFile=angular.copy(row.get(column.name));

    $("#md-rel-fileviewer").modal();
  };
  $scope.setAndSaveRelFile=function(){    
    if($scope.selectedFileObj) {

        getCBFile($scope.selectedFileObj)
        .then(function(cloudBoostFile){
        
                $scope.relEditableRow.set($scope.relEditableColumnName,cloudBoostFile);            
                //Save Cloud Object
                $scope.saveCloudObject($scope.relEditableRow)
                .then(function(obj){  
                  $("#md-rel-fileviewer").modal("hide");
                  $scope.relEditableRow=null; 
                  $scope.relEditableColumnName=null;
                  $scope.relEditableFile=null;
                  $scope.removeSelectdFile();
                  convertISO2DateObj($scope.tableDef,obj);
                }, function(error){ 
                  $("#md-rel-fileviewer").modal("hide");
                  $scope.relEditableRow=null; 
                  $scope.relEditableColumnName=null;
                  $scope.relEditableFile=null;
                  $scope.removeSelectdFile();   
                });          

        }, function(err){
        });
              
    }
  };
  $scope.deleteRelFile=function(){
    $scope.relEditableRow.set($scope.relEditableColumnName,null);            
    //Save Cloud Object
    $scope.saveCloudObject($scope.relEditableRow)
    .then(function(obj){ 
      $scope.relEditableRow=null; 
      $scope.relEditableColumnName=null;
      $scope.relEditableFile=null;
      $scope.removeSelectdFile();
      convertISO2DateObj($scope.tableDef,obj);
    }, function(error){ 
      $scope.relEditableRow=null; 
      $scope.relEditableColumnName=null;
      $scope.relEditableFile=null;
      $scope.removeSelectdFile();    
    });
  };
  //Relation File
  //End of relation

//List
$scope.openCommonTypesListModal=function(row,column){
  nullifyEditable();
  $scope.editableRow=row;//row
  $scope.editableColumnName=column.name;//column name  

  $scope.editableColumn=column;//column
  $scope.editableList=row.get(column.name);
    
  if(column.relatedTo=="DateTime"){    
    convertFieldsISO2DateObj(); 
  }
  
  $("#md-list-commontypes").modal();
};

function convertFieldsISO2DateObj(){
  if($scope.editableList && $scope.editableList.length>0){
    for(var i=0;i<$scope.editableList.length;++i){
        $scope.editableList[i]= new Date($scope.editableList[i]);
    }    
  }      
}

$scope.addListItem=function(){
  if($scope.newListItem){
      if(!$scope.editableList || $scope.editableList.length==0){
        $scope.editableList=[];
      }
      if( $scope.editableColumn.relatedTo=="DateTime"){    
          $scope.newListItem=new Date($scope.newListItem); 
      }
      $scope.editableList.push($scope.newListItem);
      $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){ 
        $scope.newListItem=null;
    
        if( $scope.editableColumn.relatedTo=="DateTime"){    
          convertFieldsISO2DateObj(); 
        }

        $scope.$digest();  
      }, function(error){
        $scope.newListItem=null;
        $scope.$digest();         
      });
  }
  
};
$scope.deleteListItem=function(index){
 
  $scope.editableList.splice(index,1);
  $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
  //Save Cloud Object
  $scope.saveCloudObject($scope.editableRow)
  .then(function(obj){ 
    if( $scope.editableColumn.relatedTo=="DateTime"){    
      convertFieldsISO2DateObj(); 
    }   
  }, function(error){         
  });  
  
};

$scope.setAndSaveList=function(data,index){
  $scope.editableList[index]=data;
  $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
  //Save Cloud Object
  $scope.saveCloudObject($scope.editableRow)
  .then(function(obj){    
  }, function(error){         
  });
};
//End of List

  function nullifyFields(){
    //Disable column to edit
    if(typeof $scope.editableIndex=="number" && $scope.editableColumnName){ 

      if($scope.showInputForEdit[$scope.editableIndex] && $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]){
        $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
      }                
      $scope.editableField[$scope.editableIndex][$scope.editableColumnName]=null;//field or value 
    }
             
    nullifyEditable(); 
  }
  function nullifyEditable(){             
    $scope.editableRow=null;//row
    $scope.editableColumnName=null;//column name 
    $scope.editableIndex=null;//index 
  }

  //Save 
  $scope.setAndSave=function(){
    //Check if previous value is not equal to modified value
    if($scope.editableRow.get($scope.editableColumnName)!=$scope.editableField[$scope.editableIndex][$scope.editableColumnName]){
        $scope.editableRow.set($scope.editableColumnName,$scope.editableField[$scope.editableIndex][$scope.editableColumnName]);
    
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){  
          $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
        }, function(error){ 
          $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;     
        });
    }else{
      $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
    }         
    
  };
  //End of Save 

  //Save for relation table 
  $scope.setAndSaveRelTable=function(cloudObject,column){

    cloudObject.set(column.name,cloudObject.get(column.name));

    //Save Cloud Object
    $scope.saveCloudObject(cloudObject)
    .then(function(obj){  
      convertISO2DateObj($scope.tableDef,cloudObject);   
    }, function(error){           
    });            
    
  };
  //End of Save for relation table 

  $scope.saveCloudObject = function(obj){
    var q=$q.defer(); 

    //save the object.
    obj.save({ success: function(newObj){ 
      q.resolve(newObj);  
    },error: function(err) {
      q.reject(err);

      $.gritter.add({
        position: 'top-right',
        title: 'Opps! something went wrong',
        text: 'Cannot save this object at this point in time. Please try again later.',
        class_name: 'danger'
      });              
     //$scope.$digest();
    }
    });

    return  q.promise;      
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

          getProjectTableById(tableId)
          .then(function(table){
              if(table){
                $rootScope.currentProject.currentTable=table;

                //Load data 
                $scope.loadTableData(table)
                .then(function(list){
                    //count no objects 
                    var query = new CB.CloudQuery(table.name);                   
                    query.count({ success: function(count){ 
                       $scope.currentTableData=list;
                       $scope.isTableLoaded=true;
                       $scope.$digest();           
                    },error: function(err) {          
                    } });
                    //count no objects
                                                  
                },
                function(error){       
                });
                //end of loafing data                 
              }                              
          },
          function(error){       
          });

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

  function getProjectTableById(tableDefId){
    var q=$q.defer();

    tableService.getProjectTableById(tableDefId)
    .then(function(table){
        q.resolve(table);
    }, function(error){ 
       q.reject(error);                         
       $.gritter.add({
            position: 'top-right',
            title: 'Opps! something went wrong',
            text: 'We cannot load your table at this point in time. Please try again later.',
            class_name: 'danger'
        }); 
    });

    return  q.promise;
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
    $("#scrollbar-wrapper").mCustomScrollbar("scrollTo",['top','right']);   
  };

  $scope.addColumn = function(valid) {
    if(valid){
      $rootScope.currentProject.currentTable.columns.push($scope.newColumnObj);
      $("#scrollbar-wrapper").mCustomScrollbar("update");
      $(".data-table-design").css("height","84.2vh");
      $timeout(function(){ 
        $(".data-table-design").css("height","84.4vh");
      }, 2000);


      tableService.saveTable($rootScope.currentProject.appId, $rootScope.currentProject.currentTable)
      .then(function(table){        
        $scope.newColumnObj=null;
        $scope.showAddColPopUp=false;                                      
      },
      function(error){ 
          var index=$rootScope.currentProject.currentTable.columns.indexOf($scope.newColumnObj);
          $rootScope.currentProject.currentTable.columns.splice(index,1)            
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

  $scope.addRow=function(){
    
    var obj = new CB.CloudObject($rootScope.currentProject.currentTable.name);
    obj.set('createdAt', new Date());
    obj.set('updatedAt', new Date());     
    $scope.currentTableData.push(obj);                                         
  };

  $scope.getType = function(x) {
    return typeof x;
  };

  $scope.isDate = function(x) {
    return x instanceof Date;
  };
  /*------/Partial & Table Definition Functions---------------*/   

});
