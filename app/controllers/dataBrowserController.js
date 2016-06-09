'use strict';

app.controller('dataBrowserController',
function($scope, 
$rootScope,
$q,
$document,
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
focus,
beaconService,
filterService,
cloudBoostApiService,
sharedDataService) {

//Init
var id;
var tableName;
$scope.isTableLoaded=false;
$rootScope.showAppPanel=false;
$rootScope.isFullScreen=true; 

//Column specific
$scope.showColOptions=[];
$scope.showHiddenColList=false;
$scope.showFilterList=false;
$scope.showAddColPopUp=false;
$scope.enableColAdvance=false;
$scope.hideColumn=[];
$scope.editColumn=[];
$scope.filtersList=[];
$scope.filterSpinner=[];
$scope.filterListOfList=[];
$scope.filterNotify=null;
$scope.isSearchBoxOpen=false;

/***Errors,Spinners,Warnings,SavedTick***/
//Array Types
$scope.rowEditMode=[];
$scope.rowWarningMode=[];
$scope.rowErrorMode=[];
$scope.rowSpinnerMode=[]; 
$scope.rowSavedMode=[];
$scope.showSerialNo=[];
$scope.holdSerialNoInfo=[];
$scope.rowsSelected=[];

//Simple dataTypes
$scope.commonSpinner=false;
$scope.commonSaved=false;
$scope.commonError=null;
$scope.commonWarning=null;

$scope.selectedRowsCount=0;
$scope.areSelectAllRows=false; 
$scope.rowInfo=null;
/***Errors,Spinners,Warnings,SavedTick***/

//Field Ediatble
$scope.showInputForEdit=[[]]; 
$scope.editableField=[[]];
$scope.holdFieldData=[[]];
$scope.activeUIelm=[];

/****Relation Modal ****/
$scope.relatedTableDefArray=[];
$scope.relatedTableRecordArray=[];
$scope.fieldsOrderArray=[];


//Random
$scope.viewRelDataError=[];
$scope.currentTableData=[];
$scope.fileAllowedTypes="*";//All

$scope.orderBy="createdAt"; 
$scope.orderByType="desc";
$scope.docsLimit=50;
$scope.hiddenColumnCount=0;
$scope.editableFile=[];
$scope.countItemsInTable=0;

$scope.init = function() { 
  id = $stateParams.appId;
  tableName= $stateParams.tableName;
  $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
  if(id && tableName){        
    loadProject(id);                   
  }

  //get beacon
  getBeacon();
  //Get FilterTypes
  $scope.filterTypes=filterService.getFilterTypes();

  //Flush Acl data in sharedDataService
  sharedDataService.flushAclArray();

  closeAllModals();

  if(!__isDevelopment){
    /****Tracking*********/            
     mixpanel.track('Visited databrowser', { "Table name": tableName,"appId": id});
    /****End of Tracking*****/
  }     
}; 


$scope.invokeFields=function(row,column,event){
  if(!_isClickedOnSameElm(event)){

    //Save Last Field
    lastDocumentClick(event);

    //Nullify if any
    nullifyFields();

    $scope.editableRow=row;
    $scope.editableColumn=column;
    $scope.editableIndex=$scope.currentTableData.indexOf(row); 
    
    var arry=[column.name];
    var arry2=[column.name];
    var arry3=[column.name];      
    var index=angular.copy($scope.editableIndex);

    //Enable column to edit         
    $scope.showInputForEdit[index]=arry;
    $scope.showInputForEdit[index][column.name]=true;

    $scope.editableField[index]=arry2;
    $scope.holdFieldData[index]=arry3;      

    //Save Active UI Element
    $scope.activeUIelm.push(event.currentTarget);     

    //Set Field or value      
    if(column.document.dataType=="EncryptedText"){ 
      $scope.holdFieldData[index][column.name]=angular.copy(row.get(column.name));     
      $scope.editableField[index][column.name]=null;
    }

    if(column.document.dataType=="DateTime"){
      $scope.editableField[index][column.name]=angular.copy(new Date(row.get(column.name)));     
    }     

    //Present Data
    $scope.editableField[index][column.name]=angular.copy(row.get(column.name)); 
    
  }         
};

$document.on("click",function(event) {
  var clickedOnCell=$(event.target).data("identity");
  if(!clickedOnCell && !_isClickedOnSameElm(event)){
    lastDocumentClick(event);
  }  
});

function lastDocumentClick(event){
  if($scope.activeUIelm && $scope.activeUIelm.length>0){

    var firstElm=$scope.activeUIelm[0];

    var elmIdentity=$(firstElm).data("identity");
    var currentElmIdentity=$(event.target).data("identity");

    if(!currentElmIdentity || (currentElmIdentity!=elmIdentity)){
      $scope.setAndSaveFields();        
      $scope.activeUIelm.splice(0,1);        
    }

  }  
}

function _isClickedOnSameElm(event){
  if($scope.activeUIelm && $scope.activeUIelm.length>0){
    var firstElm=$scope.activeUIelm[0];
    var elmFound=firstElm.contains(event.target);
    if(elmFound){      
      return true;
    }
  }

  return false;  
}

//Invoke Common Type Input-enable
$scope.showCommonTypes=function(row,column){

  nullifyEditable();

  $scope.editableRow=row;//row  
  $scope.editableColumn=column;
  $scope.editableIndex=$scope.currentTableData.indexOf(row);//index 

  if(column.dataType=="Object"){

    var editableJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
      editableJsonObj=null;
    }    
    //$scope.cloudObjectColumn=$scope.editableColumn;      
    $scope.cloudObjectForJson =JSON.stringify(editableJsonObj,null,2);            
    $("#md-objectviewer").modal();  

  }

  if(column.dataType=="ACL"){

    var editableAclJsonObj=angular.copy(row.get(column.name));   
    if(!row.get(column.name)){
      editableAclJsonObj=null;
    }
    if(editableAclJsonObj){   
      //Sharing Data through a service         
      sharedDataService.pushAclObject(editableAclJsonObj); 
    }   
    $("#md-aclviewer").modal(); 

  }

  if(column.document.dataType=="File"){

    $scope.editableFile.push(angular.copy(row.get(column.name)));
    $("#md-fileviewer").modal();     

  }

  if(column.document.dataType=="GeoPoint"){
    $scope.cloudObjectGeopoint={};

    if(row.get(column.name)){               
      $scope.cloudObjectGeopoint.latitude=angular.copy(row.get(column.name).latitude)
      $scope.cloudObjectGeopoint.longitude=angular.copy(row.get(column.name).longitude)
    }   

    if(!row.get(column.name)){               
      $scope.cloudObjectGeopoint.latitude=null;
      $scope.cloudObjectGeopoint.longitude=null;
    }
    $("#md-geodocumentviewer").modal();

  }

  if(column.document.dataType=="List"){            
    $scope.addListItemError=null; 
    clearListErrors();   
    $scope.editableList=angular.copy(row.get(column.name));
  
    if(column.relatedTo=="DateTime"){    
      convertFieldsISO2DateObj(); 
    }

    if((!$scope.editableList || $scope.editableList.length==0) && column.relatedTo!='Text' && column.relatedTo!='Email' && column.relatedTo!='URL' && column.relatedTo!='Number' && column.relatedTo!='DateTime' && column.relatedTo!='Object' && column.relatedTo!='Boolean' && column.relatedTo!='File' && column.relatedTo!='GeoPoint'){      
      $("#mdlistcommontypes").modal();      
    }else if(($scope.editableList && $scope.editableList.length>0) && column.relatedTo!='Text' && column.relatedTo!='Email' && column.relatedTo!='URL' && column.relatedTo!='Number' && column.relatedTo!='DateTime' && column.relatedTo!='Object' && column.relatedTo!='Boolean' && column.relatedTo!='File' && column.relatedTo!='GeoPoint'){
      
      var cbIdArray=[];
      for(var j=0;j<$scope.editableList.length;++j){
        cbIdArray.push($scope.editableList[j].get("id"));
      }

      //Array CloudObjects
      cloudBoostApiService.queryContainedIn(column.document.relatedTo,'id',cbIdArray)
      .then(function(list){
        if(list && list.length>0){
          $scope.editableList=list;
          //$scope.$digest();
        }else{
          $scope.editableList=null;
          //$scope.$digest();
        }          
        $("#mdlistcommontypes").modal();
      },function(err){
        $scope.editableList=null;
        $("#mdlistcommontypes").modal();
      });      
      //Array CloudObjects
      
    }else{
      $("#mdlistcommontypes").modal();
    }

  }              
};
//End Text



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
    var requestIndex=angular.copy(i);
    saveWrapper(row,requestIndex)
    .then(function(resp){
      if($scope.tableDef){
        convertISO2DateObj($scope.tableDef,resp.obj);
      }               
      showSaveIconInSecond(resp.rowIndex);
    }, function(errorResp){                         
      rowErrorMode(errorResp.rowIndex,errorResp.error);   
    });

  }       
  
};
//End Boolean 

