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
focus,
uiGmapGoogleMapApi) {

  //Init
  var id;
  var tableId;
  $scope.isTableLoaded=false;
  $rootScope.isFullScreen=true; 

  //Column specific
  $scope.showColOptions=[];
  $scope.showHiddenColList=false;
  $scope.showAddColPopUp=false;
  $scope.hideColumn=[];
  $scope.editColumn=[];

  //Row specific
  $scope.showSerialNo=[];
  $scope.rowsSelected=[];
  $scope.selectedRowsCount=0;
  $scope.areSelectAllRows=false;  
  $scope.rowEditMode=[];
  $scope.rowErrorMode=[];
  $scope.rowSpinnerMode=[]; 
  $scope.rowSavedMode=[]; 
  $scope.rowInfo=null;
  
  //Field Ediatble
  $scope.showInputForEdit=[[]]; 
  $scope.editableField=[[]];
  $scope.newListItem=null;

  //Relation  
  $scope.relatedTableDefArray=[];
  $scope.relatedTableRecordArray=[];
   

  //Random
  $scope.isFileSelected=false;  
  $scope.currentTableData=[]; 
  var orderBy="createdAt"; 
  var orderByType="asc"; 


  $scope.init = function() { 
    id = $stateParams.appId;
    tableId= $stateParams.tableId;
    $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
    if(id && tableId){        
      loadProject(id);                   
    }     
       
  };

  $scope.loadTableData = function(t,orderBy,orderByType,limit,skip) {          
    var q=$q.defer();
    if(t){   
        var query = new CB.CloudQuery(t.name);

        if(orderByType=="asc"){
          query.orderByAsc(orderBy);
        }
        if(orderByType=="desc"){
          query.orderByDesc(orderBy);
        }
          
        query.setLimit(limit);
        query.setSkip(skip); 

        query.find({success : function(list){ 
            q.resolve(list);
        }, error : function(error){ 
            q.reject(error);             
        }});       
    }                  
    return  q.promise;     
  };

  $scope.queryTableById = function(tableName,objectId) {          
    var q=$q.defer();
      
      var query = new CB.CloudQuery(tableName);       
      query.findById(objectId,{
      success : function(record){ 
         q.resolve(record);                 

      }, error : function(error){                
         q.reject(error);
      }}); 

    return  q.promise;           
  }; 

  //Save Boolean
  $scope.setAndSaveBoolean=function(row,column){
    var i=$scope.currentTableData.indexOf(row);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=column.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!row.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
     row.set(column.name,!row.get(column.name));
    if(requiredField){      
      rowErrorMode(i,row,column.name);     
    }else{
      rowSpinnerMode(i);     

      //Save Cloud Object
      $scope.saveCloudObject(row)
      .then(function(obj){
          //scope.$digest();         
          if($scope.tableDef){
            convertISO2DateObj($scope.tableDef,obj);
          }
          showSaveIconInSecond(i);

      }, function(error){ 
         rowInitMode(i);    
      });
    }       
    
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
    $scope.editableJsonObj =JSON.stringify($scope.editableJsonObj,null,2);
    $("#md-objectviewer").modal();
  };  
 
  $scope.setAndSaveJsonObject=function(){
 
    //Check if previous value is not equal to modified value
    if($scope.editableRow.get($scope.editableColumnName)!=JSON.parse($scope.editableJsonObj)){
      rowEditMode($scope.editableIndex);

      var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
         if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
           if(!$scope.editableRow.get(everyCol.name)){
            return everyCol;
           }          
         }
      });

      $scope.editableRow.set($scope.editableColumnName,JSON.parse($scope.editableJsonObj));
      if(requiredField){  
        $("#md-objectviewer").modal("hide");    
        rowErrorMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
      }else{
        rowSpinnerMode($scope.editableIndex);        
    
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){  
          $("#md-objectviewer").modal("hide");
          $scope.editableJsonObj=null;
          showSaveIconInSecond($scope.editableIndex);
        }, function(error){ 
          $("#md-objectviewer").modal("hide");
          $scope.editableJsonObj=null;
          rowInitMode($scope.editableIndex);    
        });
      }  

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
            rowEditMode($scope.editableIndex);
       
            var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
               if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
                 if(!$scope.editableRow.get(everyCol.name)){
                  return everyCol;
                 }          
               }
            });

            $scope.editableRow.set($scope.editableColumnName,cloudBoostFile);
            if(requiredField){
              $("#md-fileviewer").modal("hide");      
              rowErrorMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
            }else{
              rowSpinnerMode($scope.editableIndex); 
                
                $scope.editableRow.set($scope.editableColumnName,cloudBoostFile);            
                //Save Cloud Object
                $scope.saveCloudObject($scope.editableRow)
                .then(function(obj){  
                  $("#md-fileviewer").modal("hide");
                  $scope.removeSelectdFile();
                  showSaveIconInSecond($scope.editableIndex);
                }, function(error){ 
                  $("#md-fileviewer").modal("hide");
                  $scope.removeSelectdFile();  
                  rowInitMode($scope.editableIndex);  
                }); 
            }             

        }, function(err){
        });
              
    }
  };

  $scope.removeSelectdFile=function(){
    $scope.selectedFile=null;
    $scope.selectedfileName=null;
    $scope.selectedFileObj=null;
    $scope.selectedFileExtension=null;

    //nullify list modal for file
    if($scope.listEditableRow){
      $scope.listEditableRow=null;//row
      $scope.listEditableColumn=null;//row
      $scope.listIndex=null;
    }
  };

  $scope.deleteFile=function(){
      rowEditMode($scope.editableIndex);
         
      var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
         if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
           if(!$scope.editableRow.get(everyCol.name)){
            return everyCol;
           }          
         }
      });

      $scope.editableRow.set($scope.editableColumnName,null); 
      if(requiredField){      
        rowErrorMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
      }else{
        rowSpinnerMode($scope.editableIndex);
                    
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){  
          $scope.editableFile=null;
          $scope.removeSelectdFile();
          showSaveIconInSecond($scope.editableIndex);
          $("#md-fileviewer").modal("hide");
        }, function(error){ 
          $scope.editableFile=null;
          $scope.removeSelectdFile();
          rowInitMode($scope.editableIndex);
          $("#md-fileviewer").modal("hide");     
        });

      }
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


