'use strict';

app.controller('dataBrowserController',
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
beaconService) {

//Init
var id;
var tableName;
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
$scope.rowWarningMode=[];
$scope.rowErrorMode=[];
$scope.rowSpinnerMode=[]; 
$scope.rowSavedMode=[]; 
$scope.rowInfo=null;

//Field Ediatble
$scope.showInputForEdit=[[]]; 
$scope.editableField=[[]];
$scope.holdFieldData=[[]];
$scope.newListItem=null;

//Relation  
$scope.relatedTableDefArray=[];
$scope.relatedTableRecordArray=[];
$scope.relationError=[];
$scope.relationHoldData=[];
$scope.relationShowInput=[];  

//Random
$scope.isFileSelected=false;  
$scope.currentTableData=[]; 
$scope.modifyListItemError=[];
$scope.listFileSpinner=[];
$scope.listFileError=[];
$scope.orderBy="createdAt"; 
$scope.orderByType="asc";

$scope.init = function() { 
  id = $stateParams.appId;
  tableName= $stateParams.tableName;
  $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
  if(id && tableName){        
    loadProject(id);                   
  }

  //get beacon
  getBeacon();     
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
    rowWarningMode(i,row,column.name);     
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
       rowErrorMode(i,error);    
    });
  }       
  
};
//End Boolean 

//Text
//Invoke Common Type Input enable
$scope.showCommonTypes=function(row,column){
  nullifyFields();
  $scope.editableRow=row;//row
  $scope.editableColumnName=column.name;//column name 
  $scope.editableColumn=column;
  $scope.editableIndex=$scope.currentTableData.indexOf(row);//index      

  //Show INPUT Box to Edit for Commong DataTypes
  if(column.dataType!="Object" && column.dataType!="ACL" && column.dataType!="File" && column.dataType!="GeoPoint" && column.dataType!="List"){
    var arry=[column.name];
    var arry2=[column.name];
    var arry3=[column.name];
    var index=angular.copy($scope.editableIndex);

    //Enable column to edit         
    $scope.showInputForEdit[index]=arry;
    $scope.showInputForEdit[index][column.name]=true;

    $scope.editableField[index]=arry2;
    $scope.holdFieldData[index]=arry3;
  }

  //Set Field or value      
  if(column.dataType=="Password"){ 
    $scope.holdFieldData[index][column.name]=angular.copy(row.get(column.name));     
    $scope.editableField[index][column.name]=null;

  }else if(column.dataType=="DateTime"){
    $scope.editableField[index][column.name]=angular.copy(new Date(row.get(column.name)));     
  }else if(column.dataType=="Object" || column.dataType=="ACL"){

    $scope.editableJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
      $scope.editableJsonObj=null;
    }
    $scope.editableJsonObj =JSON.stringify($scope.editableJsonObj,null,2);
    $("#md-objectviewer").modal();

  }else if(column.dataType=="File"){

    $scope.editableFile=angular.copy(row.get(column.name));
    $("#md-fileviewer").modal();

  }else if(column.dataType=="GeoPoint"){

    $scope.editableGeopoint=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
      $scope.editableGeopoint={};     
      $scope.editableGeopoint.latitude=null;
      $scope.editableGeopoint.longitude=null;
    }
    $("#md-geodocumentviewer").modal();

  }else if(column.dataType=="List"){ 
    $scope.newListItem=null;
    $scope.addListItemError=null; 
    clearListErrors();   
    $scope.editableList=angular.copy(row.get(column.name));
  
    if(column.relatedTo=="DateTime"){    
      convertFieldsISO2DateObj(); 
    }  
    $("#md-list-commontypes").modal();
  }else{
    $scope.editableField[index][column.name]=angular.copy(row.get(column.name));      
  }

  //Focus INPUT Box to Edit for Commong DataTypes
  if(column.dataType!="Object" && column.dataType!="ACL" && column.dataType!="File" && column.dataType!="GeoPoint" && column.dataType!="List"){
    focus(column.id+"column"); 
  }             
};
//End Text

$scope.deleteData=function(row,column){
    if(!column.required){
      nullifyFields();
      $scope.editableRow=row;//row
      $scope.editableColumnName=column.name;//column name 
      $scope.editableColumn=column;
      $scope.editableIndex=$scope.currentTableData.indexOf(row);//index
   
      //Show INPUT Box to Edit for Commong DataTypes
      if(column.dataType!="Object" && column.dataType!="ACL" && column.dataType!="File" && column.dataType!="GeoPoint" && column.dataType!="List"){
        $scope.nullAccepted=true;
        var arry2=[column.name];
        var index=angular.copy($scope.editableIndex);       

        $scope.editableField[index]=arry2;
        $scope.editableField[index][column.name]=null;
        $scope.setAndSave();
      }
    } 

}  

 
$scope.setAndSaveJsonObject=function(){
    $("#md-objectviewer").modal("hide"); 
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
        rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
      }else{
        rowSpinnerMode($scope.editableIndex);        
    
        //Save Cloud Object
        $scope.saveCloudObject($scope.editableRow)
        .then(function(obj){           
          $scope.editableJsonObj=null;
          showSaveIconInSecond($scope.editableIndex);
        }, function(error){          
          $scope.editableJsonObj=null;          
          rowErrordMode($scope.editableIndex,error);     
        });
      }  

    }else{
      $("#md-objectviewer").modal("hide");
      $scope.editableJsonObj=null;
    }     
    
};  
//End ACL && JsonObject 

