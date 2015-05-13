'use strict';

app.controller('tableDesignerController',
      function($scope,
       $rootScope,
       $location,
       $stateParams,
       $q,
       utilityService,
       tableTypeService,
       columnDataTypeService,
       tableErrorService,
       projectService,
       tableService,
       $timeout,
       $state) {
      
        var id;
        var tableId;
        
        $scope.initialize = function() {
            $rootScope.page='tableDesigner';
            $rootScope.dataLoading=true;                                 
            $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();       
            id = $stateParams.appId;
            tableId= $stateParams.tableId;               

            if($rootScope.currentProject && $rootScope.currentProject.appId === id){
              //if the same project is already in the rootScope, then dont load it. 
              getProjectTables();              
            }else{
              loadProject(id);              
            }            

        };

        $scope.selectTable = function(t) {
            $scope.selectedTable = t;          
        };      

        $scope.canChangeDatatype = function(col){
            if(!col.isEditable){
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'This column is not editable. You cannot change the datatype.',
                    class_name: 'prusia'
                });
            }

            if(col.saved){ 
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'You cant change the datatype of a column which is already saved',
                    class_name: 'prusia'
                }); 
            }
        };

        $scope.canChangeRequired = function(col){
            if(!col.isEditable){               
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'This column is not editable.',
                    class_name: 'prusia'
                });
            }

            if(col.saved && !col.required){
                
                 $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'You cant change the required after column is saved.',
                    class_name: 'prusia'
                }); 
            }
        };

        $scope.canChangeUnique = function(col){
            if(!col.isEditable){
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'This column is not editable.',
                    class_name: 'prusia'
                });
            }

            if(col.saved && !col.unique){
                
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'You cant change the required of a column after it is saved.',
                    class_name: 'prusia'
                }); 
            }
        };
        

        $scope.deleteTableModal=function(t){
          $scope.selectedTable == t;
          $scope.confirmTableName=null;
          $('#md-deleteTable').modal('show');
        }

        $scope.deleteTable = function(t) {
           if ($scope.confirmTableName === null) {
              $scope.confirmTableName=null; 
              $('#md-deleteTable').modal("hide");
              $.gritter.add({
                  position: 'top-right',
                  title: 'Warning',
                  text: 'Table name you entered was empty.',
                  class_name: 'prusia'
              }); 
                        
            } else if($scope.confirmTableName === t.name){

              if($scope.selectedTable == t)
              $scope.selectedTable = undefined;
            
              var i = $rootScope.currentProject.tables.indexOf(t);
              $rootScope.currentProject.tables.splice(i, 1);

              if(!$rootScope.currentProject.deletedTables)
                  $rootScope.currentProject.deletedTables = [];

              $rootScope.currentProject.deletedTables.push(t);            

              $('#md-deleteTable').modal("hide");
              $scope.saveTables();
              $scope.confirmTableName=null;
            }else{  
                $scope.confirmTableName=null;
                $('#md-deleteTable').modal("hide");               
                $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'Table name doesnot match.',
                    class_name: 'prusia'
                });         
            }        
                        
        };

        /*function deleteRelatedTableFirst(table){
            for(var i=0;i<$rootScope.currentProject.tables.length;++i){              
                var isThere=_.first(_.where($rootScope.currentProject.tables[i].columns, {relatedTo:table.name}));                          
                if(isThere){
                  deleteRelatedTableFirst($rootScope.currentProject.tables[i]);
                }
            }

            var i = $rootScope.currentProject.tables.indexOf(table);
            $rootScope.currentProject.tables.splice(i, 1);

            if(!$rootScope.currentProject.deletedTables)
                $rootScope.currentProject.deletedTables = [];

            $rootScope.currentProject.deletedTables.push(table);
        }*/


        $scope.checkMaxCount=function(tableType){
            //this is a filter.
            var count = 0;

            for(var i=0;i<$rootScope.currentProject.tables.length; i++){
                if($rootScope.currentProject.tables[i].type.type === tableType.type){
                  count++;
                }
            }

            if(count < tableType.maxCount){
              return tableType;
            }

            return null;
        };

        $scope.initiateTableSettings=function(){
            $scope.tableTypes = tableTypeService.getTableTypes();
            $scope.newTableType = "custom";
            $scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:'custom'}));
            $scope.tableError=null;

            var tableName="Custom";
            var incrementor=0;
            (function iterator(i) {
                    $scope.checkErrorsForCreate(tableName,$rootScope.currentProject.tables,"table");
                    if($scope.tableErrorForCreate){
                        ++incrementor;
                        tableName="Custom"+incrementor;
                        iterator(i+1);
                    }
            })(0);
            $scope.newTableName = tableName;
            $('.bs-modal-add-table').modal();

        };


      $scope.selectType=function(newTableType){
          $scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:newTableType}));
          $scope.newTableName = angular.copy($scope.selectedTableType.name);

      };

      $scope.addNewTable = function() {
          var tableTypeObj=_.first(_.where($scope.tableTypes, {type:$scope.newTableType}));
          getRelatedTables(tableTypeObj); 
          $scope.saveTables();
      };    

       function getRelatedTables(table){  

            for(var i=0;i<table.columns.length;++i){
                if(table.columns[i].relatedToType){
                  var relatedToTypeObj=_.first(_.where($scope.tableTypes, {type:table.columns[i].relatedToType})); 
                  getRelatedTables(relatedToTypeObj);
                }      
            }
            var tableName;
            var alreadyExist;
            if(table.isRenamable){
                  tableName=$scope.newTableName;
                  alreadyExist=_.first(_.where($rootScope.currentProject.tables, {name:tableName}));
            }else{
                  tableName=table.name;
                  alreadyExist=_.first(_.where($rootScope.currentProject.tables, {name:table.name}));
            } 
            
             //creating table             
              if(!alreadyExist){

                  for(var i=0;i<table.columns.length;++i){
                      if(table.columns[i].relatedToType){
                        var getTable=_.first(_.where($scope.tableTypes, {type:table.columns[i].relatedToType})); 
                        var relTable=_.first(_.where($rootScope.currentProject.tables, {name:getTable.name})); 
                        table.columns[i].relatedTo=relTable.name;                       
                      }      
                  }
                  
                  var columnArray=angular.copy(table.columns);
                  var uniqueId=utilityService.makeId();
                  var t = {
                          id: uniqueId,
                        name: tableName,
                        type: table,
                     columns: columnArray
                    };
                  
                    $rootScope.currentProject.tables.push(t);
                    $scope.selectTable(t);
                    $scope.newTableName = ''; 

                    if($rootScope.currentProject.tables.length==1){
                        $.gritter.add({
                          position: 'top-right',
                          title: 'Great!',
                          text: 'Your first table is created. See our docs to build apps.',
                          class_name: 'success'
                      });
                    }
                           
              }
          //End of creating table  
            
        } 


            

        $scope.deleteCol = function(col) {
            if(col.isDeletable){
              var i = $scope.selectedTable.columns.indexOf(col);
              $scope.selectedTable.columns.splice(i, 1);
              $scope.saveTables();
            }else{
               $.gritter.add({
                    position: 'top-right',
                    title: 'Warning',
                    text: 'This column is not deletable. You cannot delete.',
                    class_name: 'prusia'
                });
            }            
        };

        $scope.addColumn = function() {
          var newColName="newColumn";
          var incrementor=0;
          (function iterator(i) {
                  $scope.checkErrorsForCreate(newColName,$scope.selectedTable.columns,"column");
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

                var i = $scope.selectedTable.columns.push(newcol);
                $scope.saveTables();


        };

        //Table Errors
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

        }

        $scope.checkErrorsForEdit=function(tableName,thisObj,arrayList,type){
            var result=tableErrorService.checkErrorsForEdit(tableName,thisObj,arrayList,type);
            if(result){
                  if(type=="table"){
                      $scope.tableErrorForEdit=result;
                  }
                  if(type=="column"){
                      $scope.columnErrorForEdit=result;
                  }

            }else{
              $scope.tableErrorForEdit=null;
              $scope.columnErrorForEdit=null;
            }

        };

         $scope.saveTables=function(){

          $scope.showSaveBtn=false;

          var promises = [];

          if($rootScope.currentProject.tables.length>0){
              promises.push(tableService.saveTables($rootScope.currentProject.appId, $rootScope.currentProject.tables));
          }

          if($rootScope.currentProject.deletedTables && $rootScope.currentProject.deletedTables.length>0){
            promises.push(tableService.deleteTables($rootScope.currentProject.appId, $rootScope.currentProject.deletedTables));
          }

          if($rootScope.currentProject.tables.length===0 && (!$rootScope.currentProject.deletedTables || !$rootScope.currentProject.deletedTables.length)){
            $scope.showSaveBtn=true;
             
              $.gritter.add({
                  position: 'top-right',
                  title: 'Warning',
                  text: 'Please add tables before you Save.',
                  class_name: 'prusia'
              });

          }else{

            $q.all(promises).then(
               function(){
                  //tables got saved               
               },
               function(error){
                  $.gritter.add({
                      position: 'top-right',
                      title: 'Opps! something went wrong',
                      text: "We're sorry, We cant save your tables at this point in time. Please try again later.",
                      class_name: 'danger'
                  });

               }
             );
          }

        };


        $scope.filterDataType=function(dataTypeObj){
          if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation"){
            return dataTypeObj;
          }
        };
        
            
        /* PRIVATE FUNCTIONS */

        function loadProject(id){

            projectService.getProject(id).then(
                     function(currentProject){
                          if(currentProject){
                            $rootScope.currentProject=currentProject;
                            getProjectTables();
                          }                              
                     },
                     function(error){
                         
                        $.gritter.add({
                            position: 'top-right',
                            title: 'Opps! something went wrong',
                            text: "We cannot load your project at this point in time. Please try again later.",
                            class_name: 'danger'
                        });
                     }
                   );
        }

        function getProjectTables(){

           tableService.getProjectTables($rootScope.currentProject).then(
               function(data){
                    if(!data){
                      $rootScope.dataLoading=false;
                      $rootScope.currentProject.tables=[];                       
                    }     
                    else if(data){
                        $rootScope.dataLoading=false;
                        $rootScope.currentProject.tables=data;
                        
                        if(tableId){
                          var tableObj=_.first(_.where($rootScope.currentProject.tables, {name:tableId}));
                          if(tableObj){
                            $scope.selectTable(tableObj);
                          }else{
                            $scope.selectTable($rootScope.currentProject.tables[0]); 
                          }                          
                        }else{
                          $scope.selectTable($rootScope.currentProject.tables[0]); 
                        }                          

                    }else{ 
                       $rootScope.dataLoading=false;                                             
                       $rootScope.currentProject.tables=[];
                    }          
                   
               }, function(error){ 
                    $rootScope.dataLoading=false;                         
                    $.gritter.add({
                      position: 'top-right',
                      title: 'Opps! something went wrong',
                      text: "We cannot load your tables at this point in time. Please try again later.",
                      class_name: 'danger'
                    });
               });
        }   
  


});