//Geo Point
$scope.toggleGoogleMap=function(event,row,column){     
    var geoPointJson=row.get(column.name);
    var index=$scope.currentTableData.indexOf(row);
        
    var mapId="#"+index+""+column.name+"map";
    
    uiGmapGoogleMapApi.then(function(maps) {            
          
      $scope.map = {
          center: {
              latitude: geoPointJson.latitude,
              longitude: geoPointJson.longitude
          },
          zoom: 14
      };
      $scope.marker = {
          id: 1,
          coords: {
              latitude: geoPointJson.latitude,
              longitude: geoPointJson.longitude
          }
      };

      $(event.target).stackbox({
          closeButton: true,
          animOpen:"fadeIn",
          width:"490px",
          marginY:9,
          position: 'bottom',
          autoAdjust:false,
          content: mapId,
          autoScroll:true,
          beforeClose:function(){
            $scope.map = {};
            $scope.marker = {};
          }
      });
      
    });      
};

$scope.editGeoPoint=function(row,column){
  nullifyEditable();
  $scope.editableRow=row;//row
  $scope.editableColumnName=column.name;//column name
  $scope.editableIndex=$scope.currentTableData.indexOf(row);//index    

  $scope.editableGeopoint=angular.copy(row.get(column.name));   
  if(!row.get(column.name)){
     $scope.editableGeopoint={};     
     $scope.editableGeopoint.latitude=null;
     $scope.editableGeopoint.longitude=null;
  }
  $("#md-geodocumentviewer").modal();
};


$scope.setAndSaveGeopoint=function(valid){
  if(valid  && !$scope.geopointEditError){

    if($scope.editableRow.get($scope.editableColumnName)){//if geopoint is there

      //checking for old data!=new data
      if(($scope.editableRow.get($scope.editableColumnName).latitude!=$scope.editableGeopoint.latitude) || ($scope.editableRow.get($scope.editableColumnName).longitude!=$scope.editableGeopoint.longitude)){
        var loc = new CB.CloudGeoPoint($scope.editableGeopoint.latitude,$scope.editableGeopoint.longitude);
        $scope.editableRow.set($scope.editableColumnName,loc);
        saveGeopoint(); 

      }else{
      $("#md-geodocumentviewer").modal("hide");
      $scope.editableGeopoint=null;
      }

    }else{//else empty
      var loc = new CB.CloudGeoPoint($scope.editableGeopoint.latitude,$scope.editableGeopoint.longitude);
      $scope.editableRow.set($scope.editableColumnName,loc);       
      saveGeopoint();
    }
  }    
};

function saveGeopoint(){
  rowEditMode($scope.editableIndex);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
     if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
     }
  });
  
  if(requiredField){  
    $("#md-geodocumentviewer").modal("hide");    
    rowErrorMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
  }else{
    rowSpinnerMode($scope.editableIndex);

    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){  
      $("#md-geodocumentviewer").modal("hide");
      $scope.editableGeopoint=null;
      showSaveIconInSecond($scope.editableIndex);
    }, function(error){ 
      $("#md-geodocumentviewer").modal("hide");
      $scope.editableGeopoint=null;
      rowInitMode($scope.editableIndex);     
    });
  }  
}  

//End of Geo point