$scope.fileSelected=function(selectedFile,fileName,fileObj){
  $scope.isFileSelected=true;
  $scope.selectedFile=selectedFile;
  $scope.selectedfileName=fileName;
  $scope.selectedFileObj=fileObj;
  $scope.selectedFileExtension=fileName.split(".")[fileName.split(".").length-1]; 
};

$scope.setAndSaveFile=function(){ 
  $("#md-fileviewer").modal("hide");   
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
                  
            rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
          }else{
            rowSpinnerMode($scope.editableIndex); 
              
              $scope.editableRow.set($scope.editableColumnName,cloudBoostFile);            
              //Save Cloud Object
              $scope.saveCloudObject($scope.editableRow)
              .then(function(obj){                 
                $scope.removeSelectdFile();
                showSaveIconInSecond($scope.editableIndex);
              }, function(error){                 
                $scope.removeSelectdFile();                   
                rowErrorMode($scope.editableIndex,error);
              }); 
          }             

      }, function(err){
        rowErrorMode($scope.editableIndex,err);
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
    $("#md-fileviewer").modal("hide");
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
      rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
    }else{
      rowSpinnerMode($scope.editableIndex);
                  
      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){  
        $scope.editableFile=null;
        $scope.removeSelectdFile();
        showSaveIconInSecond($scope.editableIndex);
        
      }, function(error){ 
        $scope.editableFile=null;
        $scope.removeSelectdFile();
        rowErrorMode($scope.editableIndex,error);            
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
/*$scope.toggleGoogleMap=function(event,row,column){     
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
};*/

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
  $("#md-geodocumentviewer").modal("hide");
  rowEditMode($scope.editableIndex);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
     if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
     }
  });
  
  if(requiredField){  
        
    rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);
  }else{
    rowSpinnerMode($scope.editableIndex);

    //Save Cloud Object
    $scope.saveCloudObject($scope.editableRow)
    .then(function(obj){       
      $scope.editableGeopoint=null;
      showSaveIconInSecond($scope.editableIndex);
    }, function(error){       
      $scope.editableGeopoint=null;
      rowErrorMode($scope.editableIndex,error);    
    });
  }  
}  

//End of Geo point

//RELATION
$scope.addRelation=function(row,column){
  nullifyEditable();
  $scope.editableRow=row;//row
  $scope.editableColumn=column;//column
  $scope.editableColumnName=column.name;//column name 
  $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

  $scope.relColumn=_.first(_.where($rootScope.currentProject.currentTable.columns,{name:column.name}));
  $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.relColumn.relatedTo}));
  
  if(row.get(column.name)){
    //var tableName=row.get(column.name).document._tableName;
    var rowId=row.get(column.name).document._id; 
    $scope.linkedRelatedDoc=rowId;
    $scope.relToRel=false;
    $("#md-reldocumentviewer").modal();
    
  }else{
    $scope.linkedRelatedDoc=null;
    $("#md-reldocumentviewer").modal();
  } 
};

$scope.addRelationToRelation=function(cloudObject,column){  
  
  $scope.relEditableRow=cloudObject;//row
  $scope.relEditableColumn=column;

  var index=$scope.relatedTableDefArray.length-1;  
  var columns=$scope.relatedTableDefArray[index].columns;

  $scope.relColumn=_.first(_.where(columns,{name:column.name}));
  $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.relColumn.relatedTo}));
  
  if(cloudObject.get(column.name)){
  
    var rowId=cloudObject.get(column.name).document._id; 
    $scope.linkedRelatedDoc=rowId;
    $scope.relToRel=true;
    $("#md-reldocumentviewer").modal();
    
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
       
   $scope.relationTableData=list;
   $("#md-searchreldocument").modal();          
   //$scope.$digest(); 
                                          
  },function(error){ 
    $scope.searchRelDocsError=error;      
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
      rowWarningMode(i,$scope.editableRow,$scope.editableColumnName);
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
        rowErrorMode(i,error);
      });

    }      
};

$scope.viewRelationData=function(row,column,index){
    nullifyEditable();
    //$scope.editableRow=row;//row
    //$scope.editableColumn=column;
    //$scope.editableColumnName=column.name;//column name 
    //$scope.editableIndex=$scope.currentTableData.indexOf(row);//index    

    if(row.get(column.name) instanceof Array){
      $("#md-list-commontypes").modal("hide")
      var tableName=row.get(column.name)[index].document._tableName;
      var rowId=row.get(column.name)[index].document._id;
    }else{
      var tableName=row.get(column.name).document._tableName;
      var rowId=row.get(column.name).document._id;
    } 
    var tableDef=_.first(_.where($rootScope.currentProject.tables, {name: tableName})); 

    //get Table data
    $scope.queryTableById(tableName,rowId)
    .then(function(record){       

      if(record){
        //Convert ISODate 2 DateObject
        convertISO2DateObj(tableDef,record); 
        $scope.relatedTableDefArray.push(tableDef);       
        $scope.relatedTableRecordArray.push(record);

        //Nullify errors
        //clearRelationErrors();        
      }     
    
      $("#md-relationviewer").modal();

    }, function(error){
      $scope.viewRelDataError=error;
      $("#md-relationviewer").modal();  
    });
    //End of get Table data       
}; 