$scope.deleteData=function(row,column){
  if(!column.required){
    nullifyFields();
    $scope.editableRow=row;//row    
    $scope.editableColumn=column;
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index
 
    //Show INPUT Box to Edit for Commong DataTypes
    if(column.document.dataType!="Object" && column.document.dataType!="ACL" && column.document.dataType!="File" && column.document.dataType!="GeoPoint" && column.document.dataType!="List"){
      $scope.nullAccepted=true;
      var arry2=[column.name];
      var index=angular.copy($scope.editableIndex);       

      $scope.editableField[index]=arry2;
      $scope.editableField[index][column.name]=null;
      $scope.setAndSaveFields();
    }
  } 
};
 
$scope.setAndSaveJsonObject=function(modifiedJson){  
  $("#md-objectviewer").modal("hide");  
  rowEditMode($scope.editableIndex);

  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
    if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
     if(!$scope.editableRow.get(everyCol.name)){
      return everyCol;
     }          
    }
  });

  $scope.editableRow.set($scope.editableColumn.name,JSON.parse(modifiedJson));
  if(requiredField){           
    rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);
  }else{
    rowSpinnerMode($scope.editableIndex);        

    //Save Cloud Object
    var requestIndex=angular.copy($scope.editableIndex);
    saveWrapper($scope.editableRow,requestIndex)
    .then(function(resp){               
      showSaveIconInSecond(resp.rowIndex);
    }, function(errorResp){                         
      rowErrorMode(errorResp.rowIndex,errorResp.error);   
    });
  }        
};  
//End JsonObject 

$scope.setAndSaveACLObject=function(cbACLObject){
  $("#md-aclviewer").modal("hide");
  $scope.editableRow.set("ACL",cbACLObject);     
  rowEditMode($scope.editableIndex);
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
    if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
     if(!$scope.editableRow.get(everyCol.name)){
      return everyCol;
     }          
    }
  });
  
  if(requiredField){           
    rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);
  }else{
    rowSpinnerMode($scope.editableIndex);        

    //Save Cloud Object
    var requestIndex=angular.copy($scope.editableIndex);
    saveWrapper($scope.editableRow,requestIndex)
    .then(function(resp){       
      sharedDataService.spliceAclObjectByIndex(resp.rowIndex);               
      showSaveIconInSecond(resp.rowIndex,1);
    }, function(errorResp){
      sharedDataService.spliceAclObjectByIndex(errorResp.rowIndex);                          
      rowErrorMode(errorResp.rowIndex,errorResp.error);        
    });    
  }   
};  
//End ACL && JsonObject


$scope.setAndSaveFile=function(cloudBoostFile){ 
  $("#md-fileviewer").modal("hide");   
  if(cloudBoostFile) {
    rowEditMode($scope.editableIndex);  
    rowSpinnerMode($scope.editableIndex);       
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
      if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
       if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
       }          
      } 
    });

    $scope.editableRow.set($scope.editableColumn.name,cloudBoostFile);
    if(requiredField){                
      rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);
    }else{
      rowSpinnerMode($scope.editableIndex); 
        
      $scope.editableRow.set($scope.editableColumn.name,cloudBoostFile);  

      //Save Cloud Objec
      var requestIndex=angular.copy($scope.editableIndex);
      saveWrapper($scope.editableRow,requestIndex)
      .then(function(resp){ 
        //$scope.removeSelectdFile();              
        showSaveIconInSecond(resp.rowIndex);
      }, function(errorResp){  
        //$scope.removeSelectdFile();                       
        rowErrorMode(errorResp.rowIndex,errorResp.error);   
      });             
    }
                   
  }
};

/*$scope.removeSelectdFile=function(){
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
};*/

$scope.deleteFile=function(){
    $("#md-fileviewer").modal("hide");
    rowEditMode($scope.editableIndex);
       
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });

    $scope.editableRow.set($scope.editableColumn.name,null); 
    if(requiredField){      
      rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);
    }else{
      rowSpinnerMode($scope.editableIndex);

      //Save Cloud Objec
      var requestIndex=angular.copy($scope.editableIndex);
      saveWrapper($scope.editableRow,requestIndex)
      .then(function(resp){ 
        //$scope.removeSelectdFile();
        $scope.editableFile.splice(resp.rowIndex,1);             
        showSaveIconInSecond(resp.rowIndex);
      }, function(errorResp){  
        //$scope.removeSelectdFile(); 
        $scope.editableFile.splice(resp.rowIndex,1);                     
        rowErrorMode(errorResp.rowIndex,errorResp.error);   
      });     

    }
};

$scope.setAndSaveGeopoint=function(modifiedGeo){ 
  //$scope.editableGeopoint=modifiedGeo;
  if($scope.editableRow.get($scope.editableColumn.name)){//if geopoint is there

    //checking for old data!=new data
    if(($scope.editableRow.get($scope.editableColumn.name).latitude!=modifiedGeo.latitude) || ($scope.editableRow.get($scope.editableColumn.name).longitude!=modifiedGeo.longitude)){
      var loc = new CB.CloudGeoPoint(modifiedGeo.longitude,modifiedGeo.latitude);
      $scope.editableRow.set($scope.editableColumn.name,loc);
      saveGeopoint(); 

    }else{
      $("#md-geodocumentviewer").modal("hide");
      //$scope.editableGeopoint=null;
    }

  }else{//else empty
    var loc = new CB.CloudGeoPoint(modifiedGeo.longitude,modifiedGeo.latitude);
    $scope.editableRow.set($scope.editableColumn.name,loc);       
    saveGeopoint();
  }       
};