//RELATION
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
    $scope.loadTableData($scope.tableDef,"createdAt","asc",20,0)
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

    var i=$scope.currentTableData.indexOf($scope.editableRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
     $scope.editableRow.set($scope.editableColumnName,relationCBRecord); 
    if(requiredField){      
      rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);
      $("#md-searchreldocument").modal("hide");
      $("#md-reldocumentviewer").modal("hide");     
    }else{
      rowSpinnerMode(i);
                 
      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){  
        $("#md-searchreldocument").modal("hide");
        showSaveIconInSecond(i);
        
      }, function(error){ 
        $("#md-searchreldocument").modal("hide");
        rowInitMode(i); 
      });

    }      
  };

  $scope.viewRelationData=function(row,column){
    nullifyEditable();
    //$scope.relObjEditableRow.push(row)//row
    //$scope.relObjEditableColumnName.push(column.name);//column name 
    //$scope.relObjEditableIndex.push($scope.currentTableData.indexOf(row));//index

    nullifyEditable();
    $scope.editableRow=row;//row
    $scope.editableColumnName=column.name;//column name 
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

    var tableName=row.get(column.name).document._tableName;
    var rowId=row.get(column.name).document._id;
    var tableDef=_.first(_.where($rootScope.currentProject.tables, {name: tableName}));   

    //get Table data
    $scope.queryTableById(tableName,rowId)
    .then(function(record){ 

      //Convert ISODate 2 DateObject
      convertISO2DateObj(tableDef,record);

      $scope.relatedTableDefArray.push(tableDef);
      $scope.relatedTableRecordArray.push(record);
    
      $("#md-relationviewer").modal();           

    }, function(error){ 
          
    });
    //End of get Table data       
  };

  $scope.goToPrevRel=function(){
    if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
      $scope.relatedTableDefArray.splice($scope.relatedTableDefArray.length-1,1);
      $scope.relatedTableRecordArray.splice($scope.relatedTableRecordArray.length-1,1);
    
      $("#md-relationviewer").modal();      
    }
    
  };

  $scope.closeRelModal=function(){
    if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
      $scope.relatedTableDefArray.splice($scope.relatedTableDefArray.length-1,1);
      $scope.relatedTableRecordArray.splice($scope.relatedTableRecordArray.length-1,1);
    
      $("#md-relationviewer").modal();     
    }else{
      $scope.relatedTableDefArray=[];
      $scope.relatedTableRecordArray=[];
      $("#md-relationviewer").modal("hide");
    }
  };

  function convertISO2DateObj(table,cloudObject){
      for(var i=0;i<table.columns.length;++i){
          if(table.columns[i].dataType=="DateTime"){
            var isoDate=cloudObject.get(table.columns[i].name);
            cloudObject.set(table.columns[i].name,new Date(isoDate));
          }
      }
  }

  $scope.deleteValue=function(){

    var i=$scope.currentTableData.indexOf($scope.editableRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
    $scope.editableRow.set($scope.editableColumnName,null);

    if(requiredField){      
      rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);     
    }else{
      rowSpinnerMode(i);
                  
      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){      
        $scope.relatedTableDefArray=[];
        $scope.relatedTableRecordArray=[];
        showSaveIconInSecond(i);
      }, function(error){ 
          rowInitMode(i);  
      });

    }
  };

  //Set Boolean
  $scope.setRelBoolean=function(cloudObject,column){   
    cloudObject.set(column.name,cloudObject.get(column.name));   
  };
  //End Setting Boolean

  //Relation ACL && JSONObject
  $scope.showRelJsonObject=function(row,column){
   
    $scope.relEditableRow=row;//row
    $scope.relEditableColumnName=column.name;
    $scope.relEditableJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
      $scope.relEditableJsonObj=null;
    }
    $scope.relEditableJsonObj=JSON.stringify($scope.relEditableJsonObj,null,2);
    $("#md-rel-objectviewer").modal("show");
  };

  $scope.setAndSaveRelJsonObject=function(){
    $scope.relEditableRow.set($scope.relEditableColumnName,JSON.parse($scope.relEditableJsonObj));
    $("#md-rel-objectviewer").modal("hide");
    $scope.relEditableRow=null;
    $scope.relEditableColumnName=null;
    $scope.relEditableJsonObj=null;

    /*
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
    });*/
  }; 

  //Relation File
  $scope.relEditFile=function(row,column){    
    $scope.relEditableRow=row;//row
    $scope.relEditableColumnName=column.name;//column name
    $scope.relEditableFile=angular.copy(row.get(column.name));

    $("#md-rel-fileviewer").modal();
  };
  $scope.setRelFile=function(){    
    if($scope.selectedFileObj) {

        getCBFile($scope.selectedFileObj)
        .then(function(cloudBoostFile){
        
            $scope.relEditableRow.set($scope.relEditableColumnName,cloudBoostFile);

            $("#md-rel-fileviewer").modal("hide");
            $scope.relEditableRow=null; 
            $scope.relEditableColumnName=null;
            $scope.relEditableFile=null;
            $scope.removeSelectdFile();

            /*
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
            }); */         

        }, function(err){
        });
              
    }
};

$scope.deleteRelFile=function(){
    $scope.relEditableRow.set($scope.relEditableColumnName,null);
    $("#md-rel-fileviewer").modal("hide");  

    //Save Cloud Object
    /*$scope.saveCloudObject($scope.relEditableRow)
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
    });*/
};
//Relation File

//Relation Geopoint
$scope.relEditGeoPoint=function(row,column){  
  $scope.relEditableRow=row;//row
  $scope.relEditableColumnName=column.name;   

  $scope.relEditableGeopoint=angular.copy(row.get(column.name));   
  if(!row.get(column.name)){
     $scope.relEditableGeopoint={};     
     $scope.relEditableGeopoint.latitude=null;
     $scope.relEditableGeopoint.longitude=null;
  }
  $("#md-rel-geodocumentviewer").modal();
};

