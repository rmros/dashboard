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
      DTOptionsBuilder,
      DTColumnBuilder,
      DTColumnDefBuilder,
      $resource,
      $timeout,
      $filter,
      uiGridConstants) {
       
      var id;
      var tableId;
      var isAppLoaded = false;
      $scope.isRefreshed = false;

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
        if(list && list.length>0 && !isStaticType){
            var tableName = list[0].document._tableName; 
            var table =  _.first(_.where($rootScope.currentProject.currentTables, {name : tableName}));
            $scope.selectTable(table, list);
        }

       if(isStaticType){
          $scope.editJSON(row,columnName);
       }

      };

      $scope.viewRelation = function(row, columnName){
        var index=$scope.gridOptions.data.indexOf(row.entity);
        var obj = $scope.displayed[index];
        var obj = obj.get(columnName);
        if(obj){
          var tableName = obj.document._tableName; 
          var table =  _.first(_.where($rootScope.currentProject.currentTables, {name : tableName}));
          $scope.selectTable(table, obj);
        }
      };      

      $scope.saveCloudObject = function(saveIndex,gridRow,cloudObject){
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
              for(var ndx=0;ndx<$scope.displayed.length;++ndx){
                  if((cloudObject.document._id &&  $scope.displayed[ndx]._id)&& ($scope.displayed[ndx]._id==cloudObject.document._id)){
                    index=ndx;
                    break;
                  }
              }
              obj=cloudObject;              
            }            

            if(obj.document.$$hashKey){
              delete obj.document.$$hashKey;
            }

            obj.document.createdAt=new Date(obj.document.createdAt).toISOString(); 
            obj.document.updatedAt=new Date(obj.document.updatedAt).toISOString(); 

            //save the object.
            obj.save().then(function(newObj){
               console.log(newObj);              
               $scope.displayed[index]=newObj;
               $scope.displayDocument[index]=newObj.document;
               $scope.gridOptions.data[index]=newObj.document;
               $scope.$digest();

            }, function(error){               
               $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
                  text: 'Cannot save this object at this point in time. Please try again later.',
                  class_name: 'danger'
                });              
               $scope.$digest();
            });

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
              for(var ndx=0;ndx<$scope.displayed.length;++ndx){
                  if((cloudObject.document._id &&  $scope.displayed[ndx]._id)&& ($scope.displayed[ndx]._id==cloudObject.document._id)){
                    index=ndx;
                    break;
                  }
              }              
              obj=cloudObject;              
            }            

            if(obj.document.$$hashKey){
              delete obj.document.$$hashKey;
            }

            //save the object.
            obj.delete().then(function(){             
               
               q.resolve(index);
               $scope.$digest();

            }, function(error){              
              $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
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

        $scope.displayed = []; //empty the list
        $scope.selectedTable = t; 
        $scope.isLoading = true;     

        if(!obj){
            //load the list for the first time.
            query = new CB.CloudQuery($scope.selectedTable.name);
            query.setSkip(paginationOptions.pageNumber-1);
            query.setLimit(paginationOptions.pageSize);
            query.orderByDesc('createdAt');
            query.find({success : function(list){         
                    loadGrid(list);         
                    $scope.$digest();                             

            }, error : function(error){                
                $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
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
              $scope.displayed.push(cloudObject);
              loadGrid($scope.displayed);            
              $scope.$digest();

            }, error : function(error){               
                $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                });
            }});       
          }

          if(obj instanceof Array){
            var promises = []; 

            for(var i=0;i<obj.length; i++){
              //load the list for the first time. 
              query = new CB.CloudQuery($scope.selectedTable.name);
              promises.push(query.get(obj[i].id));
            }

            $q.all(promises).then(function(list){               
               loadGrid(list);     
               $scope.$digest();
            }, function(){                
                $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
                }); 
            });  
          }
          
      };


      $scope.addRow=function(){
        var obj = new CB.CloudObject($scope.selectedTable.name);
        obj.set('createdAt', new Date());
        obj.set('updatedAt', new Date());
        $scope.displayed.push(obj);
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

          $q.all(promiseArray).then(function(deletedIndexes){                

              for(var i=0;i<deletedIndexes.length;++i){                     

                 $scope.displayed.splice(deletedIndexes[i],1);
                 $scope.displayDocument.splice(deletedIndexes[i],1);                       
              }
              $scope.$digest();

          }, function(err){
              $.gritter.add({
                  position: 'top-right',
                  title: 'Error',
                  text: 'Cannot delete this object at this point in time. Please try again later.',
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
        $scope.jsonObj=obj.get(colName);
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

           //After cell edit 
           $scope.gridApi.edit.on.afterCellEdit($scope,function(rowEntity,colDef, newValue, oldValue){                          
              var rowIndex=$scope.gridOptions.data.indexOf(rowEntity);             
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
                        title: 'Error',
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
                        title: 'Error',
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
                  title: 'Error',
                  text: 'We cannot load your data at this point in time. Please try again later.',
                  class_name: 'danger'
              });
          }});
      }

      function loadGrid(list){
            //count no objects
            query = new CB.CloudQuery($scope.selectedTable.name);          
            query.count({ success: function(count){
                paginationOptions.totalItems = count;

                //grid column definition             
                $scope.colNames=[];
                for(var i=0;i<$scope.selectedTable.columns.length;++i){
                  var colDataType=$scope.selectedTable.columns[i].dataType;
                  var colName=$scope.selectedTable.columns[i].name; 

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
                    cellFilter="convertIsoToDate | date : 'longDate'";
                    cellTemplate="<div><input kendo-date-picker ng-change='grid.appScope.saveCloudObject(null,row,null)' style='width:100%' placeholder='yyyy-MM-dd' ng-model='row.entity[col.field]'/></div>";                   
                  }

                  //DateTime
                  if(colDataType=="DateTime"){
                    cellEdit=false;
                    colWidth='220';
                    cellFilter="convertIsoToDate | date : 'medium'";
                    cellTemplate='<div><input  kendo-date-time-picker style="width:100%" ng-change="grid.appScope.saveCloudObject(null,row,null)" placeholder="yyyy-MM-dd"  ng-model="row.entity[col.field]"/></div>'; 
                  }

                  //ACL & Object
                  if(colDataType=="ACL" || colDataType=="Object"){
                    enableSorting=false;
                    colWidth='100';
                    cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.editJSON(row,col.field)'><i class='fa fa-ellipsis-h'></i></a></div>";
                    cellEdit=false;                  
                  }

                  //List
                  if(colDataType=="List"){
                    enableSorting=false;
                    colWidth='100';
                    cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.viewList(row,col.field)'><i class='fa fa-bars'></i></a></div>";
                    cellEdit=false;                  
                  }

                  //Relation
                  if(colDataType=="Relation"){
                    enableSorting=false;
                    colWidth='100';
                    cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.viewRelation(row,col.field)'><i class='fa fa-chevron-circle-right'></i></a></div>";
                    cellEdit=false;                  
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
                  $scope.colNames.push(colDefObj);
                }                

                //this is a list of CLoudObjects.          
                //grid actual data             
                $scope.displayed=list;
                $scope.displayDocument=[];
                for(var i=0;i<$scope.displayed.length;++i){  
                  if(!$scope.displayed[i].document._isSearchable){
                      $scope.displayed[i].document._isSearchable=false;
                  }   

                  $scope.displayDocument.push($scope.displayed[i].document);
                }   

                //Making grid
                $scope.gridOptions ={
                  data:$scope.displayDocument,
                  enableSorting:true,
                  columnDefs:$scope.colNames,               
                  enableCellEditOnFocus:enableCellEditOnFocus,
                  enableRowSelection:true,
                  enableSelectAll:true,
                  multiSelect: true,
                  enablePagination:true,
                  enablePaginationControls:true                                                                
                } 

                $scope.gridApi.grid.options.useExternalPagination=true;            
                $scope.gridApi.grid.options.paginationPageSize=paginationOptions.pageSize;
                $scope.gridApi.grid.options.paginationPageSizes=paginationOptions.pageSizes;
                $scope.gridApi.grid.options.totalItems=paginationOptions.totalItems;

                $scope.isRefreshed = false;
                $rootScope.dataLoading=false;
                $scope.$digest();
           },error: function(err) {
           //Error in retrieving the data.
          } });
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
 