$scope.goToPrevRel=function(){
  //Simple relation
  if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
    var lastIndex=$scope.relatedTableDefArray.length-1;
    $scope.relatedTableDefArray.splice(lastIndex,1);
    $scope.relatedTableRecordArray.splice(lastIndex,1);
  
    $("#md-relationviewer").modal();      
  }
};

$scope.closeRelModal=function(){  
  //Simple Relation
  if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
    var lastIndex=$scope.relatedTableDefArray.length-1;
    $scope.relatedTableDefArray.splice(lastIndex,1);
    $scope.relatedTableRecordArray.splice(lastIndex,1);
  
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

$scope.deleteRelLink=function(){
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
      rowWarningMode(i,$scope.editableRow,$scope.editableColumnName);     
    }else{
      rowSpinnerMode(i);
                  
      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){      
        $scope.relatedTableDefArray=[];
        $scope.relatedTableRecordArray=[];
        showSaveIconInSecond(i);
        $scope.linkedRelatedDoc=null;
        $("#md-reldocumentviewer").modal("hide");
      }, function(error){ 
          rowErrorMode(i,error); 
          $("#md-reldocumentviewer").modal("hide"); 
      });

    }
};

$scope.holdRelationData=function(cloudObject,column,data){
  if(!column.required){
    if(column.dataType=="Password"){
      $scope.relationHoldData[column.name]=null;
      $scope.relationShowInput[column.name]=true;        
      $scope.nullAccepted=false;
      var inputId=column.name+"relcol";
      focus(inputId); 
      //$scope.relatedTableRecordArray[$scope.relatedTableRecordArray.length-1].document[column.name]=null;
    }      
  }
};

$scope.deleteRelationData=function(cloudObject,column,data){
  if(!column.required){
    if(column.dataType=="Password"){    
      cloudObject.set(column.name,null);
      $scope.nullAccepted=true;
    }
  }    
};

$scope.setRelationData=function(cloudObject,column,data){
  $scope.relationError[column.name]=null;

  //DateTime
  if(column.dataType=="DateTime"){
    data=new Date(data);
  }
  //ACL or Object
  if(column.dataType=="ACL" || column.dataType=="Object"){      
    try {
      data=JSON.parse(data);
      if(typeof data!="object"){
        $scope.relationError[column.name]="Invalid Object";
      }else{
        $("#md-rel-objectviewer").modal("hide");
      }  
    }
    catch(err) {
      $scope.relationError[column.name]="Invalid Object";
    }
  }
  //Email
  if(column.dataType=="Email" && !validateEmail(data)){
    $scope.relationError[column.name]="Invalid Email";
  }
  //URL
  if(column.dataType=="URL" && !validateURL(data)){
    $scope.relationError[column.name]="Invalid URL";
  }       

  //Number
  if(column.dataType=="Number"){
    var tempData=data;
    data=parseInt(data);
    if(data.toString()==tempData){

    }else{
      data=null;
      $scope.relationError[column.name]="Invalid Number";
    }
  }
  //File
  if(column.dataType=="File"){
    $("#md-rel-fileviewer").modal("hide");
  }
  //Relation
  if(column.dataType=="Relation"){
    if(data){
      $("#md-searchreldocument").modal("hide");
    }else{
      $scope.linkedRelatedDoc=null;
    }    
    $("#md-reldocumentviewer").modal("hide");
  }

  //Password
  if(column.dataType=="Password"){
    if(!$scope.nullAccepted && !data){
      $scope.relationShowInput[column.name]=false;
    }else if(!$scope.relationError[column.name]){
      cloudObject.set(column.name,data);
    }
    $scope.nullAccepted=true;      
  }else if(column.dataType=="List"){//List
    if(!checkListErrors()){
      cloudObject.set(column.name,data);
      $("#md-list-commontypes").modal("hide");
    }   
  }else if(!$scope.relationError[column.name]){
    cloudObject.set(column.name,data);
  }
      
};