$scope.relSetAndSaveGeopoint=function(valid){
  if(valid  && !$scope.geopointEditError){

    if($scope.relEditableRow.get($scope.relEditableColumnName)){//if geopoint is there

      //checking for old data!=new data
      if(($scope.relEditableRow.get($scope.relEditableColumnName).latitude!=$scope.relEditableGeopoint.latitude) || ($scope.relEditableRow.get($scope.relEditableColumnName).longitude!=$scope.relEditableGeopoint.longitude)){
        var loc = new CB.CloudGeoPoint($scope.relEditableGeopoint.latitude,$scope.relEditableGeopoint.longitude);
        $scope.relEditableRow.set($scope.relEditableColumnName,loc);
        //relSaveGeopoint();
        $("#md-rel-geodocumentviewer").modal("hide");

      }else{
      $("#md-rel-geodocumentviewer").modal("hide");
      $scope.relEditableGeopoint=null;
      }

    }else{//else empty
      var loc = new CB.CloudGeoPoint($scope.relEditableGeopoint.latitude,$scope.relEditableGeopoint.longitude);
      $scope.relEditableRow.set($scope.relEditableColumnName,loc);
      //relSaveGeopoint();
      $("#md-rel-geodocumentviewer").modal("hide");
    }
  }    
};

/*function relSaveGeopoint(){
  //Save Cloud Object
  $scope.saveCloudObject($scope.relEditableRow)
  .then(function(obj){  
    $("#md-rel-geodocumentviewer").modal("hide");
    $scope.relEditableGeopoint=null;
  }, function(error){ 
    $("#md-rel-geodocumentviewer").modal("hide");
    $scope.relEditableGeopoint=null;    
  });
}  */

//End of Geo point
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

$scope.addListItem=function(newListItem){
  if(newListItem || $scope.editableColumn.relatedTo=="Boolean" || $scope.editableColumn.relatedTo=="Object"){
      if(!$scope.editableList || $scope.editableList.length==0){
        $scope.editableList=[];
      }
      if( $scope.editableColumn.relatedTo=="DateTime"){    
          newListItem=new Date(newListItem); 
      }
      if( $scope.editableColumn.relatedTo=="Object"){    
          newListItem={}; 
      }

      var i=$scope.currentTableData.indexOf($scope.editableRow);   
      rowEditMode(i);
     
      var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
         if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
           if(!$scope.editableRow.get(everyCol.name)){
            return everyCol;
           }          
         }
      });
      
      $scope.editableList.push(newListItem);
      $scope.editableRow.set($scope.editableColumnName,$scope.editableList);

      if(requiredField){      
        rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);     
      }else{
        rowSpinnerMode(i);

        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){ 
          newListItem=null;
      
          if( $scope.editableColumn.relatedTo=="DateTime"){    
            convertFieldsISO2DateObj(); 
          }
          showSaveIconInSecond(i);

          //$scope.$digest();  
        }, function(error){
          newListItem=null;
          rowInitMode(i); 
          //$scope.$digest();         
        });

      }      
  }
  
}; 
$scope.deleteListItem=function(index){
  var i=$scope.currentTableData.indexOf($scope.editableRow);   
  rowEditMode(i);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
     if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
     }
  });

  $scope.editableList.splice(index,1);
  if($scope.editableList.length==0){
    $scope.editableList=null;
  }
  $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
  if(requiredField){      
    rowErrorMode(i,$scope.editableRow,$scope.editableColumnName); 
    $("#md-list-commontypes").modal("hide");    
  }else{
    rowSpinnerMode(i);  

    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){ 
      if( $scope.editableColumn.relatedTo=="DateTime"){    
        convertFieldsISO2DateObj(); 
      }
      showSaveIconInSecond(i);   
    }, function(error){    
      rowInitMode(i);       
    });
 }   
  
};

//List ACL && JsonObject
$scope.showListJsonObject=function(row,index){ 
  $scope.listEditableRow=row;//row
  $scope.listIndex=index;      
  if(!row){
     $scope.listEditableRow=null;
  }  
  $scope.listEditableRow=JSON.stringify($scope.listEditableRow,null,2);
  $("#md-list-objectviewer").modal("show");
};

//List File
$scope.addListFile=function(){  
  $("#md-list-fileviewer").modal("show");
};

//List ShowFile
$scope.showListFile=function(row,column,index){ 
  $scope.listEditableRow=row;//row
  $scope.listEditableColumn=column;//row
  $scope.listIndex=index;   
  $("#md-list-fileviewer").modal("show");
};

$scope.listSetAndSaveFile=function(){    
    if($scope.selectedFileObj) {     

        getCBFile($scope.selectedFileObj)
        .then(function(cloudBoostFile){       
           
            var i=$scope.currentTableData.indexOf($scope.editableRow);   
            rowEditMode(i);
           
            var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
              if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
                if(!$scope.editableRow.get(everyCol.name)){
                  return everyCol;
                }          
              }
            });

            if(!$scope.editableList || $scope.editableList.length==0){
              $scope.editableList=[];
            }       

            $scope.editableList.push(cloudBoostFile);
            $scope.editableRow.set($scope.editableColumnName,$scope.editableList);

            if(requiredField){      
              rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);
              $("#md-list-fileviewer").modal("hide"); 
              $("#md-list-commontypes").modal("hide");    
            }else{
              rowSpinnerMode(i);

            //Save Cloud Object
            $scope.saveCloudObject($scope.editableRow)
            .then(function(obj){
              $("#md-list-fileviewer").modal("hide");
              $scope.removeSelectdFile();
              showSaveIconInSecond(i);   
              //$scope.$digest();  
            }, function(error){
              $("#md-list-fileviewer").modal("hide");
              $scope.removeSelectdFile(); 
              rowInitMode(i);         
              //$scope.$digest();         
            });
          }            

        }, function(err){
        });

    }
};

