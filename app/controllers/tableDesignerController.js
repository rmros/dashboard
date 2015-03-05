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
       tableService) {
      
        var id;
        
        $scope.initialize = function() {

            $scope.tableDesignerCss="activeMenu";
            $scope.showSaveBtn=true;                        
            $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();
            $scope.id = $stateParams.appId;
            id = $scope.id;

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

        $scope.renameTable = function(t) {
            var elem = document.getElementById(t.id + "name");
            elem.removeAttribute("disabled");
            $scope.initialTableName = t.name;
            elem.value = "";
            elem.focus();
        };

        $scope.canChangeDatatype = function(col){
            if(!col.isEditable){
                Messenger().post({
                  message: 'This column is not editable. You cannot change the datatype.',
                  type: 'error',
                  showCloseButton: true
                });
            }

            if(col.saved){
                 Messenger().post({
                  message: 'You cant change the datatype of a column which is already saved',
                  type: 'error',
                  showCloseButton: true
                });
            }
        };

        $scope.canChangeRequired = function(col){
            if(!col.isEditable){
                Messenger().post({
                  message: 'This column is not editable.',
                  type: 'error',
                  showCloseButton: true
                });
            }

            if(col.saved && !col.required){
                 Messenger().post({
                  message: 'You cant change the required after column is saved.',
                  type: 'error',
                  showCloseButton: true
                });
            }
        };

        $scope.canChangeUnique = function(col){
            if(!col.isEditable){
                Messenger().post({
                  message: 'This column is not editable.',
                  type: 'error',
                  showCloseButton: true
                });
            }

            if(col.saved && !col.unique){
                 Messenger().post({
                  message: 'You cant change the required of a column after it is saved.',
                  type: 'error',
                  showCloseButton: true
                });
            }
        };

        $scope.tableRenamed = function(t,isError) {
          var elem = document.getElementById(t.id + "name");
          if(isError){
            elem.value = $scope.initialTableName;
            t.name= $scope.initialTableName;
            $scope.tableErrorForEdit=null;
          }else{
            if (elem.value == '')
                elem.value = $scope.initialTableName;
                elem.setAttribute("disabled", true);
          }

        };

        $scope.deleteTable = function(t) {
            if ($scope.selectedTable == t)
                $scope.selectedTable = undefined;
            var i = $rootScope.currentProject.tables.indexOf(t);
            $rootScope.currentProject.tables.splice(i, 1);

            if(!$rootScope.currentProject.deletedTables)
              $rootScope.currentProject.deletedTables = [];

            $rootScope.currentProject.deletedTables.push(t);
        };


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
                        table.columns[i].relatedTo=relTable.id;                       
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
                           
              }
            //End of creating table  
            
        } 

        $scope.renameCol = function(col) {
            var elem = document.getElementById(col.id + "column");
            $scope.initialColName = col.name;
            elem.value = "";
            elem.focus();
        };

        $scope.colRenamed = function(col,isError) {
          var elem = document.getElementById(col.id + "column");
          if(isError){
              elem.value = $scope.initialColName;
              col.name=$scope.initialColName;
              $scope.columnErrorForEdit=null;
          }
          else{
            if (elem.value == '')
                elem.value = $scope.initialColName;
          }

        };

        $scope.deleteCol = function(col) {
            var i = $scope.selectedTable.columns.indexOf(col);
            $scope.selectedTable.columns.splice(i, 1);
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

             Messenger().post({
                          message: 'Please add tables before you Save.',
                          type: 'error',
                          showCloseButton: true
              });

          }else{

            $q.all(promises).then(
                     function(){

                          $scope.showSaveBtn=true;

                          Messenger().post({
                            message: 'We have saved your tables.',
                            type: 'success',
                            showCloseButton: true
                          });
                     },
                     function(error){

                        $scope.showSaveBtn=true;

                        Messenger().post({
                          message:"We're sorry, We cant save your tables at this point in time. Please try again later.",
                          type: 'error',
                          showCloseButton: true
                        });

                     }
                   );
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
                             $rootScope.currentProject.tables=[];
                          }     
                          else if(data){
                              $rootScope.currentProject.tables=data;
                              $scope.selectTable($rootScope.currentProject.tables[0]);
                          }else{                                              
                             $rootScope.currentProject.tables=[];
                          }          
                         
                     }, function(error){
                          Messenger().post({
                            message: 'We cannot load your tables at this point in time. Please try again later.',
                            type: 'error',
                            showCloseButton: true
                          });
                     });
        }
    });