function saveGeopoint(){
  $("#md-geodocumentviewer").modal("hide");
  rowEditMode($scope.editableIndex);
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
    if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
     if(!$scope.editableRow.get(everyCol.name)){
      return everyCol;
     }          
    }
  });
  
  if(requiredField){  
        
    rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);
  }else{
    rowSpinnerMode($scope.editableIndex);

    //Save Cloud Object
    var requestIndex=angular.copy($scope.editableIndex);
    saveWrapper($scope.editableRow,requestIndex)
    .then(function(resp){ 
      //$scope.editableGeopoint=null;              
      showSaveIconInSecond(resp.rowIndex);
    }, function(errorResp){                         
      rowErrorMode(errorResp.rowIndex,errorResp.error);   
    });

  }  
}  

//End of Geo point

//RELATION
$scope.addRelation=function(row,column){  
  
  if(row.get(column.name)){
    //var tableName=row.get(column.name).document._tableName;
    var rowId=row.get(column.name).document._id; 
    $scope.linkedRelatedDoc=rowId;
    $scope.relToRel=false;
    //$("#md-reldocumentviewer").modal(); 
    $scope.viewRelationData(row,column,null);   
  }else{
    nullifyEditable();
    $scope.editableRow=row;//row
    $scope.editableColumn=column;//column  
    $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

    $scope.relColumn=_.first(_.where($rootScope.currentProject.currentTable.columns,{name:column.name}));
    $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.relColumn.relatedTo}));

    $scope.linkedRelatedDoc=null;    
    $scope.searchRelationDocs();
  } 
};


$scope.searchRelationDocs=function(){
  $("#md-reldocumentviewer").modal("hide");  

  //List Relations records 
  cloudBoostApiService.loadTableData($scope.tableDef,"createdAt","asc",20,0)
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
    if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
      if(!$scope.editableRow.get(everyCol.name)){
        return everyCol;
      }          
    }
  });

  $scope.editableRow.set($scope.editableColumn.name,relationCBRecord); 
  if(requiredField){      
    rowWarningMode(i,$scope.editableRow,$scope.editableColumn.name);
    $("#md-searchreldocument").modal("hide");
    $("#md-reldocumentviewer").modal("hide");     
  }else{
    rowSpinnerMode(i);                 
    $("#md-searchreldocument").modal("hide");
               
    //Save Cloud Object
    var requestIndex=i;
    saveWrapper($scope.editableRow,requestIndex)
    .then(function(resp){               
      showSaveIconInSecond(resp.rowIndex);
    }, function(errorResp){ 
    $("#md-searchreldocument").modal("hide");                        
      rowErrorMode(errorResp.rowIndex,errorResp.error);   
    });

  }  
          
};

$scope.viewRelationData=function(row,column,index){
    nullifyEditable();      

    if(row.get(column.name) instanceof Array){
      $("#mdlistcommontypes").modal("hide")
      var tableName=row.get(column.name)[index].document._tableName;
      var rowId=row.get(column.name)[index].document._id;
    }else{
      var tableName=row.get(column.name).document._tableName;
      var rowId=row.get(column.name).document._id;
    } 
    var tableDef=_.first(_.where($rootScope.currentProject.tables, {name: tableName})); 
    
    //get Table data
    cloudBoostApiService.queryTableById(tableDef,rowId)
    .then(function(record){       

      if(record){
        //Convert ISODate 2 DateObject
        convertISO2DateObj(tableDef,record); 
        $scope.relatedTableDefArray.push(tableDef);       
        $scope.relatedTableRecordArray.push(record);

        var response=_fieldOrder(tableDef,record);        
        $scope.fieldsOrderArray.push(response);
      }     
    
      $("#mdrelationviewer").modal();
    }, function(error){
      $scope.viewRelDataError.push(error);
      $("#mdrelationviewer").modal();  
    });
    //End of get Table data       
}; 

function _fieldOrder(table,cloudObject){
  var fields=[];
  var consumedFields={};

  //Default Fields
  var newRow=[];
  var fieldObj={};
  fieldObj.relCol=_.first(_.where(table.columns, {dataType: "Id"}));
  newRow.push(fieldObj);
  consumedFields["id"]=true;

  var fieldObj={};
  fieldObj.relCol=_.first(_.where(table.columns, {dataType: "DateTime",name:"expires"}));
  newRow.push(fieldObj);
  consumedFields["expires"]=true;

  fields.push(newRow);

  var newRow=[];
  var fieldObj={};
  fieldObj.relCol=_.first(_.where(table.columns, {dataType: "DateTime",name:"createdAt"}));
  newRow.push(fieldObj);
  consumedFields["createdAt"]=true;

 var fieldObj={};
  fieldObj.relCol=_.first(_.where(table.columns, {dataType: "DateTime",name:"updatedAt"}));
  newRow.push(fieldObj);
  consumedFields["updatedAt"]=true;

  fields.push(newRow);

  var newRow=[];
  var fieldObj={};
  fieldObj.relCol=_.first(_.where(table.columns, {dataType: "ACL"}));
  newRow.push(fieldObj);
  consumedFields["ACL"]=true;

  fields.push(newRow);
  //Default Fields


  for(var i=0;i<table.columns.length;++i){
    if(!consumedFields[table.columns[i].name]){    
      var newRow=[]; 

          
      if(table.columns[i].dataType=="Text" || table.columns[i].dataType=="File" || table.columns[i].dataType=="List" || table.columns[i].dataType=="Object"){
        var fieldObj={};
        fieldObj.relCol=table.columns[i];
        newRow.push(fieldObj);
        consumedFields[table.columns[i].name]=true;
      }

         
      if(table.columns[i].dataType=="Email" || table.columns[i].dataType=="URL" || table.columns[i].dataType=="Number" || table.columns[i].dataType=="EncryptedText"){
        var fieldObj={};
        fieldObj.relCol=table.columns[i];
        newRow.push(fieldObj);
        consumedFields[table.columns[i].name]=true;
      }    

      //MID SIZE FIELDS
      if(table.columns[i].dataType=="Boolean" || table.columns[i].dataType=="DateTime" || table.columns[i].dataType=="GeoPoint" || table.columns[i].dataType=="Relation"){
        var fieldObj={};
        fieldObj.relCol=table.columns[i];
        newRow.push(fieldObj);
        consumedFields[table.columns[i].name]=true;

        var result=_getMidSizeField(table,consumedFields);
        if(result){
          var fieldObj={};
          fieldObj.relCol=result;
          newRow.push(fieldObj);
          consumedFields[result.name]=true;
        }
      }
     
      fields.push(newRow);
    }

  }

  return fields; 

}

function _getMidSizeField(table,consumedFields){
  var midSizeFields={      
    "Text":false,
    "List":false, 
    "File":false,
    "Object":false,       
    "Email":false,
    "URL":false,
    "Number":false,
    "EncryptedText":false,
    "Id":true,
    "Boolean":true,
    "DateTime":true,
    "GeoPoint":true,
    "Relation":true,
  };

  for(var i=0;i<table.columns.length;++i){
    if(midSizeFields[table.columns[i].dataType] && !consumedFields[table.columns[i].name]){
      return table.columns[i];
    }
  }

  return null;
}

$scope.closeRelModal=function(){  
  $scope.relatedTableDefArray=[];
  $scope.relatedTableRecordArray=[];
  $scope.fieldsOrderArray=[];
  $("#mdrelationviewer").modal("hide");
};

function convertISO2DateObj(table,cloudObject){
  for(var i=0;i<table.columns.length;++i){
    if(table.columns[i].document.dataType=="DateTime"){
      var isoDate=cloudObject.get(table.columns[i].name);
      if(isoDate && table.columns[i].name=="expires"){
        cloudObject.set(table.columns[i].name,new Date(isoDate));
      }else if(table.columns[i].name!="expires"){
        cloudObject.set(table.columns[i].name,new Date(isoDate));
      }      
    }
  }
}