$scope.deleteListFile=function(){
  var i=$scope.currentTableData.indexOf($scope.editableRow);   
  rowEditMode(i);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
     if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
     }
  });

  $scope.listEditableRow.document[$scope.listEditableColumn.name].splice($scope.listIndex,1);
  $scope.listEditableRow.set($scope.listEditableColumn.name,$scope.listEditableRow.document[$scope.listEditableColumn.name]);

  if(requiredField){      
    rowErrorMode(i,$scope.listEditableRow,$scope.listEditableColumn.name);  
    $("#md-list-fileviewer").modal("hide"); 
    $("#md-list-commontypes").modal("hide");     
  }else{
    rowSpinnerMode(i);
    
    //Save Cloud Object
    $scope.saveCloudObject($scope.listEditableRow)
    .then(function(obj){ 
      $("#md-list-fileviewer").modal("hide");
      showSaveIconInSecond(i);   
    }, function(error){  
      rowInitMode(i);       
    });

  }
};

//List Relationdocs search
$scope.listSearchRelationDocs=function(){ 
  $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.editableColumn.relatedTo}));
  //List Relations records 
  $scope.loadTableData($scope.tableDef,"createdAt","asc",20,0)
  .then(function(list){

      //count no objects 
      var query = new CB.CloudQuery($scope.tableDef.name);                   
      query.count({ success: function(count){ 
         $scope.listRelationTableData=list;          
         $scope.$digest(); 
         $("#md-searchlistdocument").modal("show");          
      },error: function(err) {          
      } });
      //count no objects
                                    
  },
  function(error){       
  });
  //List Relations records   
};

$scope.listAddRelation=function(relationDoc){    
  if(relationDoc) {

    var i=$scope.currentTableData.indexOf($scope.editableRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
    if(!$scope.editableList || $scope.editableList.length==0){
      $scope.editableList=[];
    }       

    $scope.editableList.push(relationDoc);
    $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
    if(requiredField){      
      rowErrorMode(i,$scope.editableRow,$scope.editableColumnName); 
      $("#md-searchlistdocument").modal("hide");
      $("#md-list-commontypes").modal("hide");      
    }else{
      rowSpinnerMode(i);

      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){
        $("#md-searchlistdocument").modal("hide"); 
        showSaveIconInSecond(i);          
        //$scope.$digest();  
      }, function(error){
        $("#md-searchlistdocument").modal("hide");  
        rowInitMode(i);               
        //$scope.$digest();         
      });
    }              
           
  }
};

$scope.listViewRelationData=function(row,column,index){
   
    var tableName=row.get(column.name)[index].document._tableName;
    var rowId=row.get(column.name)[index].document._id;

    $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: tableName}));

    //get Table data
    $scope.queryTableById($scope.tableDef.name,rowId)
    .then(function(record){ 

      //Convert ISODate 2 DateObject
      convertISO2DateObj($scope.tableDef,record);           

      $scope.relatedTableDefArray.push($scope.tableDef);
      $scope.relatedTableRecordArray.push(record);
      $("#md-relationviewer").modal();

    }, function(error){ 
          
    });
    //End of get Table data       
};

//List Geopoint
$scope.listToggleGoogleMap=function(event,row,column,listIndex){     
    var geoPointJson=row.get(column.name)[listIndex];
    var index=$scope.currentTableData.indexOf(row);
        
    var mapId="#"+index+""+column.name+"listmap";
    
    uiGmapGoogleMapApi.then(function(maps) {            
          
      $scope.map = {
          center: {
              latitude: geoPointJson.latitude,
              longitude: geoPointJson.longitude
          },
          zoom: 14
      };
      $scope.marker = {
          id: 1,
          coords: {
              latitude: geoPointJson.latitude,
              longitude: geoPointJson.longitude
          }
      };

      $(event.target).stackbox({
          closeButton: true,
          animOpen:"fadeIn",
          width:"490px",
          marginY:9,
          position: 'bottom',
          autoAdjust:false,
          content: mapId,
          autoScroll:true,
          beforeClose:function(){
            $scope.map = {};
            $scope.marker = {};
          }
      });
      
    });      
};

//List Geopoint
$scope.addListGeopointModal=function(){ 
  $scope.listEditableGeopoint={}; 
  $scope.listEditableGeopoint.latitude=null;
  $scope.listEditableGeopoint.longitude=null;
  $("#md-list-geodocumentviewer").modal("show");
};

$scope.listAddGeopoint=function(valid){
  if(valid  && !$scope.geopointEditError){
    var i=$scope.currentTableData.indexOf($scope.editableRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
    if(!$scope.editableList || $scope.editableList.length==0){
        $scope.editableList=[];
    } 

    var loc = new CB.CloudGeoPoint($scope.listEditableGeopoint.latitude,$scope.listEditableGeopoint.longitude);
    $scope.editableList.push(loc);
    $scope.editableRow.set($scope.editableColumnName,$scope.editableList);

    if(requiredField){      
      rowErrorMode(i,$scope.editableRow,$scope.editableColumnName.name); 
      $("#md-list-geodocumentviewer").modal("hide"); 
      $("#md-list-commontypes").modal("hide");    
    }else{
      rowSpinnerMode(i);

      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){ 
        $scope.listEditableGeopoint.latitude=null;
        $scope.listEditableGeopoint.longitude=null; 
        $("#md-list-geodocumentviewer").modal("hide");
        showSaveIconInSecond(i);       

        //$scope.$digest();  
      }, function(error){
        $scope.listEditableGeopoint.latitude=null;
        $scope.listEditableGeopoint.longitude=null; 
        $("#md-list-geodocumentviewer").modal("hide");        
        rowInitMode(i); 
        //$scope.$digest();         
      });

    }       
  }
  
};

