
app.directive('cbList', function(){
    return {
        restrict: 'E',
        transclude: true,      
        scope: {
          'editableRow':'=cbobject',          
          'editableColumn': '=column', 
          'editableList': '=list',          
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/listTemplate.html',       
        controller:['$scope','$rootScope','cloudBoostApiService',function($scope,$rootScope,cloudBoostApiService) { 
          
          $scope.modifyListItemError=[];          
          $scope.listFileSpinner=[];
          $scope.listFileProgress=[];

          $scope.tableDefArray=[];
          $scope.tableRecordArray=[];
          $scope.fieldsOrderArray=[];

          $scope.init=function(){
            clearListErrors();
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
              //newListItem=0;              
            }
            if($scope.editableColumn.relatedTo=="Email"){     
              //newListItem="hello@cloudboost.io";    
            }
            if($scope.editableColumn.relatedTo=="URL"){     
              //newListItem="http://cloudboost.io";    
            }

            if($scope.editableColumn.relatedTo=="GeoPoint"){    
              $scope.addListGeopointModal();         
            }

            if($scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
              if(item){
                newListItem=item;
                $("#md-listsearchreldocument").modal("hide");
              }else{
                $scope.searchRelationDocs();
              }    
            }

            if($scope.editableColumn.relatedTo!='Text' && $scope.editableColumn.relatedTo!='Email' && $scope.editableColumn.relatedTo!='URL' && $scope.editableColumn.relatedTo!='Number' && $scope.editableColumn.relatedTo!='DateTime' && $scope.editableColumn.relatedTo!='Object' && $scope.editableColumn.relatedTo!='Boolean' && $scope.editableColumn.relatedTo!='File' && $scope.editableColumn.relatedTo!='GeoPoint'){
              if(newListItem){
                //Push Record
                $scope.editableList.push(newListItem); 

                //If Relation
                if($scope.tableRecordArray && $scope.tableRecordArray.length>0){
                  $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
                }
              }    
            }else if($scope.editableColumn.relatedTo!="GeoPoint"){    
              $scope.editableList.push(newListItem); 
              //If Relation
              if($scope.tableRecordArray && $scope.tableRecordArray.length>0){
                $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);
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
                }

                if((data || $scope.editableColumn.relatedTo=="Boolean") && (!$scope.modifyListItemError[index])){
                  $scope.editableList[index]=data; 

                  //If Relation
                  if($scope.tableRecordArray && $scope.tableRecordArray.length>0){
                    $scope.editableRow.set($scope.editableColumn.name,$scope.editableList);          
                  }      
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
            $scope.cloudObjectForJson =JSON.stringify($scope.listEditableRow,null,2);            
            $("#md-listobjectviewer").modal();
          };

          $scope.setAndSaveJsonObject=function(modifiedJson){ 
            $("#md-listobjectviewer").modal("hide");
            modifiedJson=JSON.parse(modifiedJson);
            $scope.editableList[$scope.listIndex]=modifiedJson;
          };

          $scope.fileSelected=function(selectedFile,fileName,fileObj){
            $scope.isFileSelected=true;
            $scope.selectedFile=selectedFile;
            $scope.selectedfileName=fileName;
            $scope.selectedFileObj=fileObj;
            $scope.selectedFileExtension=fileName.split(".")[fileName.split(".").length-1];          
               
            $scope.addListFile(fileObj);            
          };

          $scope.addListFile=function(fileObj){             
            if(fileObj) {     
              if(!$scope.editableList || $scope.editableList.length==0){
                $scope.editableList=[];
              }
              var dummyObj={};    
              $scope.editableList.push(dummyObj);
                 
              var index=$scope.editableList.indexOf(dummyObj);
              $scope.listFileSpinner[index]=true;
              $scope.listFileProgress[index]=0;
              $scope.$digest();           

              fileSaveWrapper(fileObj,index,function(cloudBoostFile,respIndex){
                $scope.editableList[respIndex]=cloudBoostFile;       
                $scope.removeSelectdFile();
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
                          
            }
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

          //List Geopoint
          $scope.addListGeopointModal=function(){ 
            var loc = new CB.CloudGeoPoint(0,0);
            if(!$scope.editableList || $scope.editableList.length==0){
              $scope.editableList=[];
            }
            $scope.editableList.push(loc);

            $scope.cloudObjectGeopoint={}; 
            $scope.cloudObjectGeopoint.longitude=loc.longitude;
            $scope.cloudObjectGeopoint.latitude=loc.latitude;

            $scope.geopointListIndex=$scope.editableList.indexOf(loc);
            $("#md-listgeodocumentviewer").modal("show");
          };

          $scope.modifyListGeoPoint=function(modifiedGeo){ 
            var loc = new CB.CloudGeoPoint(modifiedGeo.longitude,modifiedGeo.latitude);   
            $scope.editableList[$scope.geopointListIndex]=loc;             
            $("#md-listgeodocumentviewer").modal("hide");            
          };

          $scope.editListGeoPoint=function(index){            
            $scope.geopointListIndex=index;

            $scope.cloudObjectGeopoint={}; 
            $scope.cloudObjectGeopoint.latitude=$scope.editableList[index].latitude;
            $scope.cloudObjectGeopoint.longitude=$scope.editableList[index].longitude;

            $("#md-listgeodocumentviewer").modal("show");
          };

          $scope.viewRelationalBrowser=function(row,column,index){

              if(!row){
                row=$scope.editableRow;
              }
              if(!column){
                column=$scope.editableColumn;
              }                  

              if(row.get(column.name) instanceof Array){
                //$("#md-list-commontypes").modal("hide")
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
                  $scope.tableDefArray.push(tableDef);       
                  $scope.tableRecordArray.push(record);

                  var response=_fieldOrder(tableDef,record);                  
                  $scope.fieldsOrderArray.push(response);

                }     
                $scope.openMiniBrowser=true;
                $("#splmdlistrelationviewer").modal();                

              }, function(error){
                $scope.viewRelDataError.push(error);
                $scope.openMiniBrowser=true;
                $("#splmdlistrelationviewer").modal();  
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

          //List Relationdocs search
          $scope.searchRelationDocs=function(){
            $scope.searchRelDocsError=null;
            $scope.tableDef=_.first(_.where($rootScope.currentProject.tables, {name: $scope.editableColumn.relatedTo})); 

            //List Relations records 
            cloudBoostApiService.loadTableData($scope.tableDef,"createdAt","asc",20,0)
            .then(function(list){        
                 
             $scope.relationTableData=list;   
             $("#md-listsearchreldocument").modal();          
             //$scope.$digest(); 
                                                    
            },function(error){ 
              $scope.searchRelDocsError=error;      
            });
            //List Relations records    
          };

          $scope.setAndSaveList=function(){
            if(!checkListErrors()){
              $scope.save({updatedList:$scope.editableList});
            }
          };

          $scope.closeListModal=function(){
            clearListErrors();
          };

          $scope.goToDataBrowser=function(t){              
            $("#md-listsearchreldocument").modal("hide");     
            window.location.href="#/"+$rootScope.currentProject.appId+"/table/"+t.name;
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

          $scope.closeRelModal=function(){  
            $scope.tableDefArray=[];
            $scope.tableRecordArray=[];
            $scope.fieldsOrderArray=[];
            $("#splmdlistrelationviewer").modal("hide");
            $scope.openMiniBrowser=false;
          };


          /************************************************Private Functions***********************************/
          function clearListErrors(){
            if($scope.modifyListItemError && $scope.modifyListItemError.length>0){
              for(var i=0;i<$scope.modifyListItemError.length;++i){
                $scope.modifyListItemError[i]=null;      
              }
            }
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