$scope.deleteRelLink=function(row,column){
    var i=$scope.currentTableData.indexOf(row);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
      if(everyCol.name!=column.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
        if(!$scope.editableRow.get(everyCol.name)){
          return everyCol;
        }          
      }
    });

    row.set(column.name,null);

    if(requiredField){      
      rowWarningMode(i,row,column.name);     
    }else{
      rowSpinnerMode(i);
                  
      //Save Cloud Object
      var requestIndex=i;
      saveWrapper(row,requestIndex)
      .then(function(resp){ 
        //$scope.relatedTableDefArray=[];
        //$scope.relatedTableRecordArray=[];
        //$scope.fieldsOrderArray=[];
        //$scope.linkedRelatedDoc=null;

        showSaveIconInSecond(resp.rowIndex);
      }, function(errorResp){                         
        rowErrorMode(errorResp.rowIndex,errorResp.error);   
      });

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

function convertFieldsISO2DateObj(){
  if($scope.editableList && $scope.editableList.length>0){
    for(var i=0;i<$scope.editableList.length;++i){
      $scope.editableList[i]= new Date($scope.editableList[i]);
    }    
  }      
}

$scope.deleteListItemFromTable=function(row,column,index){
  nullifyFields();
  $scope.editableRow=row;//row
  $scope.editableColumn=column;
  $scope.editableIndex=$scope.currentTableData.indexOf(row);//index

  $scope.editableList=angular.copy(row.get(column.name));
  $scope.editableList.splice(index,1);   
  $scope.setAndSaveList($scope.editableList);
};

$scope.setAndSaveList=function(updatedList){  
  
  $("#mdlistcommontypes").modal("hide");
  $scope.editableList=updatedList;
  rowEditMode($scope.editableIndex);  
 
  var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
    if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
     if(!$scope.editableRow.get(everyCol.name)){
      return everyCol;
     }          
    }
  });  
  
  //Splicing off empty or null fields from list
  if($scope.editableList && $scope.editableList.length>0){
    var emptyFieldIndx=[];
    for(var i=0;i<$scope.editableList.length;++i){
      if(!$scope.editableList[i]){
        emptyFieldIndx.push(i);
      }
    }
    if(emptyFieldIndx && emptyFieldIndx.length>0){
      for(var i=emptyFieldIndx.length-1;i>=0;--i){
       $scope.editableList.splice(emptyFieldIndx[i],1);
      }
    }
  }
  
  //Set and Save if List has some fields
  //if($scope.editableList && $scope.editableList.length>0){ 

    $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);

    if(requiredField){      
      rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);     
    }else{
      rowSpinnerMode($scope.editableIndex);

      //Save Cloud Object
      var requestIndex=angular.copy($scope.editableIndex);
      saveWrapper($scope.editableRow,requestIndex)
      .then(function(resp){ 
        $scope.editableRow=resp.obj;  
        $scope.editableList=[];            
        showSaveIconInSecond(resp.rowIndex);
      }, function(errorResp){                         
        rowErrorMode(errorResp.rowIndex,errorResp.error);   
      });

    }

  //}else{
    //rowInitMode($scope.editableIndex);
  //} 
 
};

//Clear List All Errors
function clearListErrors(){
  if($scope.modifyListItemError && $scope.modifyListItemError.length>0){
    for(var i=0;i<$scope.modifyListItemError.length;++i){
      $scope.modifyListItemError[i]=null;      
    }
  }
}

$scope.closeListModal=function(){
  nullifyEditable();
};

function nullifyFields(){
  //Disable column to edit
  if(typeof $scope.editableIndex=="number" && $scope.editableColumn && $scope.editableColumn.name){ 

    if($scope.showInputForEdit[$scope.editableIndex] && $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumn.name]){
      $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumn.name]=false;
    } 

    if($scope.editableField.length>0){
      if($scope.editableField[$scope.editableIndex] && $scope.editableField[$scope.editableIndex].length>0){
        $scope.editableField[$scope.editableIndex][$scope.editableColumn.name]=null;//field or value
      }       
    }    
  }
           
  nullifyEditable(); 
}

function nullifyEditable(){             
  $scope.editableRow=null;//row 
  $scope.editableColumn=null;
  $scope.editableList=[];
  $scope.editableIndex=null;//index 
  $scope.nullAccepted=false;  
}

//Save Fields 
$scope.setAndSaveFields=function(){
  //hold the data
  var data=$scope.editableField[$scope.editableIndex][$scope.editableColumn.name];
  var holdData=$scope.holdFieldData[$scope.editableIndex][$scope.editableColumn.name];

  if(!$scope.nullAccepted && $scope.editableColumn.document.dataType=="EncryptedText" && (!data || data==null)){
    $scope.editableField[$scope.editableIndex][$scope.editableColumn.name]=holdData;
    $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumn.name]=false;
  }else{ 

    /************************************Validations*************************/
    var validFields=true;
    var message=null;
    if($scope.editableColumn.dataType=="Email"){
      var email=$scope.editableField[$scope.editableIndex][$scope.editableColumn.name];
      if(email && !validateEmail(email)){
        validFields=false;
        message="Column "+$scope.editableColumn.name+" is of email type.";
      }
    }

    if($scope.editableColumn.dataType=="URL"){
      var url=$scope.editableField[$scope.editableIndex][$scope.editableColumn.name];
      if(url && !validateURL(url)){
        validFields=false;
        message="Column "+$scope.editableColumn.name+" is of url type.";
      }
    }

    if($scope.editableColumn.dataType=="Number"){
      var data=$scope.editableField[$scope.editableIndex][$scope.editableColumn.name];
      var tempData=angular.copy(data);
      if(data){
        data=Number(data);        
        if(data.toString()!=tempData){
          validFields=false;
          message="Column "+$scope.editableColumn.name+" is of number type.";
        }
      }      
    }
    /**********************************Validations*****************************/

    if(validFields){
      rowInitMode($scope.editableIndex);
      //Start Process of savinng..
      processSaving();
      return true;
    }else{
      throughRowWarning($scope.editableIndex,message);
      return false;
    }
    
  }      
  
};

function processSaving(){
  //Check if previous value is not equal to modified value
  $scope.showInputForEdit[$scope.editableIndex][$scope.editableColumn.name]=false;
  if($scope.editableRow.get($scope.editableColumn.name)!=$scope.editableField[$scope.editableIndex][$scope.editableColumn.name]){
      rowEditMode($scope.editableIndex);       

      var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
        if(everyCol.name!=$scope.editableColumn.name && everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
          if(!$scope.editableRow.get(everyCol.name)){
            return everyCol;
          }          
        }
      });

      /*******Conversations****/
      //Number
      if($scope.editableColumn.dataType=="Number"){
        var tempValue=angular.copy($scope.editableField[$scope.editableIndex][$scope.editableColumn.name]);
        $scope.editableField[$scope.editableIndex][$scope.editableColumn.name]=Number($scope.editableField[$scope.editableIndex][$scope.editableColumn.name]);
        if(isNaN($scope.editableField[$scope.editableIndex][$scope.editableColumn.name])){
          $scope.editableField[$scope.editableIndex][$scope.editableColumn.name]=tempValue;
        }
      }

      //Check for null DateTime
      if($scope.editableColumn.dataType=="DateTime"){
        if($scope.editableField[$scope.editableIndex][$scope.editableColumn.name].getTime()==new Date(null).getTime()){
          $scope.editableField[$scope.editableIndex][$scope.editableColumn.name]=null;
        }
      }
      /*******Conversations****/

      $scope.editableRow.set($scope.editableColumn.name,$scope.editableField[$scope.editableIndex][$scope.editableColumn.name]);
      if(requiredField){      
        rowWarningMode($scope.editableIndex,$scope.editableRow,$scope.editableColumn.name);          
      }else{
        rowSpinnerMode($scope.editableIndex);          
      
        var requestIndex=angular.copy($scope.editableIndex);
        saveWrapper($scope.editableRow,requestIndex)
        .then(function(resp){               
          showSaveIconInSecond(resp.rowIndex);
        }, function(errorResp){                         
          rowErrorMode(errorResp.rowIndex,errorResp.error);   
        });       
      }
  }
}
//End of Save  