$scope.editListGeoPoint=function(index){
  $scope.geopointListIndex=index;
  $scope.listEditableGeopoint={}; 
  $scope.listEditableGeopoint.latitude=$scope.editableList[index].latitude;
  $scope.listEditableGeopoint.longitude=$scope.editableList[index].longitude;
  $("#md-list-edit-geodocumentviewer").modal("show");
};

$scope.listGeoPointsetAndSave=function(valid){  
  if(valid  && !$scope.geopointEditError){

    //checking for old data!=new data
    if(($scope.editableList[$scope.geopointListIndex].latitude!=$scope.listEditableGeopoint.latitude) || ($scope.editableList[$scope.geopointListIndex].longitude!=$scope.listEditableGeopoint.longitude)){
    
      var i=$scope.currentTableData.indexOf($scope.editableRow);   
      rowEditMode(i);
     
      var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
         if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
           if(!$scope.editableRow.get(everyCol.name)){
            return everyCol;
           }          
         }
      });

      var loc = new CB.CloudGeoPoint($scope.listEditableGeopoint.latitude,$scope.listEditableGeopoint.longitude);   
      $scope.editableList[$scope.geopointListIndex]=loc;
      $scope.editableRow.set($scope.editableColumnName,$scope.editableList);

      if(requiredField){      
        rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);
        $("#md-list-edit-geodocumentviewer").modal("hide");
        $("#md-list-commontypes").modal("hide");     
      }else{
        rowSpinnerMode(i); 
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){ 
          $scope.listEditableGeopoint.latitude=null;
          $scope.listEditableGeopoint.longitude=null; 
          $("#md-list-edit-geodocumentviewer").modal("hide");
          showSaveIconInSecond(i);
             
        }, function(error){ 
          $scope.listEditableGeopoint.latitude=null;
          $scope.listEditableGeopoint.longitude=null; 
          $("#md-list-edit-geodocumentviewer").modal("hide");
          rowInitMode(i); 
                  
        });
     }
    }
    
  }  
};