$scope.showRelationModals=function(cloudObject,column){
  $scope.relEditableRow=cloudObject;//row
  $scope.relEditableColumn=column;
  $scope.relEditableColumnName=column.name;

  //ACL or Object
  if(column.dataType=="ACL" || column.dataType=="Object"){
    
    $scope.relEditableJsonObj=angular.copy(cloudObject.get(column.name));   
    if(!cloudObject.get(column.name)){
      $scope.relEditableJsonObj=null;
    }
    $scope.relEditableJsonObj=JSON.stringify($scope.relEditableJsonObj,null,2);
    $("#md-rel-objectviewer").modal("show");
  }
  //GeoPoint
  if(column.dataType=="GeoPoint"){
    $scope.relEditableGeopoint=angular.copy(cloudObject.get(column.name));   
    if(!cloudObject.get(column.name)){
       $scope.relEditableGeopoint={};     
       $scope.relEditableGeopoint.latitude=null;
       $scope.relEditableGeopoint.longitude=null;
    }
    $("#md-rel-geodocumentviewer").modal();
  }
  //File
  if(column.dataType=="File"){
    $scope.relEditableFile=angular.copy(cloudObject.get(column.name));
    $("#md-rel-fileviewer").modal();
  }
  //List
  if(column.dataType=="List"){
    
  }
    
};
//relation File
$scope.setRelFile=function(){    
  if($scope.selectedFileObj) {
    $("#md-rel-fileviewer").modal("hide");
    $scope.setRelFileSpinner=true;

    getCBFile($scope.selectedFileObj)
    .then(function(cloudBoostFile){
    
        $scope.relEditableRow.set($scope.relEditableColumnName,cloudBoostFile);
        
        $scope.relEditableRow=null; 
        $scope.relEditableColumn=null;
        $scope.relEditableColumnName=null;
        $scope.relEditableFile=null;
        $scope.removeSelectdFile(); 
        $scope.setRelFileSpinner=false;       

    }, function(err){
      $scope.setRelFileSpinner=false; 
      $scope.setRelFileError="Something went wrong .try again";
    });
            
  }
};
//End of Relation File


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

//Clear All Errors
function clearRelationErrors(){

  var columns=$scope.relatedTableDefArray[$scope.relatedTableDefArray.length-1].columns;
  for(var i=0;i<columns.length;++i){
    var colname=columns[i].name;
    $scope.relationError[colname]=null;
    $scope.relationShowInput[colname]=false;       
  }
  
}
//Check List Errors
function checkRelationErrors(){
  var columns=$scope.relatedTableDefArray[$scope.relatedTableDefArray.length-1].columns;

  var there = _.find(columns, function(eachCol){ 
    if($scope.relationError[eachCol.name]){
      return eachCol;
    }
  });

  if(there){
    return true;
  }else{
    return false;
  }
  
}

//Relation List
$scope.showRelationList=function(cloudObject,column){
  nullifyEditable();
  $scope.editableRow=cloudObject;//row
  $scope.editableColumn=column;//column
  $scope.editableColumnName=column.name;//column name

  $scope.editableList=angular.copy(cloudObject.get(column.name)); 

  $scope.newListItem=null;
  $scope.addListItemError=null;
  clearListErrors();  
    
  if(column.relatedTo=="DateTime"){    
    convertFieldsISO2DateObj(); 
  } 
  $scope.isRelationalList=true; 
  $("#md-list-commontypes").modal();
};
//End of relation

function convertFieldsISO2DateObj(){
  if($scope.editableList && $scope.editableList.length>0){
    for(var i=0;i<$scope.editableList.length;++i){
        $scope.editableList[i]= new Date($scope.editableList[i]);
    }    
  }      
}

$scope.addListItem=function(newListItem){
  $scope.addListItemError=null;
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
      if($scope.editableColumn.relatedTo=="Number"){ 
        var tempData=newListItem;
        newListItem=parseInt(newListItem);
        if(newListItem.toString()==tempData){

        }else{
          newListItem=null;
          $scope.addListItemError="Invalid Number";
        }               
      }
      if($scope.editableColumn.relatedTo=="Email" && !validateEmail(newListItem)){     
        newListItem=null;
        $scope.addListItemError="Invalid Email";
      }
      if($scope.editableColumn.relatedTo=="URL" && !validateURL(newListItem)){     
        newListItem=null;
        $scope.addListItemError="Invalid URL";
      }     

      if($scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
        $("#md-searchlistdocument").modal("hide");
      }

      if(newListItem || $scope.editableColumn.relatedTo=="Boolean" || $scope.editableColumn.relatedTo=="Object"){
        $scope.editableList.push(newListItem);
        $scope.newListItem=null;
      }                 
  }
  
};

$scope.modifyListItem=function(data,index){
  $scope.modifyListItemError[index]=null;
  if(data || $scope.editableColumn.relatedTo=="Boolean" || $scope.editableColumn.relatedTo=="Object"){
      
      if($scope.editableColumn.relatedTo=="DateTime"){    
        data=new Date(data); 
      }      
      if($scope.editableColumn.relatedTo=="Number"){ 
        var tempData=data;
        data=parseInt(data);
        if(data.toString()==tempData){

        }else{
          data=null;
          $scope.modifyListItemError[index]="Invalid Number";
        }               
      }
      if($scope.editableColumn.relatedTo=="Email" && !validateEmail(data)){     
        data=null;
        $scope.modifyListItemError[index]="Invalid Email";
      }
      if($scope.editableColumn.relatedTo=="URL" && !validateURL(data)){     
        data=null;
        $scope.modifyListItemError[index]="Invalid URL";
      }

      if($scope.editableColumn.relatedTo=="Object"){ 
        data=JSON.parse(data);

        if(typeof data!="object"){
          data=null;
          $scope.modifyListItemError[index]="Invalid Object";
        }else{          
          $("#md-list-objectviewer").modal("hide"); 
        }        
      }

      if((data || $scope.editableColumn.relatedTo=="Boolean") && (!$scope.modifyListItemError[index])){
        $scope.editableList[index]=data;        
      }                      
  }
  
};

