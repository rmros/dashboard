
app.directive('cbDatabrowser', function(){
    return {
        restrict: 'E',
        transclude: true,       
        scope: {
          'relatedTableDefArray': '=definition',
          'relatedTableRecordArray': '=record',
          'fieldsOrderArray': '=fields', 
          'closeRelModal': '&close'          
        },   
        templateUrl: 'app/directives/templates/dataBrowserTemplate.html',       
        controller:['$scope','$rootScope','$timeout','cloudBoostApiService','sharedDataService',
        function($scope,$rootScope,$timeout,cloudBoostApiService,sharedDataService) { 

            //Defaults
            $scope.relationError=[];
            $scope.relationHoldData=[];
            $scope.relationShowInput=[];

            $scope.relationSpinnerMode=false;
            $scope.relationErrorMode=null;
            $scope.relationSaveTickMode=false;

            $scope.setRelFileError=[]; 
            $scope.setRelFileSpinner=[];
            $scope.setRelFileProgress=[];
            $scope.viewRelDataError=[];
            $scope.relFileProgress=null;
            $scope.listFileSpinner=[];
            $scope.listFileProgress=[];
            $scope.listFileError=[]; 

            $scope.editableRow=null;
            $scope.editableColumn=null;
            $scope.relEditableRow=null;
            $scope.relEditableColumn=null; 
            $scope.modifyListItemError=[]; 
            $scope.relationTableData=[];           

            //clearRelationErrors();
            //Flush Acl data in sharedDataService
            sharedDataService.flushAclArray();

            //View Data Browser 
            $scope.viewRelationData=function(row,column,index){
                nullifyEditable();                  

                if(row.get(column.name) instanceof Array){                  
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

                    //Nullify errors
                    clearRelationErrors();        
                  }     
                
                  $("#md-relationviewer").modal();

                }, function(error){
                  $scope.viewRelDataError.push(error);
                  $("#md-relationviewer").modal();  
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

            //Relation List
            $scope.showRelationList=function(cloudObject,column,functionality,data,index){
              nullifyEditable();
              $scope.editableRow=cloudObject;//row
              $scope.editableColumn=column;//column  

              $scope.editableList=cloudObject.get(column.name); 

              $scope.newListItem=null;
              $scope.addListItemError=null;
              clearListErrors();  
                
              if(column.relatedTo=="DateTime"){    
                convertFieldsISO2DateObj(); 
              } 
              $scope.isRelationalList=true;

              //$("#md-list-commontypes").modal(); 
              //if(!$scope.editableList || $scope.editableList.length==0){
                //$scope.listSearchRelationDocs();
              //}  

              if(functionality=="add"){
                $scope.addListItem();
              }else if(functionality=="modify"){

                if(column.document.relatedTo=='Object'){
                  $scope.showListJsonObject(data,index);
                }else if(column.document.relatedTo=='GeoPoint'){
                  $scope.editListGeoPoint(index);
                }else{
                  $scope.modifyListItem(data,index);
                }    

              }else if(functionality=="delete"){
                $scope.deleteListItem(index);
              }              

            };
            //End of relation

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
              //If Relation
              if($scope.tableRecordArray && $scope.tableRecordArray.length>0){
                $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
              }  
            };

            $scope.showListJsonObject=function(row,index){ 
              $scope.listEditableRow=row;//row
              $scope.listIndex=index;      
              if(!row){
                $scope.listEditableRow=null;
              }                 
              $scope.relEditableJsonObj =JSON.stringify($scope.listEditableRow,null,2);            
              $("#mdrelobjectviewer").modal();
            };

            $scope.editListGeoPoint=function(index){            
              $scope.geopointListIndex=index;

              $scope.cloudObjectGeopoint={}; 
              $scope.cloudObjectGeopoint.latitude=$scope.editableList[index].latitude;
              $scope.cloudObjectGeopoint.longitude=$scope.editableList[index].longitude;

              $("#md-listgeodocumentviewer").modal("show");
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
                  }

                  if((data || $scope.editableColumn.relatedTo=="Boolean") && (!$scope.modifyListItemError[index])){
                    $scope.editableList[index]=data; 

                    //If Relation
                    if($scope.relatedTableRecordArray && $scope.relatedTableRecordArray.length>0){
                      $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);          
                    }      
                  }                      
              }
              
            };

            //Set
            $scope.setRelationData=function(cloudObject,column,data){
              $scope.relationError[column.name]=null;

              //DateTime
              if(column.document.dataType=="DateTime"){
                if(data){
                  data=new Date(data);
                }    
              }
              //ACL
              if(column.document.dataType=="ACL"){      
                try {     
                  if(typeof data!="object"){
                    $scope.relationError[column.name]="Invalid Object";
                  }  
                }
                catch(err) {
                  $scope.relationError[column.name]="Invalid Object";
                }
              }
              //Object
              if(column.document.dataType=="Object"){             
                data=JSON.parse(data);                 
              }

              //Email
              if(column.document.dataType=="Email" && !validateEmail(data)){
                $scope.relationError[column.name]="Invalid Email";
              }
              //URL
              if(column.document.dataType=="URL" && !validateURL(data)){
                $scope.relationError[column.name]="Invalid URL";
              }       

              //Number
              if(column.document.dataType=="Number"){
                var tempData=data;
                data=parseInt(data);
                if(data.toString()==tempData){

                }else{
                  data=null;
                  $scope.relationError[column.name]="Invalid Number";
                }
              }
              //File
              if(column.document.dataType=="File"){
                $("#md-rel-fileviewer").modal("hide");
              }
              //Relation
              if(column.document.dataType=="Relation"){
                if(data){
                  $("#md-searchreldocument").modal("hide");
                }else{
                  $scope.linkedRelatedDoc=null;
                }    
                $("#md-reldocumentviewer").modal("hide");
              }

              //EncryptedText
              if(column.document.dataType=="EncryptedText"){
                if(!$scope.nullAccepted && !data){
                  $scope.relationShowInput[column.name]=false;
                }else if(!$scope.relationError[column.name]){
                  cloudObject.set(column.name,data);
                  $scope.relationShowInput[column.name]=false;
                }
                $scope.nullAccepted=true;      
              }else if(column.document.dataType=="List"){//List
                if(!checkListErrors()){
                  cloudObject.set(column.name,data);
                  $("#md-list-commontypes").modal("hide");
                }   
              }else if(!$scope.relationError[column.name]){
                cloudObject.set(column.name,data);
              }
                  
            };

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
                  cloudBoostApiService.saveCloudObject(relCloudObject)
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
                    clearListErrors();
                    $scope.closeModal();

                  }, function(error){ 
                    $scope.relationSpinnerMode=false;   
                    $scope.relationErrorMode=error;            
                  });
                }

              }           
                
            };
            //End of Save for relation table  

            $scope.showRelationModals=function(cloudObject,column){
              $scope.relEditableRow=cloudObject;//row
              $scope.relEditableColumn=column;              

              //ACL
              if(column.document.dataType=="ACL"){
                
                var relEditableJsonObj=angular.copy(cloudObject.get(column.name));   
                if(!cloudObject.get(column.name)){
                  relEditableJsonObj=null;
                }                     
                if(relEditableJsonObj){ 
                  //Sharing Data through a service         
                  sharedDataService.pushAclObject(relEditableJsonObj);
                }
                $("#md-relaclviewer").modal();                 
              }

              //Object
              if(column.document.dataType=="Object"){
                
                $scope.relEditableJsonObj=cloudObject.get(column.name);   
                if(!cloudObject.get(column.name)){
                  $scope.relEditableJsonObj=null;
                }                
                           
                $scope.relEditableJsonObj=JSON.stringify($scope.relEditableJsonObj,null,2);
                $("#mdrelobjectviewer").modal("show");
              }

              //GeoPoint
              if(column.document.dataType=="GeoPoint"){
                $scope.relEditableGeopoint=angular.copy(cloudObject.get(column.name));   
                if(!cloudObject.get(column.name)){
                   $scope.relEditableGeopoint={};     
                   $scope.relEditableGeopoint.latitude=null;
                   $scope.relEditableGeopoint.longitude=null;
                }
                $("#md-rel-geodocumentviewer").modal();
              }
              //File
              if(column.document.dataType=="File"){
                $scope.relEditableFile=angular.copy(cloudObject.get(column.name));
                $("#md-rel-fileviewer").modal();
              }                
            };

            $scope.holdRelationData=function(cloudObject,column,data){
              if(!column.required){
                if(column.dataType=="EncryptedText"){
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
                if(column.dataType=="EncryptedText"){    
                  cloudObject.set(column.name,null);
                  $scope.nullAccepted=true;
                }
              }    
            };

            //Go Previous Table Record
            $scope.goToPrevious=function(){             
              if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
                var lastIndex=$scope.relatedTableDefArray.length-1;
                $scope.relatedTableDefArray.splice(lastIndex,1);
                $scope.relatedTableRecordArray.splice(lastIndex,1); 
                $scope.fieldsOrderArray.splice(lastIndex,1);                    
              }
            };

            //Close
            $scope.closeModal=function(){              
              if($scope.relatedTableDefArray && $scope.relatedTableDefArray.length>1){
                var lastIndex=$scope.relatedTableDefArray.length-1;
                $scope.relatedTableDefArray.splice(lastIndex,1);
                $scope.relatedTableRecordArray.splice(lastIndex,1);
                $scope.fieldsOrderArray.splice(lastIndex,1);                      
              }else{
                $scope.relatedTableDefArray=[];
                $scope.relatedTableRecordArray=[];
                $scope.fieldsOrderArray=[];
                $scope.closeRelModal();
              }
            };

            $scope.removeRelErrors=function(){
              $scope.relationErrorMode=null;
            };

            //Operations
            $scope.setAndSaveACLObject=function(cbaclobject){
              $("#md-relaclviewer").modal("hide");             
              $scope.setRelationData($scope.relEditableRow,$scope.relEditableColumn,cbaclobject); 
              sharedDataService.spliceAclObjectByIndex(0);             
            };  

            $scope.setAndSaveJsonObject=function(modifiedJson){  
              $("#mdrelobjectviewer").modal("hide");

              if($scope.editableRow && ($scope.listIndex==0 || $scope.listIndex>0)){
                $scope.listEditableRow=modifiedJson;
                $scope.modifyListItem($scope.listEditableRow,$scope.listIndex);
              }else{
                $scope.relEditableJsonObj=modifiedJson; 
                $scope.setRelationData($scope.relEditableRow,$scope.relEditableColumn,$scope.relEditableJsonObj); 
              }                          
            };  


            $scope.relfileSelected=function(column,selectedFile,fileName,fileObj){  
              column=CB.fromJSON(column.document);

              $scope.relEditableRow=$scope.relatedTableRecordArray[$scope.relatedTableRecordArray.length-1];
              $scope.relEditableColumn=column;              

              $scope.isFileSelected=true;
              $scope.selectedFile=selectedFile;
              $scope.selectedfileName=fileName;
              $scope.selectedFileObj=fileObj;
              $scope.selectedFileExtension=fileName.split(".")[fileName.split(".").length-1]; 
              $scope.setRelFile();
            };

            //relation File
            $scope.setRelFile=function(){    
              if($scope.selectedFileObj) {               
                $scope.setRelFileSpinner[$scope.relEditableColumn.name]=true; 
                $scope.setRelFileProgress[$scope.relEditableColumn.name]=0;
                $scope.$digest();          

                cloudBoostApiService.getCBFile($scope.selectedFileObj,function(cloudBoostFile){

                  $scope.relEditableRow.set($scope.relEditableColumn.name,cloudBoostFile);        
                  $scope.removeSelectdFile();
                  $scope.setRelFileSpinner[$scope.relEditableColumn.name]=false;  
                  $scope.setRelFileProgress[$scope.relEditableColumn.name]=100;                
                  $scope.relEditableRow=null; 
                  $scope.relEditableColumn=null;                    
                  $scope.relEditableFile=null;
                  $scope.$digest();                  

                },function(error){

                  $scope.setRelFileSpinner[$scope.relEditableColumn.name]=false; 
                  $scope.setRelFileProgress[$scope.relEditableColumn.name]=0;
                  $scope.setRelFileError[$scope.relEditableColumn.name]="Something went wrong .try again";
                  $scope.$digest();
                  
                },function(uploadProgress){

                  uploadProgress=uploadProgress*100;
                  uploadProgress=Math.round(uploadProgress);                   

                  $scope.setRelFileProgress[$scope.relEditableColumn.name]=uploadProgress;
                  $scope.$digest();
                });             

              }
            };
            //End of Relation File

            $scope.relSetAndSaveGeopoint=function(modifiedGeo){
              if($scope.geopointListIndex==0 || $scope.geopointListIndex>0){
                $scope.listEditableGeopoint=modifiedGeo;                
                var loc = new CB.CloudGeoPoint($scope.listEditableGeopoint.longitude,$scope.listEditableGeopoint.latitude);   
                $scope.editableList[$scope.geopointListIndex]=loc;                
                
                //If Relation
                if($scope.relatedTableRecordArray && $scope.relatedTableRecordArray.length>0){
                  $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);          
                }

                $scope.listEditableGeopoint.latitude=null;
                $scope.listEditableGeopoint.longitude=null; 

                $("#md-rel-geodocumentviewer").modal("hide");               
                
              }else {
                $scope.relEditableGeopoint=modifiedGeo;
                if($scope.relEditableRow.get($scope.relEditableColumn.name)){//if geopoint is there

                  //checking for old data!=new data
                  if(($scope.relEditableRow.get($scope.relEditableColumn.name).latitude!=$scope.relEditableGeopoint.latitude) || ($scope.relEditableRow.get($scope.relEditableColumn.name).longitude!=$scope.relEditableGeopoint.longitude)){
                    var loc = new CB.CloudGeoPoint($scope.relEditableGeopoint.longitude,$scope.relEditableGeopoint.latitude);
                    $scope.relEditableRow.set($scope.relEditableColumn.name,loc);
                  }else{  
                   $("#md-rel-geodocumentviewer").modal("hide");   
                   $scope.relEditableGeopoint=null;
                  }

                }else{//else empty
                  var loc = new CB.CloudGeoPoint($scope.relEditableGeopoint.longitude,$scope.relEditableGeopoint.latitude);
                  $scope.relEditableRow.set($scope.relEditableColumn.name,loc);
                  //relSaveGeopoint();
                  $("#md-rel-geodocumentviewer").modal("hide");
                }
              }
                  
            };

            $scope.addListItem=function(item){
            
              $scope.addListItemError=null;
              
              if(!$scope.editableList || $scope.editableList.length==0){
                $scope.editableList=[];
              }
              var newListItem=null;

              /*********************ADD ITEM*************************************/
              if($scope.editableColumn.relatedTo=="DateTime"){    
                newListItem=new Date(); 
              }
              if( $scope.editableColumn.relatedTo=="Object"){    
                newListItem={}; 
              }
              if($scope.editableColumn.relatedTo=="Number"){ 
                newListItem=0;              
              }
              if($scope.editableColumn.relatedTo=="Email"){     
                newListItem="hello@cloudboost.io";    
              }
              if($scope.editableColumn.relatedTo=="URL"){     
                newListItem="http://cloudboost.io";    
              }

              if($scope.editableColumn.relatedTo=="GeoPoint"){    
                $scope.addListGeopointModal();         
              }

              if($scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
                if(item){
                  newListItem=item;
                  $("#md-relsearchreldocument").modal("hide");
                }else{
                  $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.editableColumn.relatedTo}));
                  $scope.searchRelationDocs();
                }    
              }

              if($scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
                if(newListItem){
                  //Push Record
                  $scope.editableList.push(newListItem); 

                  //If Relation
                  if($scope.relatedTableRecordArray && $scope.relatedTableRecordArray.length>0){
                    $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
                  }
                }    
              }else if($scope.editableColumn.relatedTo!="GeoPoint"){    
                $scope.editableList.push(newListItem); 
                //If Relation
                if($scope.relatedTableRecordArray && $scope.relatedTableRecordArray.length>0){
                  $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
                }   
              } 

            };

            $scope.addListGeopointModal=function(){ 
              var loc = new CB.CloudGeoPoint(12,22);
              if(!$scope.editableList || $scope.editableList.length==0){
                $scope.editableList=[];
              }
              $scope.editableList.push(loc);
              $scope.relEditableGeopoint=loc;          
              $scope.geopointListIndex=$scope.editableList.indexOf(loc);
              $("#md-rel-geodocumentviewer").modal("show");
            };
          
            //List ACL && JsonObject
            $scope.relListFileSelected=function(column,selectedFile,fileName,fileObj){  
              column=CB.fromJSON(column.document);

              $scope.editableRow=$scope.relatedTableRecordArray[$scope.relatedTableRecordArray.length-1];
              $scope.editableColumn=column;  

              $scope.editableList=$scope.editableRow.get(column.name); 
              $scope.newListItem=null;
              $scope.addListItemError=null;
              clearListErrors();
              $scope.isRelationalList=true;

              $scope.isFileSelected=true;
              $scope.selectedFile=selectedFile;
              $scope.selectedfileName=fileName;
              $scope.selectedFileObj=fileObj;
              $scope.selectedFileExtension=fileName.split(".")[fileName.split(".").length-1]; 

              if(!$scope.editableList || $scope.editableList.length==0){
                $scope.editableList=[];
              }
              
              var dummyObj={};
              $scope.editableList.push(dummyObj);  
              var newIndex=$scope.editableList.indexOf(dummyObj);  
              $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);

              $scope.listFileSpinner[newIndex]=true;
              $scope.listFileProgress[newIndex]=0;
              $scope.$digest();              

              fileSaveWrapper($scope.selectedFileObj,newIndex,function(cloudBoostFile,respIndex){
                $scope.editableList[respIndex]=cloudBoostFile;      
                $scope.removeSelectdFile();
                $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
                $scope.listFileSpinner[respIndex]=false;
                $scope.listFileProgress[respIndex]=100;
                $scope.$digest();                  

              },function(error,respIndex){                
                $scope.listFileSpinner[respIndex]=false;
                $scope.listFileError[respIndex]="Something went wrong. try again";
                $scope.$digest();                
              },function(uploadProgress,respIndex){
                uploadProgress=uploadProgress*100;
                uploadProgress=Math.round(uploadProgress);                   

                $scope.listFileProgress[respIndex]=uploadProgress;
                $scope.$digest();
              }); 
            };


            function fileSaveWrapper(fileObj,index,successCallBk,errorCallBk,progressCallBk){

              cloudBoostApiService.getCBFile(fileObj,function(cloudBoostFile){
                successCallBk(cloudBoostFile,index);
              },function(error){
                errorCallBk(error,index);               
              },function(uploadProgress){
                progressCallBk(uploadProgress,index);
              });

            }

            $scope.deleteRelationListItem=function(index,column){ 

              $scope.editableRow=$scope.relatedTableRecordArray[$scope.relatedTableRecordArray.length-1];
              $scope.editableColumn=column;  

              $scope.editableList=$scope.editableRow.get(column.name);

              $scope.editableList.splice(index,1);
              if($scope.editableList.length==0){
                $scope.editableList=null;
              }

              if($scope.editableColumn.relatedTo=="File"){     
                $scope.listEditableRow=null;//row
                $scope.listEditableColumn=null;//row
                $scope.listIndex=null;
              }  
              $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);   
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
                //$scope.relToRel=true;

                $scope.viewRelationData(cloudObject,column,null);
                
              }else{
                $scope.linkedRelatedDoc=null;
                //$scope.relToRel=true;    
                $scope.searchRelationDocs();
              } 
            }; 

            $scope.deleteRelLink=function(row,column){
              row.set(column.name,null);
            };       

            $scope.searchRelationDocs=function(){                           

              //List Relations records 
              cloudBoostApiService.loadTableData($scope.tableDef,"createdAt","asc",20,0)
              .then(function(listCBObjs){        
               
               if(listCBObjs && listCBObjs.length>0){
                $scope.relationTableData=listCBObjs;
               }    
                  
               $("#md-splrelsearchreldocument").modal();
               $scope.searchRelDocsError=null;          
               //$scope.$digest(); 
                                                      
              },function(error){ 
                $scope.searchRelDocsError=error;      
              });
              //List Relations records    
            };

            $scope.linkRecord=function(relationCBRecord){ 
              $("#md-splrelsearchreldocument").modal("hide"); 
              if($scope.editableColumn && $scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
                $scope.addListItem(relationCBRecord);
              }else{
                $scope.setRelationData($scope.relEditableRow,$scope.relEditableColumn,relationCBRecord); 
              }                
            };  
            
            /*******************************Private Functions********************************************/
            $scope.removeSelectdFile=function(){
              $scope.selectedFile=null;
              $scope.selectedfileName=null;
              $scope.selectedFileObj=null;
              $scope.selectedFileExtension=null;
            };

            function nullifyEditable(){             
              $scope.editableRow=null;//row
              $scope.editableColumnName=null;//column name 
              $scope.editableIndex=null;//index 
              $scope.nullAccepted=false;
            }

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

            function clearRelationErrors(){
              var columns=$scope.relatedTableDefArray[$scope.relatedTableDefArray.length-1].columns;
              for(var i=0;i<columns.length;++i){
                var colname=columns[i].name;
                $scope.relationError[colname]=null;
                $scope.relationShowInput[colname]=false;       
              }              
            }

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

            function clearListErrors(){
              if($scope.modifyListItemError && $scope.modifyListItemError.length>0){
                for(var i=0;i<$scope.modifyListItemError.length;++i){
                  $scope.modifyListItemError[i]=null;      
                }
              }
            }

            function convertFieldsISO2DateObj(){
              if($scope.editableList && $scope.editableList.length>0){
                for(var i=0;i<$scope.editableList.length;++i){
                  $scope.editableList[i]= new Date($scope.editableList[i]);
                }    
              }      
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
        }]
    };
});