$scope.setAndSaveList=function(data,index){ 
  var i=$scope.currentTableData.indexOf($scope.editableRow);   
  rowEditMode(i);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
     if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
     }
  });

  $scope.editableList[index]=data;
  if( $scope.editableColumn.relatedTo=="Object"){    
    $scope.editableRow.set($scope.editableColumnName,JSON.parse($scope.editableList)); 
  }else{
    $scope.editableRow.set($scope.editableColumnName,$scope.editableList);
  }  
  
  if(requiredField){      
    rowErrorMode(i,$scope.editableRow,$scope.editableColumnName); 
    if( $scope.editableColumn.relatedTo=="Object"){    
      $("#md-list-objectviewer").modal("hide"); 
    }
    $("#md-list-commontypes").modal();   
  }else{
    rowSpinnerMode(i);  
  
    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){ 
      if( $scope.editableColumn.relatedTo=="Object"){    
        $("#md-list-objectviewer").modal("hide"); 
      } 
      showSaveIconInSecond(i);  
    }, function(error){ 
      if( $scope.editableColumn.relatedTo=="Object"){    
        $("#md-list-objectviewer").modal("hide"); 
      } 
      rowInitMode(i);        
    });

  }
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
        rowEditMode($scope.editableIndex);       

        var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
           if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
             if(!$scope.editableRow.get(everyCol.name)){
              return everyCol;
             }          
           }
        });

        $scope.editableRow.set($scope.editableColumnName,$scope.editableField[$scope.editableIndex][$scope.editableColumnName]);
        if(requiredField){      
          rowErrorMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);          
        }else{
          rowSpinnerMode($scope.editableIndex);          
        
          //Save Cloud Object
          $scope.saveCloudObject($scope.editableRow)
          .then(function(obj){  
            $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
            showSaveIconInSecond($scope.editableIndex);
          }, function(error){ 
            $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false; 
            rowInitMode($scope.editableIndex);    
          });
        }

    }else{
      $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
    }         
    
  };
  //End of Save 

  //Save for relation table 
  $scope.setRelTable=function(cloudObject,column){
    cloudObject.set(column.name,cloudObject.get(column.name));   
  };
  //End of Save for relation table

  //Save for relation table 
  $scope.saveRelationObj=function(relCloudObject){
    var i=$scope.currentTableData.indexOf($scope.editableRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });
     
    if(requiredField){      
      rowErrorMode(i,$scope.editableRow,$scope.editableColumnName);
      $("#md-relationviewer").hide();      
    }else{
      rowSpinnerMode(i);
      //Save Cloud Object
      $scope.saveCloudObject(relCloudObject)
      .then(function(obj){  
        $("#md-relationviewer").hide();
        showSaveIconInSecond(i);   
      }, function(error){
        rowInitMode(i);             
      });
    }           
    
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
          $.amaran({
              'theme'     :'colorful',
              'content'   :{
                 bgcolor:'#EE364E',
                 color:'#fff',
                 message:'We cannot load your project at this point in time. Please try again later.'
              },
              'position'  :'bottom right',
              'outEffect' :'slideBottom'
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
                $scope.loadTableData(table,orderBy,orderByType,10,0)
                .then(function(list){              
                   $scope.currentTableData=list;
                   $scope.totalRecords=10;
                   $scope.isTableLoaded=true;
                   //$scope.$digest();                                               
                },
                function(error){  
                  $.amaran({
                      'theme'     :'colorful',
                      'content'   :{
                         bgcolor:'#EE364E',
                         color:'#fff',
                         message:'Error in loading table records'
                      },
                      'position'  :'bottom right',
                      'outEffect' :'slideBottom'
                  });

                });
                //end of loafing data                 
              }                              
          },
          function(error){ 
            $.amaran({
                'theme'     :'colorful',
                'content'   :{
                   bgcolor:'#EE364E',
                   color:'#fff',
                   message:'Error getting table'
                },
                'position'  :'bottom right',
                'outEffect' :'slideBottom'
            });      
          });

      }else{                                                                   
         $rootScope.currentProject.tables=[];
      }          
           
    }, function(error){                                    
        $.amaran({
              'theme'     :'colorful',
              'content'   :{
                 bgcolor:'#EE364E',
                 color:'#fff',
                 message:'We cannot load your tables at this point in time. Please try again later.'
              },
              'position'  :'bottom right',
              'outEffect' :'slideBottom'
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
    });

    return  q.promise;
  }  

  function initCbApp(){
    CB.CloudApp.init($rootScope.currentProject.appId,$rootScope.currentProject.keys.master);    
  }

  $scope.addMoreRecords=function(){
    console.log("sjdbsdhbh");
    if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){

      //load more data
      $scope.loadTableData($rootScope.currentProject.currentTable,orderBy,orderByType,5,$scope.totalRecords)
      .then(function(list){
        if(list && list.length>0){
          if($scope.currentTableData.length>0){
            $scope.currentTableData=$scope.currentTableData.concat(list); 
          }else{
            $scope.currentTableData=list;
          }
          $scope.totalRecords=$scope.totalRecords+list.length;
        }          
        
        //$scope.$digest();  
                                        
      },
      function(error){       
      });
      //end of load more data
    }     
   
  };

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

  $scope.toggleColOptions=function(index){
    if((!$scope.showColOptions[index]) || ($scope.showColOptions[index]==false)){
      $scope.showColOptions[index]=true;
    }else if($scope.showColOptions[index]==true){
      $scope.showColOptions[index]=false;
    }    
  };

  $scope.deleteColumn=function(column){
    if(column.isDeletable){
      var i = $scope.currentProject.currentTable.columns.indexOf(column);
      $scope.currentProject.currentTable.columns.splice(i, 1);
      $scope.showColOptions[i]=false;

      tableService.saveTable(id,$scope.currentProject.currentTable)
      .then(function(table){
        console.log(table);

          //load more data
          $scope.loadTableData($rootScope.currentProject.currentTable,orderBy,orderByType,$scope.totalRecords,0)
          .then(function(list){
            if(list && list.length>0){              
              $scope.currentTableData=list;        
            }            
            //$scope.$digest();  
                                            
          },
          function(error){       
          });
          //end of load more data

      },function(error){
       
      });      
    }
  };


//Row delete specific functions start
  $scope.selectAllRows=function(){
   
    if($scope.areSelectAllRows==false){

      for(var i=0;i<$scope.currentTableData.length;++i){
        $scope.rowsSelected[i]=true;
      }
      $scope.selectedRowsCount=$scope.currentTableData.length;

    }else if($scope.areSelectAllRows==true){
      for(var i=0;i<$scope.currentTableData.length;++i){
        $scope.rowsSelected[i]=false;
      }
      $scope.selectedRowsCount=0;    
    }
  };

  $scope.selectThisRow=function(index){ 
    $scope.areSelectAllRows=false;   
    if($scope.rowsSelected[index]==false){
      ++$scope.selectedRowsCount;
    }else if($scope.rowsSelected[index]==true){
      if($scope.selectedRowsCount!=0){
        --$scope.selectedRowsCount;
      }      
    }
  };

  $scope.deleteSelectedRows=function(){
    deleteUnsavedRows();//delete rows which doesn't have Id

    var promises=[];
    for(var i=0;i<$scope.rowsSelected.length;++i){
      if($scope.rowsSelected[i]==true){        
        promises.push($scope.deleteCloudObject($scope.currentTableData[i]));
      }
    }

    $q.all(promises).then(function(list){ 
      
      for(var i=0;i<list.length;++i){
       var ndex=$scope.currentTableData.indexOf(list[i]);
       $scope.currentTableData.splice(ndex,1);
       $scope.rowsSelected.splice(ndex,1); 
      } 
      $scope.areSelectAllRows=false;                             
    }, function(err){                
      console.log(err); 
      $scope.areSelectAllRows=false;
    });
   
  };

  function deleteUnsavedRows(){  
    for(var i=0;i<$scope.rowsSelected.length;++i){

      if(($scope.rowsSelected[i]==true) && (!$scope.currentTableData[i].get("id"))){
        $scope.currentTableData.splice(i,1); 
        $scope.rowsSelected.splice(i,1);       
      }

    }      
  }

  $scope.deleteCloudObject = function(obj){
    var q=$q.defer();

    obj.delete().then(function(obj){    
      q.resolve(obj);
    }, function(error){ 
      q.reject(error);
    });

    return  q.promise;
  };