function saveWrapper(row,rowIndex){
  var q=$q.defer();

  //Save Cloud Object
  cloudBoostApiService.saveCloudObject(row)
  .then(function(obj){ 
    var respObj={
      obj:obj,
      rowIndex:rowIndex
    };              
    q.resolve(respObj);

    if($scope.currentTableData && $scope.currentTableData.length>0){
      $scope.totalRecords=$scope.currentTableData.length;
    }else{
      $scope.totalRecords=0;
    }
    $scope.updateCountItems();

  }, function(error){ 
    var respObj={
      error:error,
      rowIndex:rowIndex
    };                         
    q.reject(respObj);   
  });

  return  q.promise; 
}

/* PRIVATE FUNCTIONS */

function loadProject(id){

  if($rootScope.currentProject){
    initCbApp();
    getProjectTables();
  }else{
    projectService.getProject(id)
    .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCbApp();
          getProjectTables();  
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                                       
        }                                           
    },
    function(error){ 
      errorNotify('We cannot load your project at this point in time. Please try again later.');        
    });
  }
  
}

function getProjectTables(){
  var promises=[];  

  if(!$rootScope.currentProject.tables || $rootScope.currentProject.tables.length==0){
    //Get All project tables
    promises.push(tableService.getProjectTables($rootScope.currentProject));     
  }else{
    $rootScope.currentProject.currentTable= _.first(_.where($rootScope.currentProject.tables, {name: tableName}));   
  }  

  $q.all(promises).then(function(list){ 

    if(list.length==1){      
      $rootScope.currentProject.tables=list[0];
      $rootScope.currentProject.currentTable= _.first(_.where($rootScope.currentProject.tables, {name: tableName}));      
    }

    var templColumn=angular.copy($rootScope.currentProject.currentTable.columns);
    for(var i=0;i<$rootScope.currentProject.currentTable.columns.length;++i){
      $scope.hideColumn[i]=true;
    }    
    //For Filters
    var column=_.first(_.where(templColumn, {name: "createdAt",dataType:"DateTime"}));
    var defaultFilterColumn={
      contriant:"And",
      colName:column.name, 
      colDataType:column.dataType,
      colRelatedTo:column.relatedTo,
      filter:null,
      value:null,
      longitude:null,
      latitude:null,
      arrayValue:[],
      note:null,
      error:null
    };
    $scope.filtersList.push(defaultFilterColumn);

    $scope.updateCountItems();
    return cloudBoostApiService.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,$scope.docsLimit,0);

  }).then(function(cbObjects){ 
    $scope.currentTableData=cbObjects;

    if($scope.currentTableData && $scope.currentTableData.length>0){
      $scope.totalRecords=$scope.currentTableData.length;
    }else{
      $scope.totalRecords=0;
    }
    
    $scope.isTableLoaded=true; 

    for(var i=0;i<$scope.currentTableData.length;++i){
      $scope.showSerialNo[i]=true;
      $scope.holdSerialNoInfo[i]=true;
    }
  }, function(err){  
    $scope.isTableLoaded=true; 
    $scope.tableLoadedError="Error in loading table records";
  });

} 

$scope.refreshRows=function(){
  $scope.refreshingRows=true;  

  cloudBoostApiService.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,$scope.docsLimit,0)
  .then(function(cbObjects){
    $scope.currentTableData=cbObjects;

    if($scope.currentTableData && $scope.currentTableData.length>0){
      $scope.totalRecords=$scope.currentTableData.length;
    }else{
      $scope.totalRecords=0;
    }
    
    $scope.updateCountItems();
    $scope.refreshingRows=false;   

    $scope.rowInfo=null;
    for(var i=0;i<$scope.currentTableData.length;++i){
      $scope.showSerialNo[i]=true;
      $scope.holdSerialNoInfo[i]=true;
      
      $scope.rowEditMode[i]=false;
      $scope.rowWarningMode[i]=false;
      $scope.rowErrorMode[i]=false;
      $scope.rowSpinnerMode[i]=false; 
      $scope.rowSavedMode[i]=false;
    }

  },function(err){
    $scope.refreshingRows=false;       
  });  
};

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
  CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId,$rootScope.currentProject.keys.master);    
}