$scope.deleteListItem=function(index){
  $("#md-list-fileviewer").modal("hide");
  $scope.editableList.splice(index,1);
  if($scope.editableList.length==0){
    $scope.editableList=null;
  }
  if($scope.editableColumn.relatedTo=="File"){     
    $scope.listEditableRow=null;//row
    $scope.listEditableColumn=null;//row
    $scope.listIndex=null;
  }   
};

$scope.setAndSaveList=function(){ 
  if(!checkListErrors()){
  
    $("#md-list-commontypes").modal("hide");

    rowEditMode($scope.editableIndex);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });  
    
    $scope.editableRow.set($scope.editableColumnName,$scope.editableList);

    if(requiredField){      
      rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);     
    }else{
      rowSpinnerMode($scope.editableIndex);

      //Save Cloud Object
      $scope.saveCloudObject($scope.editableRow)
      .then(function(obj){ 
       
        showSaveIconInSecond($scope.editableIndex);

        //$scope.$digest();  
      }, function(error){       
        rowErrorMode($scope.editableIndex,error);
        //$scope.$digest();         
      });

    } 
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
$scope.addListFileModal=function(){  
  $("#md-list-fileviewer").modal("show");
};
$scope.addListFile=function(){   
  $("#md-list-fileviewer").modal("hide"); 
  if($scope.selectedFileObj) {     
    if(!$scope.editableList || $scope.editableList.length==0){
      $scope.editableList=[];
    }
    var dummyObj={};
    $scope.editableList.push(dummyObj);
    $scope.listFileSpinner[$scope.editableList.length-1]=true;

    getCBFile($scope.selectedFileObj)
    .then(function(cloudBoostFile){     
      $scope.editableList[$scope.editableList.length-1]=cloudBoostFile;       
      //$scope.editableList.push(cloudBoostFile);      
      $scope.removeSelectdFile();
      $scope.listFileSpinner[$scope.editableList.length-1]=false;

    }, function(err){
      $scope.listFileError[$scope.editableList.length-1]="Something went wrong. try again";
    });

  }
};

//List ShowFile
$scope.showListFile=function(row,column,index){ 
  $scope.listEditableRow=row;//row
  $scope.listEditableColumn=column;//row
  $scope.listIndex=index;   
  $("#md-list-fileviewer").modal("show");
};

//List Relationdocs search
$scope.listSearchRelationDocs=function(){ 
  $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.editableColumn.relatedTo}));
  //List Relations records 
  $scope.loadTableData($scope.tableDef,"createdAt","asc",20,0)
  .then(function(list){ 
     $scope.listRelationTableData=list; 
     $("#md-searchlistdocument").modal("show");         
     //$scope.$digest();                                       
  },
  function(error){ 
    $scope.searchRelDocsError=error;      
  });
  //List Relations records   
};



//List Geopoint
/*
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
};*/

//List Geopoint
$scope.addListGeopointModal=function(){ 
  $scope.listEditableGeopoint={}; 
  $scope.listEditableGeopoint.latitude=null;
  $scope.listEditableGeopoint.longitude=null;
  $("#md-list-geodocumentviewer").modal("show");
};

$scope.listAddGeopoint=function(valid){
  if(valid  && !$scope.geopointEditError){    
    var loc = new CB.CloudGeoPoint($scope.listEditableGeopoint.latitude,$scope.listEditableGeopoint.longitude);
    if(!$scope.editableList || $scope.editableList.length==0){
      $scope.editableList=[];
    }
    $scope.editableList.push(loc);     
    $scope.listEditableGeopoint.latitude=null;
    $scope.listEditableGeopoint.longitude=null; 
    $("#md-list-geodocumentviewer").modal("hide");     
  }  
};

$scope.editListGeoPoint=function(index){
  $scope.geopointListIndex=index;
  $scope.listEditableGeopoint={}; 
  $scope.listEditableGeopoint.latitude=$scope.editableList[index].latitude;
  $scope.listEditableGeopoint.longitude=$scope.editableList[index].longitude;
  $("#md-list-edit-geodocumentviewer").modal("show");
};

$scope.modifyListGeoPoint=function(valid){  
  if(valid  && !$scope.geopointEditError){

    //checking for old data!=new data
    if(($scope.editableList[$scope.geopointListIndex].latitude!=$scope.listEditableGeopoint.latitude) || ($scope.editableList[$scope.geopointListIndex].longitude!=$scope.listEditableGeopoint.longitude)){
      var loc = new CB.CloudGeoPoint($scope.listEditableGeopoint.latitude,$scope.listEditableGeopoint.longitude);   
      $scope.editableList[$scope.geopointListIndex]=loc;      
      
      $scope.listEditableGeopoint.latitude=null;
      $scope.listEditableGeopoint.longitude=null; 
      $("#md-list-edit-geodocumentviewer").modal("hide");   
     
    }
    
  }  
};