//Row delete specific functions end  

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

  $scope.sortASC=function(column){  

    if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){
      $scope.isTableLoaded=false;

      var i = $scope.currentProject.currentTable.columns.indexOf(column);   

      orderBy=column.name;
      orderByType="asc";

      $scope.loadTableData($rootScope.currentProject.currentTable,orderBy,orderByType,10,0)
      .then(function(list){ 

         $scope.currentTableData=list; 
         $scope.showColOptions[i]=false;        
         $scope.isTableLoaded=true;
         $scope.totalRecords=10;

      },function(error){       
      });
      
    }
};

  $scope.sortDESC=function(column){
    if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){
      $scope.isTableLoaded=false;

      var i = $scope.currentProject.currentTable.columns.indexOf(column);   

      orderBy=column.name;
      orderByType="desc";
      $scope.loadTableData($rootScope.currentProject.currentTable,orderBy,orderByType,10,0)
      .then(function(list){ 

         $scope.currentTableData=list; 
         $scope.showColOptions[i]=false;        
         $scope.isTableLoaded=true;
         $scope.totalRecords=10;

      },function(error){       
      });
      
    }
  };

  $scope.hideThisColumn=function(column){
    var i = $scope.currentProject.currentTable.columns.indexOf(column);
    $scope.showColOptions[i]=false;
    $scope.hideColumn[i]=true;
  };

  $scope.showThisColFromHidden=function(index){
    $scope.hideColumn[index]=false;

    var count=0; 
    for(var i=0; i<$scope.hideColumn.length;++i){
      if($scope.hideColumn[i]==true){
        ++count;
      }
    }
    if(count==0){
      $scope.showHiddenColList=false;
    }      
    
  };

  $scope.showallHiddenCols=function(){
    for(var i=0; i<$scope.currentProject.currentTable.columns.length;++i){
      if($scope.currentProject.currentTable.columns[i].dataType!="Id"){
        $scope.hideColumn[i]=false;  
      }           
    }
  };

  $scope.hideallHiddenCols=function(){
    for(var i=0; i<$scope.currentProject.currentTable.columns.length;++i){
      if($scope.currentProject.currentTable.columns[i].dataType!="Id"){
        $scope.hideColumn[i]=true;  
      }           
    }
  };

  $scope.toggleHiddenColShow=function(){
    if($scope.showHiddenColList==true){
      $scope.showHiddenColList=false;
    }else if($scope.showHiddenColList==false){
      $scope.showHiddenColList=true;
    }
    
  };

  $scope.editThisColumn=function(column){
    var i = $scope.currentProject.currentTable.columns.indexOf(column);       
    $scope.editColumn[i]=true;
  };

  $scope.cancelConfigCol=function(column){
    var i = $scope.currentProject.currentTable.columns.indexOf(column);       
    $scope.editColumn[i]=false;
    $scope.showColOptions[i]=false;
  };

  $scope.saveConfigCol=function(column){
    if(column.isEditable){
      var i = $scope.currentProject.currentTable.columns.indexOf(column);      

      tableService.saveTable(id,$scope.currentProject.currentTable)
      .then(function(table){ 
        $scope.editColumn[i]=false;      
        $scope.showColOptions[i]=false;                              
      },function(error){
       
      });      
    }
  };

  $scope.getType = function(x) {
    return typeof x;
  };

  $scope.isDate = function(x) {
    return x instanceof Date;
  };


$scope.geoPointValidation=function(type,value){
  $scope.geopointEditError=null;
  if(type=="latitude"){

      if(!value || value<-90 || value>90){
        $scope.geopointEditError={
          type:type,
          msg:"Latitude must be in between -90 to 90"
        };
        
      }else{
        $scope.geopointEditError=null;
      }    
  }
  if(type=="longitude"){

      if(!value || value<-180 || value>180){
        $scope.geopointEditError={
          type:type,
          msg:"Longitude must be in between -180 to 180"
        };
      }else{
        $scope.geopointEditError=null;
      }    
  }
};

//Row focused functions
function rowInitMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowEditMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=true;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowErrorMode(index,row,columnName){
  var colNames="";
  for(var i=0;i<$scope.currentProject.currentTable.columns.length;++i){
    var col=$scope.currentProject.currentTable.columns[i];
    if(col.name!=columnName && col.name!="id" && col.name!="createdAt" && col.name!="updatedAt" && col.name!="ACL" && col.required){
        if(!row.get(col.name)){
          colNames=colNames.concat(col.name+","); 
        }          
    }
  }

  $scope.rowInfo="This row is not saved because these "+colNames+" are required";

  $scope.rowEditMode[index]=false;
  $scope.rowErrorMode[index]=true;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowSpinnerMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=true; 
  $scope.rowSavedMode[index]=false;
}

function rowSavedMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=true;
}

function showSaveIconInSecond(index){  
  rowSavedMode(index);
  $timeout(function(){ 
    rowInitMode(index);
  }, 1000);
}

/*------/Partial & Table Definition Functions---------------*/   

});