$scope.addMoreRecords=function(){  

  if($scope.currentTableData && $rootScope.currentProject && $rootScope.currentProject.currentTable){
    $scope.loadingRecords=true;

    //load more data
    cloudBoostApiService.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,5,$scope.totalRecords)
    .then(function(list){

      //Initial Length
      var initialLenth=$scope.currentTableData.length;

      if(list && list.length>0){
        if($scope.currentTableData.length>0){
          $scope.currentTableData=$scope.currentTableData.concat(list); 
        }else{
          $scope.currentTableData=list;
        }
        $scope.totalRecords=$scope.totalRecords+list.length;
      }
      $scope.updateCountItems(); 
      $scope.loadingRecords=false; 

      //Final Length
      var finalLength=$scope.currentTableData.length;

      for(var i=initialLenth;i<finalLength;++i){
        $scope.showSerialNo[i]=true;
        $scope.holdSerialNoInfo[i]=true;
        
        $scope.rowEditMode[i]=false;
        $scope.rowWarningMode[i]=false;
        $scope.rowErrorMode[i]=false;
        $scope.rowSpinnerMode[i]=false; 
        $scope.rowSavedMode[i]=false;
      }      
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
  $("#md-searchreldocument").modal("hide"); 
  $("#md-searchlistdocument").modal("hide");     
  window.location.href="#/"+id+"/table/"+t.name;
};

$scope.filterDataType=function(dataTypeObj){
  if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation" && dataTypeObj.name!="EncryptedText"){
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
      id                  : uniqueId,
      name                : newColName,
      dataType            : 'Text',
      relatedTo           : null,
      relationType        : null,
      required            : false,
      unique              : false,
      isRenamable         : true,
      isEditable          : true,
      isDeletable         : true,
      editableByMasterKey : false,
      isSearchable        : true
  }; 

  $scope.newColumnObj=newcol; 
  $scope.showAddColPopUp=true;   
  //$("#scrollbar-wrapper").mCustomScrollbar("scrollTo",['top','right']); 
  $('#scrollbar-wrapper').scrollTo('#extra-col-th',400,{axis:'x',duration:5000});   
  
};
//infinite-scroll="addMoreRecords()"
$scope.addColumn = function(valid) {
  if(valid){
    $scope.showAddColPopUp=false; 
    $scope.enableColAdvance=false;
    nullifyCommonErrorInfo();
    $scope.commonSpinner=true;

    var column = new CB.Column($scope.newColumnObj.name, $scope.newColumnObj.dataType, $scope.newColumnObj.required, $scope.newColumnObj.unique);
    if($scope.newColumnObj.relatedTo){
      column.relatedTo=$scope.newColumnObj.relatedTo;
    }
    if($scope.newColumnObj.editableByMasterKey){
      column.editableByMasterKey=$scope.newColumnObj.editableByMasterKey;
    }
    if($scope.newColumnObj.dataType=="Text"){
      column.isSearchable=$scope.newColumnObj.isSearchable;
    }
    
    $rootScope.currentProject.currentTable.addColumn(column);
    var index=$rootScope.currentProject.currentTable.columns.indexOf(column);
    //Column visible
    $scope.hideColumn[index]=true;

    /*$rootScope.currentProject.currentTable.columns.push($scope.newColumnObj);
    $("#scrollbar-wrapper").mCustomScrollbar("update");
    $(".data-table-design").css("height","75.90vh");
    $timeout(function(){ 
      $(".data-table-design").css("height","76vh");
      $("#scrollbar-wrapper").mCustomScrollbar("scrollTo",['top','right']); 
    }, 2000);*/

    $('#scrollbar-wrapper').scrollTo('#extra-col-th',400,{axis:'x',duration:9000}); 

    tableService.saveTable($rootScope.currentProject.currentTable)
    .then(function(table){  
      $rootScope.currentProject.currentTable=table; 
      $('#scrollbar-wrapper').scrollTo('#extra-col-th',400,{axis:'x',duration:9000});       
      
      $scope.commonSpinner=false; 
      $scope.commonSaved=true;
      $timeout(function(){ 
        $scope.commonSaved=false;
      }, 800); 

      if(!__isDevelopment){
        /****Tracking*********/            
         mixpanel.track('Create Column', { "Table Name":$rootScope.currentProject.currentTable.name,"Column name": $scope.newColumnObj.name,"appId": $rootScope.currentProject.appId,
          "DateType":$scope.newColumnObj.dataType});
        /****End of Tracking*****/
      }

      $scope.newColumnObj=null;                                               
    },
    function(error){      
      $scope.commonSpinner=false;
      $scope.commonError="Unable to add the column right now";      
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

$scope.toggleColAdvance=function(){
  if($scope.enableColAdvance){
    $scope.enableColAdvance=false;
  }else{
    $scope.enableColAdvance=true;
  }
};

$scope.toggleColOptions=function(index){
  if((!$scope.showColOptions[index]) || ($scope.showColOptions[index]==false)){
    $scope.showColOptions[index]=true;
  }else if($scope.showColOptions[index]==true){
    $scope.showColOptions[index]=false;
  }    
};

$scope.confirmDeleteColumn=function(column){
  if(column.document.isDeletable){    
    var tempTable=angular.copy($scope.currentProject.currentTable);  
    for(var i=0;i<tempTable.columns.length;++i){
      if(tempTable.columns[i].name==column.name){
        $scope.requestDelIndex=i;
        break;
      }
    }    
    $scope.showColOptions[$scope.requestDelIndex]=false;

    $scope.requestedColumn=column;
    $scope.confirmDeleteColumnName=null;
    $scope.columnDeleteModalSpinner=false;    
    $("#md-deleteColumn").modal();     
  }
};

$scope.deleteColumn=function(){
  if($scope.requestedColumn.name==$scope.confirmDeleteColumnName){
    //Hold
    var tempTable=angular.copy($scope.currentProject.currentTable); 

    //Delete
    var column = new CB.Column($scope.requestedColumn.name, $scope.requestedColumn.dataType);
    $scope.currentProject.currentTable.deleteColumn(column);  

    $scope.columnDeleteModalSpinner=true;  

    tableService.saveTable($scope.currentProject.currentTable)
    .then(function(table){     
      //Sanitize hide column
      $scope.hideColumn.splice($scope.requestDelIndex,1);   
      $scope.confirmDeleteColumnName=null;
      $scope.columnDeleteModalSpinner=false;
      $scope.requestedColumn=null;
      $scope.requestDelIndex=null; 
      $("#md-deleteColumn").modal("hide"); 

    },function(error){
      
      $scope.confirmDeleteColumnName=null;
      $scope.columnDeleteModalSpinner=false;
      $scope.columnDeleteModalError="Unable to delete the column right now";     
      //ReAssign
      $rootScope.currentProject.currentTable=tempTable;
    });    
  }else{     
    $scope.confirmDeleteColumnName=null;
    $scope.columnDeleteModalSpinner=false;    
    $scope.columnDeleteModalError="Column name doesn\'t match";    
  }
};

$scope.clearDeleteColumnData=function(){
  $scope.confirmDeleteColumnName=null;
  $scope.columnDeleteModalSpinner=false;
  $scope.requestedColumn=null;
  $scope.requestDelIndex=null; 
  $("#md-deleteColumn").modal("hide");
};


//Row delete specific functions start
$scope.selectAllRows=function(){
 
  if($scope.areSelectAllRows==false){

    for(var i=0;i<$scope.currentTableData.length;++i){
      $scope.rowsSelected[i]=true;
      $scope.showSerialNo[i]=false;
      $scope.holdSerialNoInfo[i]=false;
    }
    $scope.selectedRowsCount=$scope.currentTableData.length;

  }else if($scope.areSelectAllRows==true){
    for(var i=0;i<$scope.currentTableData.length;++i){
      $scope.rowsSelected[i]=false;
      $scope.showSerialNo[i]=true;
      $scope.holdSerialNoInfo[i]=true;
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
  nullifyCommonErrorInfo();
  $scope.commonSpinner=true;

  var promises=[];
  for(var i=0;i<$scope.rowsSelected.length;++i){
    if($scope.rowsSelected[i]==true){        
      promises.push(cloudBoostApiService.deleteCloudObject($scope.currentTableData[i]));
    }
  }

  $q.all(promises).then(function(list){ 
    
    for(var i=0;i<list.length;++i){
     var ndex=$scope.currentTableData.indexOf(list[i]);
     $scope.currentTableData.splice(ndex,1);
     $scope.rowsSelected.splice(ndex,1);
     $scope.showSerialNo.splice(ndex,1); 
     $scope.holdSerialNoInfo.splice(ndex,1);  
     --$scope.selectedRowsCount;
    } 
    $scope.areSelectAllRows=false; 
    $scope.commonSpinner=false; 
    $scope.commonSaved=true;
    $timeout(function(){ 
      $scope.commonSaved=false; 
    }, 800);

    //Update Total
    if($scope.currentTableData && $scope.currentTableData.length>0){
      $scope.totalRecords=$scope.currentTableData.length;
    }else{
      $scope.totalRecords=0;
    } 

    $scope.updateCountItems();

  }, function(err){    
    $scope.areSelectAllRows=false;
    $scope.commonSpinner=false;
    $scope.commonError="Unable to add the column right now";
    //Update Total
    if($scope.currentTableData && $scope.currentTableData.length>0){
      $scope.totalRecords=$scope.currentTableData.length;
    }else{
      $scope.totalRecords=0;
    } 
  });
 
};

function deleteUnsavedRows(){  
  for(var i=0;i<$scope.rowsSelected.length;++i){

    if(($scope.rowsSelected[i]==true) && (!$scope.currentTableData[i].get("id"))){
      $scope.currentTableData.splice(i,1); 
      $scope.rowsSelected.splice(i,1); 
      $scope.showSerialNo.splice(i,1);
      $scope.holdSerialNoInfo.splice(i,1);  
      --$scope.selectedRowsCount;      
    }

  }      
}

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

  //Temporary
  $scope.newlyAddedRow=obj;

  var index=$scope.currentTableData.indexOf(obj);
  $scope.showSerialNo[index]=true;
  $scope.holdSerialNoInfo[index]=true;

  //Update Beacon
  if($scope.beacon && !$scope.beacon.firstRow){
    $scope.beacon.firstRow=true;
    updateBeacon();   
  }                                         
};

$scope.saveNewlyCreatedRow=function(){
  if($scope.newlyAddedRow){
    var i=$scope.currentTableData.indexOf($scope.newlyAddedRow);   
    rowEditMode(i);
   
    var requiredField = _.find($scope.currentProject.currentTable.columns, function(everyCol){
       if(everyCol.name!="id" && everyCol.name!="createdAt" && everyCol.name!="updatedAt" && everyCol.name!="ACL" && everyCol.required){
         if(!$scope.newlyAddedRow.get(everyCol.name)){
          return everyCol;
         }          
       }
    });    

    if(requiredField){      
      rowWarningMode(i,$scope.newlyAddedRow,null);     
    }else{
      rowSpinnerMode(i);     

      //Save Cloud Object
      var requestIndex=i;
      saveWrapper($scope.newlyAddedRow,requestIndex)
      .then(function(resp){ 

        if($scope.tableDef){
          convertISO2DateObj($scope.tableDef,resp.obj);
        }       
        $scope.newlyAddedRow=null;//Nullify

        //Update Total
        if($scope.currentTableData && $scope.currentTableData.length>0){
          $scope.totalRecords=$scope.currentTableData.length;
        }else{
          $scope.totalRecords=0;
        }
        $scope.updateCountItems();

        showSaveIconInSecond(resp.rowIndex);
      }, function(errorResp){                         
        rowErrorMode(errorResp.rowIndex,errorResp.error);   
      });

    }
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

    cloudBoostApiService.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,$scope.docsLimit,0)
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
    cloudBoostApiService.loadTableData($rootScope.currentProject.currentTable,$scope.orderBy,$scope.orderByType,$scope.docsLimit,0)
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
/****Hide Columns******/
$scope.hideThisColumn=function(column){
  var i = $scope.currentProject.currentTable.columns.indexOf(column);
  $scope.showColOptions[i]=false;
  $scope.hideColumn[i]=false;
  ++$scope.hiddenColumnCount;
};

$scope.toggleHideColumn=function(index){
  var status=$scope.hideColumn[index];

  if(!status){
    $scope.hideColumn[index]=false;
    --$scope.hiddenColumnCount;
  }else if(status==true){
    $scope.hideColumn[index]=true; 
    ++$scope.hiddenColumnCount;    
  }  

};

$scope.showallHiddenCols=function(){
  for(var i=0; i<$scope.currentProject.currentTable.columns.length;++i){
    if($scope.currentProject.currentTable.columns[i].dataType!="Id"){
      if($scope.hideColumn[i]!=true){
          $scope.hideColumn[i]=true; 
          --$scope.hiddenColumnCount;
      }      
    }           
  }
};

$scope.hideallHiddenCols=function(){
  for(var i=0; i<$scope.currentProject.currentTable.columns.length;++i){
    if($scope.currentProject.currentTable.columns[i].dataType!="Id"){
      if($scope.hideColumn[i]!=false){
          $scope.hideColumn[i]=false; 
          ++$scope.hiddenColumnCount;
      }        
    }           
  }
};
/****End Hide Columns******/
$scope.toggleHiddenColShow=function(){
  if($scope.showHiddenColList==true){
    $scope.showHiddenColList=false;
  }else if($scope.showHiddenColList==false){
    $scope.showHiddenColList=true;
  }
  
};

$scope.toggleFilterShow=function(){
  if($scope.showFilterList==true){
    $scope.showFilterList=false;
  }else if($scope.showFilterList==false){
    $scope.showFilterList=true;
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
  if(column.document.isEditable){
    var i = $scope.currentProject.currentTable.columns.indexOf(column);      
    nullifyCommonErrorInfo();
    $scope.commonSpinner=true;

    tableService.saveTable($scope.currentProject.currentTable)
    .then(function(table){ 
      $scope.editColumn[i]=false;      
      $scope.showColOptions[i]=false; 
      $scope.commonSpinner=false; 
      $scope.commonSaved=true;
      $timeout(function(){ 
        $scope.commonSaved=false;        
      }, 800);                             
    },function(error){
      $scope.commonSpinner=false;
      $scope.commonError="Unable to add the column right now";      
    });      
  }
};

$scope.getType = function(x) {
  return typeof x;
};

$scope.isDate = function(x) {
  return x instanceof Date;
};

$scope.updateCountItems=function(){
  cloudBoostApiService.queryCountByTableName($rootScope.currentProject.currentTable.name).then(function(number){
    $scope.countItemsInTable=number;
  },function(error){
  });
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
  var countColumns=0;
  for(var i=0;i<$scope.currentProject.currentTable.columns.length;++i){
    var col=$scope.currentProject.currentTable.columns[i]; 

    var onColumn=true;
    if(columnName && col.name==columnName){
      onColumn=false;
    }

    if(onColumn && col.name!="id" && col.name!="createdAt" && col.name!="updatedAt" && col.name!="ACL" && col.required){
        if(!row.get(col.name)){

          if(countColumns==0){
             colNames=col.name;
          }else if(countColumns>0){
            colNames=colNames.concat(","+col.name);
          }           
          ++countColumns;
        }          
    }
  }

  if(countColumns==1){
    $scope.rowInfo="This row is not saved because "+colNames+" is required.";
    $scope.$digest();
  }else if(countColumns>1){
    $scope.rowInfo="This row is not saved because "+colNames+" are required.";
    $scope.$digest();
  }
  

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
}

function rowSpinnerMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=true; 
  $scope.rowSavedMode[index]=false; 
}

function rowSavedMode(index){
  $scope.rowInfo=null;
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=false;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=true;  

  //Update SerialNo Info  
  $scope.showSerialNo=angular.copy($scope.holdSerialNoInfo); 
}

function throughRowWarning(index,mesage){  
  $scope.rowInfo=mesage;  
  $scope.rowEditMode[index]=false;
  $scope.rowWarningMode[index]=true;
  $scope.rowErrorMode[index]=false;
  $scope.rowSpinnerMode[index]=false; 
  $scope.rowSavedMode[index]=false;
}

$scope.flipToCheckBox=function(index){
  //Gather Info whatever(Order is important, this should be first)
  if($scope.showSerialNo[index]){
    $scope.holdSerialNoInfo[index]=false;
  }

  if($scope.showSerialNo[index]){
    $scope.showSerialNo[index]=false;
  }    
};

$scope.flipToSerialNo=function(index){
  //Gather Info whatever(Order is important, this should be first)
  if(!$scope.showSerialNo[index]){
    $scope.holdSerialNoInfo[index]=true;
  }

  if(!$scope.showSerialNo[index] && !$scope.rowsSelected[index]){
    $scope.showSerialNo[index]=true;
  }    
};

function nullifyCommonErrorInfo(){
  $scope.commonSpinner=false;
  $scope.commonSaved=false;
  $scope.commonError=null;
  $scope.commonWarning=null;  
}

function showSaveIconInSecond(index){  
  rowSavedMode(index);
  $timeout(function(){ 
    rowInitMode(index);
  }, 1000);
}

/*------/Partial & Table Definition Functions---------------*/ 

//Toggling popups
$scope.closeTableMenu=function(){
  if($scope.showTableList){
    $scope.showTableList=false;
  }  
};

$scope.closeHideColBox=function(){
  if($scope.showHiddenColList==true){
    $scope.showHiddenColList=false;
  }
};

$scope.closeColConfig=function(index){
  $scope.showColOptions[index]=false;
};
$scope.closeAddCol=function(){
  $scope.showAddColPopUp=false;
};

$scope.closeFilterBox=function(){
  if($scope.showFilterList==true){
    $scope.showFilterList=false;
  }
};
$scope.addFilter=function(){
  var newFilterColumn={
    contriant:"And",
    colName:null, 
    colDataType:null,
    colRelatedTo:null,
    filter:null,
    value:null,
    longitude:null,
    latitude:null,
    arrayValue:[],
    note:null,
    error:null,
  };

  if($scope.filtersList.length<13){
    $scope.filtersList.push(newFilterColumn); 
  }   
};

$scope.removeFilter=function(index){  
  $scope.filtersList.splice(index,1); 
  processFilterQuery(index);    
};

$scope.changeFilterColumn=function(eachFilter,index){
  var templColumn=angular.copy($rootScope.currentProject.currentTable.columns);
  var column=_.first(_.where(templColumn, {name: eachFilter.colName}));

  $scope.filtersList[index].colDataType=column.dataType;
  $scope.filtersList[index].colRelatedTo=column.relatedTo;
  eachFilter.value=null;
  eachFilter.arrayValue=[];
  eachFilter.longitude=null;
  eachFilter.latitude=null;
  eachFilter.filter=null;
  eachFilter.note=null;
  eachFilter.error=null;
  $scope.filterNotify=null;
};

$scope.changeFilterFilterType=function(eachFilter,index){  
  eachFilter.value=null;
  eachFilter.arrayValue=[];
  eachFilter.longitude=null;
  eachFilter.latitude=null;
  eachFilter.error=null;
  if(eachFilter.filter=="geoWithin"){
    $scope.filterNotify="Note: For GeoWithin, It is needed to add atleast 3 gepoints with different value sets"
  }else{
    $scope.filterNotify=null;
  }

  if(eachFilter.filter=="exists" || eachFilter.filter=="doesNotExists"){
    $scope.popUpFilterTypes(eachFilter,index);
  }
};

$scope.popUpFilterTypes=function(eachFilter,index){  
  //Nullify CloudSearch Value 
  $scope.cloudSearchText=null;

  //List&Number
  if(eachFilter.colDataType=="List" && eachFilter.colRelatedTo=="Number"){
    for(var i=0;i<eachFilter.arrayValue.length;++i){
      if(typeof eachFilter.arrayValue[i]=="String"){
        eachFilter.arrayValue[i]=parseInt(eachFilter.arrayValue[i]);
      }
    }
  }  

  if(((eachFilter.value || eachFilter.arrayValue.length>0 || eachFilter.colDataType=="Boolean")  && eachFilter.filter && eachFilter.colName)|| eachFilter.filter=="exists"|| eachFilter.filter=="doesNotExists"){
   
   if(eachFilter.colDataType=="GeoPoint" && eachFilter.filter=="geoWithin" && eachFilter.arrayValue.length>2){
    processFilterQuery(index);
   }else if(eachFilter.filter=="near" && eachFilter.value && eachFilter.longitude  && eachFilter.latitude){  
    processFilterQuery(index);  
   }else if(eachFilter.filter!="geoWithin" && eachFilter.filter!="near"){  
    processFilterQuery(index);  
   }   

  }  

};

function processFilterQuery(index){
  $scope.filterSpinner[index]=true;
  $scope.filterNotify=null;
  cloudBoostApiService.filterQuery($rootScope.currentProject.currentTable,$scope.filtersList)
  .then(function(cbObjects){   
    $scope.currentTableData=cbObjects; 
    $scope.filterSpinner[index]=false;                                          
  },
  function(error){ 
    $scope.filterSpinner[index]=false;
    $scope.filterNotify="Something went wrong,please check your filters";          
  });
}

//End Toggling popups
$scope.addNewFilterListValue=function(eachFilter,index){
  if(eachFilter.value || (eachFilter.longitude && eachFilter.latitude)){
    if(eachFilter.colRelatedTo=="DateTime"){
      eachFilter.value=new Date(eachFilter.value);
    }
    if(eachFilter.colDataType=="GeoPoint" && eachFilter.filter=="geoWithin"){
      var geoPoint={
        longitude:eachFilter.longitude,
        latitude:eachFilter.latitude
      };

      eachFilter.value=geoPoint;
    }

    $scope.filtersList[index].arrayValue.push(eachFilter.value);
    eachFilter.value=null;
    eachFilter.longitude=null;
    eachFilter.latitude=null;

    $scope.filterListOfList[index]=true;
    $scope.popUpFilterTypes(eachFilter,index);
  }

  if((!eachFilter.value || !eachFilter.longitude || !eachFilter.latitude) && eachFilter.arrayValue.length>0){
    $scope.filterListOfList[index]=true;
  }
};

$scope.filtersListOfListUpdate=function(eachFilter,parentIndex,item,childIndex){  
  $scope.filtersList[parentIndex].arrayValue[childIndex]=item;
  $scope.popUpFilterTypes(eachFilter,parentIndex);
};

$scope.removeFilterListValue=function(parentIndex,childIndex){
  $scope.filtersList[parentIndex].arrayValue.splice(childIndex,1);
  if($scope.filtersList[parentIndex].arrayValue.length==0){
    $scope.filterListOfList[parentIndex]=false;
  }
};

$scope.closeFilterListOfListBox=function(index){
  if($scope.filterListOfList[index]==true){
    $scope.filterListOfList[index]=false;
  }
};

//Search Related
$scope.openSearchBox=function(){
  $scope.isSearchBoxOpen=true;
};

$scope.closeSearchBox=function(){
  if($scope.isSearchBoxOpen==true && !$scope.cloudSearchText){
    $scope.isSearchBoxOpen=false;
  }
};

$scope.updatedCloudSearch=function(){      
    
  $scope.cloudSearchSpinner=true;
  //Search
  cloudBoostApiService.search($rootScope.currentProject.currentTable,$scope.cloudSearchText)
  .then(function(cbObjects){   
    $scope.currentTableData=cbObjects;
    $scope.cloudSearchSpinner=false;                                              
  },
  function(error){ 
    $scope.cloudSearchSpinner=false;               
  });
  //Search  
};

$scope.goToDocumentation=function(){
  //Update Beacon
  if($scope.beacon && !$scope.beacon.documentationLink){
    $scope.beacon.documentationLink=true;
    updateBeacon();   
  }

  //Redirect to documentation  
  window.open("https://docs.cloudboost.io", "_blank");
};

function closeAllModals(){
  $("#md-aclviewer").modal("hide");
  $("#md-objectviewer").modal("hide");
  $("#md-fileviewer").modal("hide");
  $("#md-geodocumentviewer").modal("hide");
  $("#md-searchreldocument").modal("hide");
  $("#md-mdlistcommontypes").modal("hide");
  $("#md-mdrelationviewer").modal("hide");
  $("#md-reldocumentviewer").modal("hide");
  $("#md-deleteColumn").modal("hide");
}

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


});
