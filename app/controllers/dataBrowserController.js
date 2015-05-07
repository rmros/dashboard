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
      uiGridConstants,
      uiGridEditConstants,
      cloudObjectService) {
       
      var id;
      var tableId;
      var isAppLoaded = false;
      $scope.isRefreshed = false;
      $scope.cellEditing=true;
      $scope.saveStaticTypeSpinner=false;       

      var query = null;
      var paginationOptions = {       
        pageNumber:1,
        pageSize:20,  
        totalItems:50,
        pageSizes:[20,30,50,70],
        sort: null
      };

      $scope.displayed = []; //this is an array of objects which are showed on the table.
      $scope.gridOptions ={};
  

      $scope.initialize = function() {
          $rootScope.page='dataBrowser';
          $rootScope.dataLoading=true; 
          id = $stateParams.appId;
          tableId= $stateParams.tableId;
            
          loadProject(id);          
      };    
      
      $scope.viewList = function(row, gridColName){

        var columnName = gridColName;
        var col=_.first(_.where($scope.selectedTable.columns, {name:columnName}));

        var index=$scope.gridOptions.data.indexOf(row.entity);
        var obj = $scope.displayed[index];

        var isStaticType = false;

        if(_.where(columnDataTypeService.getcolumnDataTypes(),{type : 'static', name : col.relatedTo}).length>0){
          isStaticType = true;
        }

        var list = obj.get(columnName);

        if(!isStaticType){
            $scope.tableNameIniated=angular.copy($scope.selectedTable.name);
            $scope.objectIdIniated=angular.copy(obj.id);

            var table=_.first(_.where($rootScope.currentProject.currentTables, {name:col.relatedTo}));
            var relatedTable=angular.copy(table);
            $scope.originaleTableName=angular.copy(relatedTable.name);

            relatedTable.name=columnName;
            relatedTable.isColumn=true;
            relatedTable.type.icon="share";
            
            $scope.isList=true;

            if(list && list.length>0){                    
              $scope.selectTable(relatedTable, list);
            }else{
              var list=[];              
              $scope.selectTable(relatedTable,list);      
            }
        }        

        if(isStaticType){
            $scope.relationColumnName=columnName;
            $scope.relationObject=obj;
            $scope.relationDataType=col.relatedTo;

          
            if(!list || list.length==0){                    
              var list=[];
            }            
           
            if(col.relatedTo=="Object"){
              $scope.editJSON(row,columnName);
            }else{  
              $scope.staticTypeListFields=[]; 
              $scope.staticTypeListFieldsCopy=[];           
              if(list.length>0){

                for(var i=0;i<list.length;++i){
                  if(col.relatedTo=="DateTime"){
                    list[i]=new Date(list[i]);
                  }
                  var tempStaticTypeJSON={
                    value:list[i]
                  };
                  $scope.staticTypeListFields.push(tempStaticTypeJSON);
                  $scope.staticTypeListFieldsCopy=angular.copy($scope.staticTypeListFields);
                }
              }
              
              $('#relation-list').modal('show');
            }
            
        }     
        
      };

      $scope.viewRelation = function(row, columnName){        

        $timeout(function () {
            if($scope.cellEditing) {
              var index=$scope.gridOptions.data.indexOf(row.entity);
              var obj = $scope.displayed[index];
              var obj = obj.get(columnName);
              if(obj){
                var tableName = obj.document._tableName; 
                var table =  _.first(_.where($rootScope.currentProject.currentTables, {name : tableName}));
                $scope.selectTable(table, obj);
              }  
            }                         
           
        }, 500);     
                
      };     

      $scope.saveCloudObject = function(saveIndex,gridRow,cloudObject){
            var q=$q.defer();
            var index=-1;
            var obj={};

            //index
            if((typeof saveIndex=="number") && (saveIndex>=0)){
              index=saveIndex;
              obj=$scope.displayed[index];
            }

            //grid row
            if(gridRow){
              index=$scope.gridOptions.data.indexOf(gridRow.entity);             
              obj = $scope.displayed[index];              
            }

            //cloudobj
            if(cloudObject){            
              index=$scope.displayed.indexOf(cloudObject); 
              obj=cloudObject;              
            }            

            if(obj.document.$$hashKey){
              delete obj.document.$$hashKey;
            }     

            obj.set("createdAt",new Date(obj.createdAt));
            //obj.set("updatedAt",new Date(obj.updatedAt));

            obj=checkAndSetRelation(obj);//set relations if there 
            checkAndSetFiles(obj)//Set files if there
            .then(function(obj){             
               
              //save the object.
              obj.save({ success: function(newObj){        
                console.log(newObj);
                $scope.displayed[index]=configureCloudData(newObj); 
                $scope.displayDocument[index]=$scope.displayed[index].document;
                //$scope.gridOptions.data[index]=$scope.displayed[index].document;

                 if($scope.selectedTable.isColumn){
                  var objAssignable=getObjectInRelatedTable(newObj.document._tableName,newObj.id);
                  assignToListOfPointedTable($scope.tableNameIniated,$scope.objectIdIniated,$scope.selectedTable.name,objAssignable);
                 } 

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
              } });

            }, function(error){
              q.reject(err);
            }); 
              
          return  q.promise;      
      }; 

      $scope.deleteCloudObject = function(deleteIndex,gridRow,cloudObject){
            var q=$q.defer();

            var index=-1;
            var obj={};

            //index
            if((typeof deleteIndex=="number") && (deleteIndex>=0)){
              index=deleteIndex;
              obj=$scope.displayed[index];
            }

            //grid row
            if(gridRow){
              index=$scope.gridOptions.data.indexOf(gridRow.entity);             
              obj = $scope.displayed[index];             
            }

            //cloudobj
            if(cloudObject){
              index=$scope.displayed.indexOf(cloudObject);             
              obj=cloudObject;              
            }            

            if(obj.document.$$hashKey){
              delete obj.document.$$hashKey;
            }

            //save the object.
            obj.delete().then(function(obj){             
               
               q.resolve(obj);
               //$scope.$digest();

            }, function(error){              
              $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'Cannot delete this object at this point in time. Please try again later.',
                  class_name: 'danger'
                }); 
              q.reject(error);

              $scope.$digest();

            });

            return  q.promise;
      };     

      $scope.getType = function(x) {
            return typeof x;
      };

      $scope.isDate = function(x) {
            return x instanceof Date;
      };       

      $scope.selectTable = function(t, obj) {

        //Removing all temporary table like columns
        if(!$scope.isList){
          for(var i=0;i<$rootScope.currentProject.currentTables.length;++i){
            if($rootScope.currentProject.currentTables[i].isColumn==true){
              $rootScope.currentProject.currentTables.splice(i,1);
              $scope.originaleTableName=null;            
            }
          }
        }        

        $scope.displayed = []; //empty the list
        $scope.selectedTable = t; 
        $scope.isLoading = true;     

        if(!obj && !$scope.isList){
            //load the list for the first time.
            query = new CB.CloudQuery($scope.selectedTable.name);
            query.setSkip(paginationOptions.pageNumber-1);
            query.setLimit(paginationOptions.pageSize);
            query.orderByDesc('createdAt');
            query.find({success : function(list){ 
              //count no objects                    
              query.count({ success: function(count){        
                    loadGrid(list,count);         
                    $scope.$digest(); 

              },error: function(err) {
               //Error in retrieving the data.
              } });                                  

            }, error : function(error){                
                $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                });
            }});       
          }

          if(obj instanceof CB.CloudObject){ 
            //load the list for the first time. 
            query = new CB.CloudQuery($scope.selectedTable.name);
            query.get(obj.id,{success : function(cloudObject){
              //this is a list of CLoudObjects.              
              if(cloudObject){
                $scope.displayed.push(cloudObject);
                loadGrid($scope.displayed,1); 
              }else{
                $scope.displayed=null;
                loadGrid($scope.displayed,0);
              }                        
              $scope.$digest();

            }, error : function(error){               
                $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                });
            }});       
          }

          if(obj instanceof Array || $scope.isList){

            if(obj && obj.length>0){
                var promises = [];
                for(var i=0;i<obj.length; i++){
                  //load the list for the first time. 
                  query = new CB.CloudQuery($scope.originaleTableName);
                  promises.push(query.get(obj[i].id));
                }

                $q.all(promises).then(function(list){ 
                   $scope.isList=false;             
                   $rootScope.currentProject.currentTables.push($scope.selectedTable);
                   if(list){
                    loadGrid(list,list.length);
                   }else{
                    loadGrid(null,0);
                   }                                 
                }, function(){                
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Opps! something went wrong',
                      text: 'We cannot load your data at this point in time. Please try again later.',
                      class_name: 'danger'
                    }); 
                });
            }else{      
                $scope.isList=false;          
                $rootScope.currentProject.currentTables.push($scope.selectedTable);
                loadGrid(obj,0);                
            }
              
          }           
          
      };

      $scope.addRow=function(){
        if($scope.selectedTable.isColumn){
          var obj = new CB.CloudObject($scope.originaleTableName);
          obj.set('createdAt', new Date());
          obj.set('updatedAt', new Date());
        }else{
          var obj = new CB.CloudObject($scope.selectedTable.name);
          obj.set('createdAt', new Date());
          obj.set('updatedAt', new Date());
        }      

        if(!$scope.displayed){
          $scope.displayed=[];
        }          
        $scope.displayed.push(configureCloudData(obj)); 
        $scope.displayDocument.push(obj.document);      

        paginationOptions.totalItems=paginationOptions.totalItems+1;
        $scope.gridApi.grid.options.totalItems=paginationOptions.totalItems;                              
      }; 

      $scope.deleteRow=function(){                        
        //delete first. 
        var selectedRows=$scope.gridApi.selection.getSelectedRows();
        deleteUnsavedRows(selectedRows);

        var promiseArray=[];
        for(var i=0;i<$scope.displayDocument.length;++i){ 

            var findRow= _.find(selectedRows,function(val){ 
                  if(val._id==$scope.displayDocument[i]._id){                                     
                    return val;
                  }
            });  

            if(findRow){                 
              //delete row in cloudObject
              promiseArray.push($scope.deleteCloudObject(i,null,null));
            }                                    
        } 

        if(promiseArray.length>0){

          $q.all(promiseArray).then(function(deletedObj){                

              for(var i=0;i<deletedObj.length;++i){                     
                 var findObj=_.first(_.where($scope.displayed, {id:deletedObj[i].id}));
                 var index=$scope.displayed.indexOf(findObj);

                 $scope.displayed.splice(index,1);
                 $scope.displayDocument.splice(index,1); 
                 //$scope.$digest();                      
              }              

          }, function(err){
              $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'Cannot delete this object at this point in time. Please try again later.',
                  class_name: 'danger'
              }); 
          });

        }//End of if                 

      };

      $scope.fileChange=function(file,index){
          fileSet(file)
          .then(function(cloudBoostFile){
              $scope.staticTypeListFields[index].value=cloudBoostFile;

              if($scope.temporaryFileIndex==index){
                $scope.temporaryFile=null;
                $scope.temporaryFileIndex=null;
              } 

          }, function(err){
            $.gritter.add({
                position: 'top-right',
                title: 'Opps! something went wrong',
                text: 'Error with Uploading File. '+err,
                class_name: 'danger'
            });     

          });
      }; 

      $scope.swipeToFileInput=function(index){
        if($scope.temporaryFile){
          $scope.staticTypeListFields[$scope.temporaryFileIndex].value=angular.copy($scope.temporaryFile);
        } 

        $scope.temporaryFile=angular.copy($scope.staticTypeListFields[index].value);
        $scope.temporaryFileIndex=index;
        $scope.staticTypeListFields[index].value=null;        
      };

      $scope.assignFileBack=function(index){
         $scope.staticTypeListFields[index].value=angular.copy($scope.temporaryFile);
         $scope.temporaryFile=null;
         $scope.temporaryFileIndex=null;
      };

      $scope.addStaticTypeField=function(){
        var tempStaticTypeJSON={
                    value:null
                  };
        $scope.staticTypeListFields.push(tempStaticTypeJSON);

        if($scope.temporaryFile){
          $scope.staticTypeListFields[$scope.temporaryFileIndex].value=angular.copy($scope.temporaryFile);
          $scope.temporaryFile=null;
          $scope.temporaryFileIndex=null;
        }
      };

      $scope.deleteStaticTypeField=function(index){
        if($scope.temporaryFile){
          $scope.staticTypeListFields[$scope.temporaryFileIndex].value=angular.copy($scope.temporaryFile);
          $scope.temporaryFile=null;
          $scope.temporaryFileIndex=null;
        }

        $scope.staticTypeListFields.splice(index,1);      
      };

      $scope.saveStaticTypeField=function(){ 
        if($scope.temporaryFile){
          $scope.staticTypeListFields[$scope.temporaryFileIndex].value=angular.copy($scope.temporaryFile);
          $scope.temporaryFile=null;
          $scope.temporaryFileIndex=null;
        }

        var list=[];
        if($scope.relationDataType!='File'){
            for(var i=0;i<$scope.staticTypeListFields.length;++i){
              if($scope.relationDataType=='DateTime'){
                $scope.staticTypeListFields[i].value=new Date($scope.staticTypeListFields[i].value);
              }
              list.push($scope.staticTypeListFields[i].value);
            }
            setAndSaveList(list);
        }   

        if($scope.relationDataType=='File'){ 
          
            for(var i=0;i<$scope.staticTypeListFields.length;++i){             
              list.push($scope.staticTypeListFields[i].value);
            }
            setAndSaveList(list);    
            
        }//End of if file

      };

      function setAndSaveList(list){
        $scope.saveStaticTypeSpinner=true; 

        $scope.relationObject.set($scope.relationColumnName,list);
        $scope.saveCloudObject(null,null,$scope.relationObject)
        .then(function(newObj){
          $scope.saveStaticTypeSpinner=false;
          $('#relation-list').modal('hide');                                      
        },
        function(error){  
            $scope.saveStaticTypeSpinner=false;
            $('#relation-list').modal('hide');                        
            $.gritter.add({
                position: 'top-right',
                title: 'Opps! something went wrong',
                text: 'We cannot save your cloudObject at this point in time. Please try again later.',
                class_name: 'danger'
            });  
        });
      }

      $scope.removeRelation=function(){
        var selectedRows=$scope.gridApi.selection.getSelectedRows();
        deleteUnsavedRows(selectedRows);

        var promiseArray=[];       
        for(var i=0;i<$scope.displayDocument.length;++i){ 

            var findRow= _.find(selectedRows,function(val){ 
                  if(val._id==$scope.displayDocument[i]._id){                                     
                    return val;
                  }
            });  

            if(findRow){                 
              //delete row in cloudObject
              promiseArray.push(removeRelationInTable(findRow._id,$scope.tableNameIniated,$scope.objectIdIniated,$scope.selectedTable.name));
              
            }                                    
        } 

        if(promiseArray.length>0){

          $q.all(promiseArray).then(function(deletedObj){                

              for(var i=0;i<deletedObj.length;++i){                     
                 var findObj=_.first(_.where($scope.displayed, {id:deletedObj[i].id}));
                 var index=$scope.displayed.indexOf(findObj);

                 $scope.displayed.splice(index,1);
                 $scope.displayDocument.splice(index,1); 
                 //$scope.$digest();                      
              }              

          }, function(err){
              $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'Cannot remove relation to this object at this point in time. Please try again later.',
                  class_name: 'danger'
              }); 
          });

        }//End of if     
      };

      $scope.refresh = function(){
        $scope.isRefreshed = true;
        $scope.selectTable($scope.selectedTable);
      }; 

      $scope.editJSON=function(row,colName){
       $scope.currentGridRow=row;        
        var index=$scope.gridOptions.data.indexOf(row.entity);
        var obj = $scope.displayed[index];

        $scope.editableObject = obj;
        $scope.jsonObjColumnName = colName;
        var jsonSchema=obj.get(colName);
        $scope.jsonObj=jsonSchema;
        if(!jsonSchema){
           $scope.jsonObj=null;
        } 

        $('#jsonModal').modal('show');
      };

      $scope.saveObjectChanges = function(){
        $scope.editableObject.set($scope.jsonObjColumnName, $scope.jsonObj);
        //Save CloudObject
        $scope.saveCloudObject(null,$scope.currentGridRow,null);

        $scope.jsonObj = null;
        $scope.editableObject = null;
        $scope.jsonObjColumnName = null;
        $scope.currentGridRow=null;     
      };


      /*GRID API*/
      $scope.gridOptions.onRegisterApi = function(gridApi){
            //set gridApi on scope
            $scope.gridApi = gridApi;

            $scope.gridApi.edit.on.beginCellEdit($scope,function(rowEntity, colDef){
              $scope.cellEditing=false;
              var rowIndex=$scope.gridOptions.data.indexOf(rowEntity); 
              
            });

            //After cell edit 
            $scope.gridApi.edit.on.afterCellEdit($scope,function(rowEntity,colDef, newValue, oldValue){
              $scope.columnType=colDef.type;//type of column
              $scope.cellEditing=true;    

              var rowIndex=$scope.gridOptions.data.indexOf(rowEntity);
              
              //If column type==file              
              if((typeof rowIndex=="number")  && ($scope.columnType=="File")){          
                $scope.displayed[rowIndex].set(colDef.field,cloudObjectService.file);
              } 

              $scope.saveCloudObject(rowIndex,null,null);
              $scope.$apply();
            }); 

           //sorting
          $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
              if (sortColumns.length == 0) {
                paginationOptions.sort = null;
              } else {
                paginationOptions.sort = sortColumns[0].sort.direction;
              }   
              getPage();           
          }); 

          //Pagination
          $scope.gridApi.pagination.on.paginationChanged($scope,function(newPage,pageSize){
              paginationOptions.pageNumber = newPage;
              paginationOptions.pageSize = pageSize;
              getPage();             
          });       
               
      };

       /* PRIVATE FUNCTIONS */

        function loadProject(id){

            projectService.getProject(id).then(
               function(currentProject){
                    if(currentProject){
                      $rootScope.currentProject=currentProject;
                      getProjectTables();
                      initCbApp();
                    }                              
               },
               function(error){                         
                   $.gritter.add({
                        position: 'top-right',
                        title: 'Opps! something went wrong',
                        text: 'We cannot load your project at this point in time. Please try again later.',
                        class_name: 'danger'
                    });  
               }
             );
        }

        function getProjectTables(){

           tableService.getProjectTables($rootScope.currentProject).then(
               function(data){
                      if(!data){
                         $rootScope.currentProject.currentTables=[];
                      }     
                    else if(data){
                          $rootScope.currentProject.currentTables=data;

                          if($rootScope.currentProject.currentTables.length>0){

                             if(tableId){
                              var tableObj=_.first(_.where($rootScope.currentProject.currentTables, {name:tableId}));
                              if(tableObj){
                                $scope.selectTable(tableObj);
                              }else{
                                $scope.selectTable($rootScope.currentProject.currentTables[0]); 
                              }                          
                            }else{
                              $scope.selectTable($rootScope.currentProject.currentTables[0]); 
                            } 
                            
                          }                    
                      }else{                                              
                         $rootScope.currentProject.currentTables=[];
                      } 
               }, function(error){                         
                   $.gritter.add({
                        position: 'top-right',
                        title: 'Opps! something went wrong',
                        text: 'We cannot load your tables at this point in time. Please try again later.',
                        class_name: 'danger'
                    }); 
               });
        } 

        function initCbApp(){
          CB.CloudApp.init($rootScope.currentProject.appId,$rootScope.currentProject.keys.master); //load the master key.
          isAppLoaded = true;
        }

        function formatDate(dateString){
          var dateObj=new Date(dateString);
          var formatedDate=$filter('date')($filter('convertIsoToDate')(dateObj),"'M/d/yyyy h:mm a");                
          return formatedDate;
        }  

        function checkAndSetFiles(obj){ 
            var q=$q.defer();

            if($scope.columnType=="File"){
                var promises=[];
                var keysArray=[];
                for(var j=0;j<$scope.selectedTable.columns.length;++j){

                  if($scope.selectedTable.columns[j].dataType=="File"){
                     
                    var isKey=_.find(_.keys(obj.document), function(key){
                        return key==$scope.selectedTable.columns[j].name;                   
                    });

                    if(isKey && obj.document[isKey]){                                  
                      promises.push(fileSet(obj.document[isKey]));
                      keysArray.push(isKey);                                                        
                    }                        
                  }
                }
                
                if(promises.length>0){
                  $q.all(promises).then(function(fileList){
                    if(fileList.length>0){
                      for(var i=0;i<fileList.length;++i){
                        obj.set(keysArray[i],fileList[i]);
                      }
                      q.resolve(obj);
                    } 
                                   
                  }, function(err){ 
                      q.reject(err);                
                      $.gritter.add({
                        position: 'top-right',
                        title: 'Opps! something went wrong',
                        text: 'We cannot load your data at this point in time. Please try again later.',
                        class_name: 'danger'
                      }); 
                  });
                }else{
                  q.resolve(obj);
                }
            }else{
              q.resolve(obj);
            }

            return  q.promise;
        }

        function fileSet(fileObj){

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

        function checkAndSetRelation(obj){         
          if($scope.columnType=="Relation"){
              for(var j=0;j<$scope.selectedTable.columns.length;++j){

                  if($scope.selectedTable.columns[j].dataType=="Relation"){
                     
                    var isKey=_.find(_.keys(obj.document), function(key){
                        return key==$scope.selectedTable.columns[j].name;                   
                    });

                    if(isKey && obj.document[isKey]){ 

                      if(typeof obj.document[isKey]=="object"){
                        var id=obj.document[isKey].id;
                        var reatedObj=getObjectInRelatedTable($scope.selectedTable.columns[j].relatedTo,id);                                  
                        obj.set(isKey,reatedObj);
                      }else if(typeof obj.document[isKey]=="string"){
                        var reatedObj=getObjectInRelatedTable($scope.selectedTable.columns[j].relatedTo,obj.document[isKey]);                                  
                        obj.set(isKey,reatedObj);
                      }                
                                                                                
                    }                        
                  }
              }
          }
        
          return  obj;
        } 

        function getObjectInRelatedTable(tableName,id){ 
          var obj=new CB.CloudObject(tableName);
          obj.id=id;
          return obj;
        }

        function assignToListOfPointedTable(tableName,objectId,columnName,objAssignable){         

            var q=$q.defer();
            cloudQueryById(objectId,tableName).then(function(cloudObject){              
               console.log(cloudObject);             
              var list=cloudObject.document[columnName];
              if(!list){
                var list=[];                 
              }
              list.push(objAssignable);

              cloudObject.set(columnName,list);   
              //save cloud object
              cloudObject.save()
              .then(function(newObj){
                console.log(newObj);
                q.resolve(newObj); 
              },function(error){ 
                console.log(error); 
                q.reject(error);       
              });

            }, function(err){
                q.reject(error);               
                $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                });
          });    

            return  q.promise;
        }   


        function removeRelationInTable(idToBeRemoved,tableName,objectId,columnName){
            var q=$q.defer();
            cloudQueryById(objectId,tableName).then(function(cloudObject){              
              console.log(cloudObject);
              var list=cloudObject.document[columnName];
              if(list.length>0){
                for(var i=0;i<list.length;++i){
                  if(list[i].id==idToBeRemoved){
                    list.splice(i,1);
                  }
                }
                
              }
              cloudObject.set(columnName,list);  
              //save cloud object
              cloudObject.save()
              .then(function(newObj){             
                q.resolve(newObj); 
              },function(error){                
                q.reject(error);       
              });

            }, function(err){
                q.reject(error);               
                $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                });
            });    

            return  q.promise;
        } 


        function cloudQueryById(objectId,tableName){
            var q=$q.defer();
            query = new CB.CloudQuery(tableName);
            query.get(objectId,{success : function(cloudObject){
                q.resolve(cloudObject);
            }, error : function(error){
                q.reject(error);         
            }});
          return  q.promise;
        }

        function getPage(){
          var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
          //do a cloudQuery.
          query = new CB.CloudQuery($scope.selectedTable.name);          
          query.setSkip(firstRow);
          query.setLimit(paginationOptions.pageSize);

          switch(paginationOptions.sort) {
            case uiGridConstants.ASC:
              //asc
             query.orderByAsc('createdAt');
              break;
            case uiGridConstants.DESC:
              //desc
              query.orderByDesc('createdAt');
              break;
            default:
              query.orderByDesc('createdAt');
              break;
          }            
        
          query.find({success : function(list){
            //this is a list of CLoudObjects.          
            $scope.displayed=list;
            $scope.displayDocument=[];

            for(var i=0;i<list.length;++i){   

             var createdDateFormated=formatDate(list[i].document.createdAt);
              list[i].document.createdAt=createdDateFormated;

              var updatedDateFormated=formatDate(list[i].document.updatedAt);
              list[i].document.updatedAt=updatedDateFormated;

              if(!list[i].document._isSearchable){
                  list[i].document._isSearchable=false;
              }
              $scope.displayDocument.push(list[i].document);
            }  

            $scope.gridOptions.data=[];
            $scope.gridOptions.data=$scope.displayDocument;
            $scope.$digest();

          }, error : function(error){             
              $.gritter.add({
                  position: 'top-right',
                  title: 'Opps! something went wrong',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
              });
          }});
      }

      function loadGrid(list,count){
           
                paginationOptions.totalItems = count;

                //grid column definition             
                $scope.colNames=[];
                for(var i=0;i<$scope.selectedTable.columns.length;++i){
                  $scope.colNames.push(configureColumn($scope.selectedTable.columns[i]));
                }                

                //this is a list of CLoudObjects.          
                //grid actual data             
                $scope.displayed=list;
                $scope.displayDocument=[];                
                if($scope.displayed){
                  for(var i=0;i<$scope.displayed.length;++i){
                    if($scope.displayed[i]){
                      $scope.displayed[i]=configureCloudData($scope.displayed[i]);                  
                      $scope.displayDocument.push($scope.displayed[i].document);
                    }else{                      
                      $scope.displayed.splice(i,1);
                    }              
                  }               
                }
                //Making grid
                $scope.gridOptions ={
                  data:$scope.displayDocument,
                  enableSorting:true,
                  columnDefs:$scope.colNames,               
                  enableCellEditOnFocus:true,
                  enableRowSelection:true,
                  enableSelectAll:true,
                  multiSelect:true,
                  enablePagination:true,
                  enablePaginationControls:true                                                                
                } 

                $scope.gridApi.grid.options.useExternalPagination=true;            
                $scope.gridApi.grid.options.paginationPageSize=paginationOptions.pageSize;
                $scope.gridApi.grid.options.paginationPageSizes=paginationOptions.pageSizes;
                $scope.gridApi.grid.options.totalItems=paginationOptions.totalItems;           

                $scope.isRefreshed = false;
                $rootScope.dataLoading=false;          
          
      }

      function configureColumn(columnObj){

          var colDataType=columnObj.dataType;
          var colName=columnObj.name; 

          var colFieldName=colName;
          var colWidth='190';
          var colVisibility=true;
          var cellEdit=true;
          var cellTemplate=null;
          var enableCellEditOnFocus=true;
          var editableCellTemplate=null;
          var enableSorting= true; 
          var enableColumnResizing=true; 
          var cellFilter=null;         

          //Id
          if(colName=="id"){
            colWidth='200';                   
            cellEdit=false;                  
            enableSorting=false;
            colFieldName="_id";  
          }              

          //Boolean
          if(colDataType=="Boolean"){
            cellEdit=false;
            enableSorting=false;
            colWidth='100';
            cellTemplate='<div><switch id="enabled" name="enabled" ng-change="grid.appScope.saveCloudObject(null,row,null)" style="margin-top:3px;margin-left:3px;" class="blue"  ng-model="row.entity[col.field]"></switch></div>';
            
          }

          //Search
          if(colName=="isSearchable"){
            colFieldName="_isSearchable";
            colWidth='190'; 
          }

          //Date
          if(colDataType=="Date"){
            cellEdit=false;
            colWidth='220';
            cellFilter="date : 'longDate'";
            cellTemplate="<div><input kendo-date-picker  ng-change='grid.appScope.saveCloudObject(null,row,null)' style='width:100%' placeholder='yyyy-MM-dd' ng-model='row.entity[col.field]'/></div>";                   
          }

          //DateTime
          if(colDataType=="DateTime"){         
            colWidth='220';
            cellEdit=true;            
            cellFilter="date : 'MM/dd/yyyy h:mma'";
            cellTemplate="<div><span style='margin-left:4px;'>{{row.entity[col.field] | date:'MM/dd/yyyy h:mma'}}</span></div>"
            if(colName=="updatedAt"){
              cellEdit=false;
            }            
            editableCellTemplate='<div><input  kendo-date-time-picker  style="width:100%"  datetime-directive ng-class="\'colt\' + col.index" ng-input="COL_FIELD"  ng-model="MODEL_COL_FIELD"/></div>'; 
          }

          //ACL 
          if(colDataType=="ACL"){
            enableSorting=false;
            colWidth='115';
            cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.editJSON(row,col.field)'><i class='fa fa-shield' style='margin-right:4px;'></i>Permissions</a></div>";
            cellEdit=false;                  
          }

          //Object
          if(colDataType=="Object"){
            enableSorting=false;
            colWidth='115';
            cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.editJSON(row,col.field)'><i class='fa fa-adjust' style='margin-right:4px;'></i>View Object</a></div>";
            cellEdit=false;                  
          }

          //List
          if(colDataType=="List"){
            enableSorting=false;                   
            cellTemplate="<div><a class='btn btn-sm btn-default' ng-show='row.entity._id' ng-click='grid.appScope.viewList(row,col.field)'><i class='fa fa-bars' style='margin-right:4px;'></i>View List</a><p ng-show='!row.entity._id' style='margin-left:7px;'>null</p></div>";
            cellEdit=false;                  
          }

          //Relation
          if(colDataType=="Relation"){
            enableSorting=false;                               
            cellTemplate="<div><a ng-show='row.entity[col.field].id' class='btn btn-sm btn-default' ng-click='grid.appScope.viewRelation(row,col.field)'><i class='fa fa-chevron-circle-right' style='margin-right:4px;'></i>{{row.entity[col.field].id}}</a><p ng-show='!row.entity[col.field].id' style='margin-left:7px;'>null</p></div>";
            cellEdit=true;
            editableCellTemplate='<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD.id" ui-grid-editor ng-model="MODEL_COL_FIELD.id" />';                  
          }

          //File
          if(colDataType=="File"){
            enableSorting=false;                               
            cellTemplate="<div><a  ng-show='row.entity[col.field]'  class='btn btn-sm btn-default'  ng-click='grid.appScope.fileDownload(row,col.field)'><i class='fa fa-file' style='margin-right:4px;'></i>{{row.entity[col.field].name}}</a><p ng-show='!row.entity[col.field]' style='margin-left:7px;'>null</p></div>";
            cellEdit=true;
            editableCellTemplate='<input type="file"  id="file_upload" fileupload  ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="MODEL_COL_FIELD">'; 
          }

          colName=colName+"("+colDataType+")"; 

          var colDefObj={ 
            displayName:colName,               
            field:colFieldName,
            name:colName,
            type:colDataType,
            cellFilter:cellFilter,
            visible:colVisibility,                  
            width:colWidth,
            maxWidth:300,
            minWidth:60,
            enableCellEdit:cellEdit,
            enableCellEditOnFocus:enableCellEditOnFocus,
            enableSorting:enableSorting, 
            cellTemplate:cellTemplate,
            editableCellTemplate:editableCellTemplate,
            enableColumnResizing:enableColumnResizing
          }; 


          return colDefObj;         

      }  

      $scope.fileDownload=function(row,gridColumnName){
        $timeout(function () {
            if($scope.cellEditing) {
              window.location=row.entity[gridColumnName].url;              
            }       
        }, 500);
                
      };  
            

      function configureCloudData(data){
        if(data){
            //for Searchable
          if(!data._isSearchable){
              data._isSearchable=false;
          }   

          //for Relation
          for(var j=0;j<$scope.colNames.length;++j){

            if($scope.colNames[j].type=="Relation"){    
              $scope.colNames[j].cellTemplate="<div><a ng-show='row.entity[col.field].id' class='btn btn-sm btn-default' ng-click='grid.appScope.viewRelation(row,col.field)'><i class='fa fa-chevron-circle-right' style='margin-right:4px;'></i>{{row.entity[col.field].id}}</a><p ng-show='!row.entity[col.field].id' style='margin-left:7px;'>null</p></div>";             
                                          
            }

            if($scope.colNames[j].type=="List"){
              $scope.colNames[j].cellTemplate="<div><a class='btn btn-sm btn-default' ng-show='row.entity._id' ng-click='grid.appScope.viewList(row,col.field)'><i class='fa fa-bars' style='margin-right:4px;'></i>View List</a><p ng-show='!row.entity.style' _id='margin-left:7px;'>null</p></div>";
            }

            if($scope.colNames[j].type=="File"){    
              $scope.colNames[j].cellTemplate="<div><a  ng-show='row.entity[col.field]'  class='btn btn-sm btn-default' ng-click='grid.appScope.fileDownload(row,col.field)'><i class='fa fa-file' style='margin-right:4px;'></i>{{row.entity[col.field].name}}</a><p ng-show='!row.entity[col.field]' style='margin-left:7px;'>null</p></div>";             
                                              
            }       

          }
        }    

        return data;

      } 

      function deleteUnsavedRows(selectedRows){  
            for(var i=0;i<selectedRows.length;++i){
                if(!selectedRows[i]._id){
                    var index=$scope.gridOptions.data.indexOf(selectedRows[i]);
                    $scope.displayed.splice(index,1);
                    $scope.displayDocument.splice(index,1); 
                }
            }      
      }      
});
 