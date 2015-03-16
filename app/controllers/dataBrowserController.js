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
      var isAppLoaded = false;
      var query = null;
      var paginationOptions = {
        pageNumber:0,
        pageSize:10,
        sort: null,
        pageSizes:[10,25,50,75]
      };

      $scope.displayed = []; //this is an array of objects which are showed on the table.
      $scope.gridOptions ={};

      $scope.initialize = function() {
          $scope.dataBrowserCss="activeMenu";
          $scope.id = $stateParams.appId;
          id = $scope.id;      
          loadProject(id);          
      };    
      
      $scope.viewList = function(obj, col){

        var columnName = col.name;

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
            $scope.editJSON(obj,col.name);
       }

      };

      $scope.viewRelation = function(obj, columnName){
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
            if(saveIndex>=0){
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

            //save the object.
            obj.save().then(function(newObj){
               console.log(newObj);              
               $scope.displayed[index]=newObj;
               $scope.displayDocument[index]=newObj.document;
               $scope.$digest();

            }, function(error){
               Messenger().post({
                message: 'Cannot save this object at this point in time. Please try again later.',
                type: 'error',
                showCloseButton: true
              });               
               $scope.$digest();
            });

      }; 

      $scope.deleteCloudObject = function(deleteIndex,gridRow,cloudObject){
            var q=$q.defer();

            var index=-1;
            var obj={};

            //index
            if(deleteIndex>=0){
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
               Messenger().post({
                message: 'Cannot delete this object at this point in time. Please try again later.',
                type: 'error',
                showCloseButton: true
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
            query.setSkip(paginationOptions.pageNumber);
            query.setLimit(paginationOptions.pageSize);
            query.orderByDesc('createdAt');
            query.find({success : function(list){         
                    loadGrid(list);         
                    $scope.$digest();                             

            }, error : function(error){
                Messenger().post({
                  message:'We cannot load your data at this point in time. Please try again later.',
                  type: 'error',
                  showCloseButton: true
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
                Messenger().post({
                  message: 'We cannot load your data at this point in time. Please try again later.',
                  type: 'error',
                  showCloseButton: true
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
                Messenger().post({
                  message: 'We cannot load your data at this point in time. Please try again later.',
                  type: 'error',
                  showCloseButton: true
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
        //Disable Selection of new row                              
      }; 

      $scope.deleteRow=function(){                        
        //delete first. 
        var selectedRows=$scope.gridApi.selection.getSelectedRows();
        var row=unSavedRow(selectedRows);
        if(row){
            Messenger().post({
                  message: 'You cannot delete a unsaved row',
                  type: 'error',
                  showCloseButton: true
                });
        }else{

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

                  Messenger().post({
                    message: 'Cannot delete this object at this point in time. Please try again later.',
                    type: 'error',
                    showCloseButton: true
                  });

              });

            }//End of if  

        }//End of main else             

      };

      $scope.refresh = function(){
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
              // find real row                  
              var rowIndex=$scope.gridOptions.data.indexOf(rowEntity);      
              //Save CloudObject
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
                          Messenger().post({
                            message: 'We cannot load your project at this point in time. Please try again later.',
                            type: 'error',
                            showCloseButton: true
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
                                  $scope.selectTable($rootScope.currentProject.currentTables[0]); 
                                }

                                $scope.rowChecked=[];
                            }else{                                              
                               $rootScope.currentProject.currentTables=[];
                            } 
                     }, function(error){
                          Messenger().post({
                            message: 'We cannot load your tables at this point in time. Please try again later.',
                            type: 'error',
                            showCloseButton: true
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
          //do a cloudQuery.
          query = new CB.CloudQuery($scope.selectedTable.name);          
          query.setSkip(paginationOptions.pageNumber);
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

            $scope.gridOptions.data=$scope.displayDocument;
            $scope.$digest();

          }, error : function(error){
              Messenger().post({
                message: 'We cannot load your data at this point in time. Please try again later.',
                type: 'error',
                showCloseButton: true
              });
          }});
      }

      function loadGrid(list){
            //count no objects
            query = new CB.CloudQuery($scope.selectedTable.name);          
            query.count({ success: function(count){
                //grid column names              
                $scope.colNames=[];
                for(var i=0;i<$scope.selectedTable.columns.length;++i){
                  var colDataType=$scope.selectedTable.columns[i].dataType;
                  var colName=$scope.selectedTable.columns[i].name; 

                  var colFieldName=colName;
                  var colWidth='170';
                  var colVisibility=true;
                  var cellEdit=true;
                  var cellTemplate=null;
                  var enableCellEditOnFocus=true;
                  var editableCellTemplate=null;
                  var enableSorting= true; 
                  var enableColumnResizing=true;          

                  //Id
                  if(colName=="id"){
                    colWidth='200';                   
                    cellEdit=false;                  
                    enableSorting=false;
                    colFieldName="_id";  
                  }              

                  //Boolean
                  if(colDataType=="Boolean"){
                    enableSorting=false;
                    colWidth='100';
                    cellTemplate='<div><switch id="enabled" name="enabled" ng-change="grid.appScope.saveCloudObject(null,row,null)" style="margin-top:3px;margin-left:3px;" class="blue"  ng-model="row.entity[col.field]"></switch></div>';
                    
                  }

                  //Search
                  if(colName=="isSearchable"){
                    colFieldName="_isSearchable";
                    colWidth='140'; 
                  }

                  //Date
                  if(colDataType=="Date"){
                     colWidth='220';
                     editableCellTemplate="<div><input kendo-date-picker style='width:100%' placeholder='yyyy-MM-dd'/></div>";                   
                  }

                  //DateTime
                  if(colDataType=="DateTime"){
                     colWidth='220';
                    editableCellTemplate='<div><input  kendo-date-time-picker style="width:100%" placeholder="yyyy-MM-dd"  ui-grid-editor ng-class="\'colt\' + col.index"  ng-input="COL_FIELD"  ng-model="MODEL_COL_FIELD"/></div>'; 
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
                    cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.viewList(row.entity,col)'><i class='fa fa-bars'></i></a></div>";
                    cellEdit=false;                  
                  }

                  //Relation
                  if(colDataType=="Relation"){
                    enableSorting=false;
                    colWidth='100';
                    cellTemplate="<div><a class='btn btn-sm btn-default' ng-click='grid.appScope.viewRelation(row.entity,col.field)'><i class='fa fa-chevron-circle-right'></i></a></div>";
                    cellEdit=false;                  
                  }

                  var colDefObj={ 
                    displayName:colName,               
                    field:colFieldName,
                    name:colName,
                    type:colDataType,
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
                  enablePaginationControls:true,                 
                  paginationPageSizes:paginationOptions.pageSizes,          
                  paginationPageSize:paginationOptions.pageSize,                
                  useExternalPagination: true,
                  totalItems:count,
                  useExternalSorting: true                                                        
                } 
                 $scope.$digest();
           },error: function(err) {
           //Error in retrieving the data.
          } });
      }

      function unSavedRow(selectedRows){                   
            var noIdObject= _.find(selectedRows,function(val){ 
                            if(!val._id){
                              return val;
                            }
                        }); 

            if(noIdObject){
              return noIdObject;
            }
            return null;
      }      
});
 