//Clear List All Errors
function clearListErrors(){
  if($scope.modifyListItemError && $scope.modifyListItemError.length>0){
    for(var i=0;i<$scope.modifyListItemError.length;++i){
      $scope.modifyListItemError[i]=null;      
    }
  }
}
//Check List Errors
function checkListErrors(){
  if($scope.modifyListItemError && $scope.modifyListItemError.length>0){
    var there = _.find($scope.modifyListItemError, function(val){ 
        if(val){
          return val;
        }
    });
    if(there){
      return true;
    }else{
      return false;
    }

  }else{
    return false;
  }  
}
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
  $scope.nullAccepted=false;
}

//Save 
$scope.setAndSave=function(){
  var data=$scope.editableField[$scope.editableIndex][$scope.editableColumnName];
  var holdData=$scope.holdFieldData[$scope.editableIndex][$scope.editableColumnName];

  if(!$scope.nullAccepted && $scope.editableColumn.dataType=="Password" && (!data || data==null)){
    $scope.editableField[$scope.editableIndex][$scope.editableColumnName]=holdData;
    $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
  }else{         
    save();
  }      
  
};

function save(){
    //Check if previous value is not equal to modified value
    $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumnName]=false;
    if($scope.editableRow.get($scope.editableColumnName)!=$scope.editableField[$scope.editableIndex][$scope.editableColumnName]){
        rowEditMode($scope.editableIndex);       

        var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
          if(everyCol.name!=$scope.editableColumnName && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
            if(!$scope.editableRow.get(everyCol.name)){
              return everyCol;
            }          
          }
        });

        if($scope.editableColumn.dataType=="Number"){
          var tempValue=angular.copy($scope.editableField[$scope.editableIndex][$scope.editableColumnName]);
          $scope.editableField[$scope.editableIndex][$scope.editableColumnName]=parseInt($scope.editableField[$scope.editableIndex][$scope.editableColumnName]);
          if(isNaN($scope.editableField[$scope.editableIndex][$scope.editableColumnName])){
            $scope.editableField[$scope.editableIndex][$scope.editableColumnName]=tempValue;
          }
        }
        $scope.editableRow.set($scope.editableColumnName,$scope.editableField[$scope.editableIndex][$scope.editableColumnName]);
        if(requiredField){      
          rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumnName);          
        }else{
          rowSpinnerMode($scope.editableIndex);          
        
          //Save Cloud Object
          $scope.saveCloudObject($scope.editableRow)
          .then(function(obj){               
            showSaveIconInSecond($scope.editableIndex);
          }, function(error){                         
            rowErrorMode($scope.editableIndex,error);   
          });
        }
    }
}
//End of Save 

//Save for relation table 
$scope.saveRelationObj=function(relCloudObject){
  if(!checkRelationErrors()){  

    $scope.relationSpinnerMode=true;   
   
    var index=$scope.relatedTableDefArray.length-1;
    var table=$scope.relatedTableDefArray[index];            

    //check for rquired columns
    var colNames=null;
    for(var i=0;i<table.columns.length;++i){
        var col=table.columns[i];
        if(col.name!="id" && col.name!="createdAt" && col.name!="updatedAt" && col.name!="ACL" && col.required){
            if(!relCloudObject.get(col.name)){
              colNames=colNames.concat(col.name+","); 
            }          
        }
    }
     
    if(colNames){
      $scope.relationSpinnerMode=false;
      $scope.relationErrorMode="Not Saved! These "+colNames+" are required";           
    }else{
      $scope.relationErrorMode=null;
      $scope.relationSpinnerMode=true;

      //Save Cloud Object
      $scope.saveCloudObject(relCloudObject)
      .then(function(obj){
        //Convert ISO to dateObj 
        convertISO2DateObj(table,relCloudObject);

        $scope.relationSpinnerMode=false;
        $scope.relationSaveTickMode=true;
        $timeout(function(){ 
          $scope.relationSaveTickMode=false;          
        }, 1000); 

        //Nullify errors
        clearRelationErrors();

      }, function(error){ 
        $scope.relationSpinnerMode=false;   
        $scope.relationErrorMode=error;            
      });
    }

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
        errorNotify('We cannot load your project at this point in time. Please try again later.');        
      });
}

function getProjectTables(){

  tableService.getProjectTables($rootScope.currentProject)
  .then(function(data){       

    if(!data){      
      $rootScope.currentProject.tables=[];                       
    }else if(data){                        
        $rootScope.currentProject.tables=data;

        getProjectTableByName(tableName)
        .then(function(table){
            if(table){
              $rootScope.currentProject.currentTable=table;

              //Load data 
              $scope.loadTableData(table,$scope.orderBy,$scope.orderByType,10,0)
              .then(function(list){              
                  $scope.currentTableData=list;
                  $scope.totalRecords=10;
                  $scope.isTableLoaded=true; 

                  //Fixed Header Re-run                 
                  //$(".smoothTable").floatThead('reflow')
                                                                                 
              },function(error){
                $scope.isTableLoaded=true; 
                $scope.tableLoadedError="Error in loading table records";                                
              });
              //end of loafing data                 
            }                              
        },
        function(error){ 
          errorNotify('Error getting table');              
        });

    }else{                                                                   
      $rootScope.currentProject.tables=[];
    }          
         
  }, function(error){  
    errorNotify('We cannot load your tables at this point in time. Please try again later.');      
  });
} 

function getProjectTableByName(tableDefName){
  var q=$q.defer();

  tableService.getProjectTableByName(tableDefName)
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
    $scope.loadingRecords=true;
    //load more data
    $scope.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,5,$scope.totalRecords)
    .then(function(list){
      if(list && list.length>0){
        if($scope.currentTableData.length>0){
          $scope.currentTableData=$scope.currentTableData.concat(list); 
        }else{
          $scope.currentTableData=list;
        }
        $scope.totalRecords=$scope.totalRecords+list.length;
      } 
      $scope.loadingRecords=false;         
      
      //$scope.$digest();  
                                      
    },
    function(error){ 
    $scope.loadingRecords=false;      
    });
    //end of load more data
  }     
 
};

/*------Partial & Table Definition Functions---------------*/ 

$scope.goToTables=function(){
  window.location.href="#/"+id+"/table";
};

$scope.goToDataBrowser=function(t){  
  window.location.href="#/"+id+"/table/"+t.name;
};

$scope.filterDataType=function(dataTypeObj){
  if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation" && dataTypeObj.name!="Password"){
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
  //$('#scrollbar-wrapper').scrollTo('#extra-col-th',400,{axis:'x'});   
  
};
//infinite-scroll="addMoreRecords()"
$scope.addColumn = function(valid) {
  if(valid){
    $scope.showAddColPopUp=false; 
    $scope.saveSpinner=true;

    var column = new CB.Column($scope.newColumnObj.name, $scope.newColumnObj.dataType, $scope.newColumnObj.required, $scope.newColumnObj.unique);
    $rootScope.currentProject.currentTable.addColumn(column);

    //$rootScope.currentProject.currentTable.columns.push($scope.newColumnObj);
    $("#scrollbar-wrapper").mCustomScrollbar("update");
    $(".data-table-design").css("height","75.90vh");
    $timeout(function(){ 
      $(".data-table-design").css("height","76vh");
    }, 2000);
    

    tableService.saveTable($rootScope.currentProject.currentTable)
    .then(function(table){        
      $scope.newColumnObj=null;
      $scope.saveSpinner=false;
      $('#scrollbar-wrapper').scrollTo('#extra-col-th',400,{axis:'x'});                                             
    },
    function(error){ 
      errorNotify("Unable to add the column right now");
      $scope.saveSpinner=false;
      var index=$rootScope.currentProject.currentTable.columns.indexOf($scope.newColumnObj);
      $rootScope.currentProject.currentTable.columns.splice(index,1)            
    });

    //Update Beacon
    if($scope.beacon && !$scope.beacon.firstColumn){
      $scope.beacon.firstColumn=true;
      updateBeacon();   
    }

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

    //Hold
    var tempTable=angular.copy($scope.currentProject.currentTable);    
    var index = tempTable.columns.indexOf(column);   

    //Delete
    var column = new CB.Column(column.name, column.dataType);
    $scope.currentProject.currentTable.deleteColumn(column);

    $scope.showColOptions[index]=false;
    $scope.saveSpinner=true;    

    tableService.saveTable($scope.currentProject.currentTable)
    .then(function(table){        

        //load more data
        /*$scope.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,orderByType,$scope.totalRecords,0)
        .then(function(list){
          if(list && list.length>0){              
            $scope.currentTableData=list;        
          } 
          $scope.saveSpinner=false;           
          //$scope.$digest();  
                                          
        },
        function(error){ 
         $scope.saveSpinner=false;
         errorNotify(error);        
        });*/
        //end of load more data

    },function(error){
      $scope.saveSpinner=false;
      errorNotify("Unable to delete the column right now");     
      //ReAssign
      $rootScope.currentProject.currentTable=tempTable;
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
  $scope.saveSpinner=true;
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
     --$scope.selectedRowsCount;
    } 
    $scope.areSelectAllRows=false; 
    $scope.saveSpinner=false;                            
  }, function(err){                
    errorNotify(err);
    $scope.areSelectAllRows=false;
    $scope.saveSpinner=false;
  });
 
};

function deleteUnsavedRows(){  
  for(var i=0;i<$scope.rowsSelected.length;++i){

    if(($scope.rowsSelected[i]==true) && (!$scope.currentTableData[i].get("id"))){
      $scope.currentTableData.splice(i,1); 
      $scope.rowsSelected.splice(i,1); 
      --$scope.selectedRowsCount;      
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

  //Update Beacon
  if($scope.beacon && !$scope.beacon.firstRow){
    $scope.beacon.firstRow=true;
    updateBeacon();   
  }                                         
};

$scope.sortASC=function(column){  

  if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){
    //$scope.isTableLoaded=false;
    $scope.loadingRecords=true;

    var i = $scope.currentProject.currentTable.columns.indexOf(column); 
    $scope.showColOptions[i]=false;  

    $scope.orderBy=column.name;
    $scope.orderByType="asc";    

    $scope.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,10,0)
    .then(function(list){ 

       $scope.currentTableData=list; 
       $scope.showColOptions[i]=false;        
       //$scope.isTableLoaded=true;
       $scope.loadingRecords=false;
       $scope.totalRecords=10;

    },function(error){ 
      errorNotify(error); 
      $scope.loadingRecords=false;       
    });
    
  }
};

$scope.sortDESC=function(column){
  if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){
    //$scope.isTableLoaded=false;
    $scope.loadingRecords=true;

    var i = $scope.currentProject.currentTable.columns.indexOf(column);  
    $scope.showColOptions[i]=false; 

    $scope.orderBy=column.name;
    $scope.orderByType="desc";
    $scope.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,10,0)
    .then(function(list){ 

       $scope.currentTableData=list; 
       $scope.showColOptions[i]=false;        
       //$scope.isTableLoaded=true;
       $scope.loadingRecords=false;
       $scope.totalRecords=10;

    },function(error){
      errorNotify(error); 
      $scope.loadingRecords=false;        
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
    $scope.saveSpinner=true;

    tableService.saveTable(id,$scope.currentProject.currentTable)
    .then(function(table){ 
      $scope.editColumn[i]=false;      
      $scope.showColOptions[i]=false; 
      $scope.saveSpinner=false;                             
    },function(error){
      $scope.saveSpinner=false;
      errorNotify(error);  
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
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowEditMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=true;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowWarningMode(index,row,columnName){
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
  $scope.rowWarningMode[index]=true;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

function rowErrorMode(index,error){
  $scope.rowInfo=error;
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=true;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
  //General Spinner
  $scope.saveSpinner=false;
}

function rowSpinnerMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=true; 
  $scope.rowSavedMode[index]=false;
  //General Spinner
  $scope.saveSpinner=true;
}

function rowSavedMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=true;
  //General Spinner
  $scope.saveSpinner=false;
}

function showSaveIconInSecond(index){  
  rowSavedMode(index);
  $timeout(function(){ 
    rowInitMode(index);
  }, 1000);
}

/*------/Partial & Table Definition Functions---------------*/ 

$scope.goToDocumentation=function(){
  //Update Beacon
  if($scope.beacon && !$scope.beacon.documentationLink){
    $scope.beacon.documentationLink=true;
    updateBeacon();   
  }

  //Redirect to documentation  
  window.open("https://docs.cloudboost.io", "_blank");
};

//get Beacon Obj from backend
function getBeacon(){
  beaconService.getBeacon()         
  .then(function(beaconObj){
      $scope.beacon=beaconObj;
      //Start the beacon
      initBeacon();                            
  },function(error){      
  });
}

//update Beacon
function updateBeacon(){   
  beaconService.updateBeacon($scope.beacon)         
  .then(function(beaconObj){
      //$scope.beacon=beaconObj;                            
  },function(error){      
  });
}

function initBeacon(){
  var x = 0;
  addCircleToDoc(x);
  addCircleToCol(x);
  addCircleToRow(x);
  setInterval(function () {
      if (x === 0) {
          x = 1;
      }
      addCircleToDoc(x);
      addCircleToCol(x);
      addCircleToRow(x);
      x++;
  }, 1200);
} 

function addCircleToDoc(id) {
  $('.first-data-beacon-container').append('<div  id="' + id + '" class="circlepulse2 first-data-beacon"></div>');

  $('#' + id).animate({
      'width': '50px',
      'height': '50px',
      'margin-top': '-20px',
      'margin-left': '-20px',
      'opacity': '0'
  }, 4000, 'easeOutCirc');

  setInterval(function () {
      $('#' + id).remove();
  }, 4000);
}
function addCircleToCol(id) {
  $('.first-column-beacon-container').append('<div  id="' + id + '" class="circlepulse3 first-column-beacon"></div>');

  $('#' + id).animate({
      'width': '50px',
      'height': '50px',
      'margin-top': '-20px',
      'margin-left': '-20px',
      'opacity': '0'
  }, 4000, 'easeOutCirc');

  setInterval(function () {
      $('#' + id).remove();
  }, 4000);
}
function addCircleToRow(id) {
  $('.first-row-beacon-container').append('<div  id="' + id + '" class="circlepulse3 first-row-beacon"></div>');

  $('#' + id).animate({
      'width': '50px',
      'height': '50px',
      'margin-top': '-20px',
      'margin-left': '-20px',
      'opacity': '0'
  }, 4000, 'easeOutCirc');

  setInterval(function () {
      $('#' + id).remove();
  }, 4000);
}
function validateEmail(email){      
  if(email){
    var emailExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return emailExp.test(email);            
  }        
}
function validateURL(url){      
  if(url){
    var myRegExp =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;            
    return myRegExp.test(url);     
  }        
}
//Notification

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

});
