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
      tableService) {
       
      var id;
      var isAppLoaded = false;
      var query = null;

      $scope.displayed = []; //this is an array of objects which are showed on the table.

      $scope.initialize = function() {
          $scope.dataBrowserCss="activeMenu";
          $scope.id = $stateParams.appId;
          id = $scope.id;      
          loadProject(id);
          
      };

      $scope.selectAllEntities = function(){
          $scope.selectAll = true;

          for(var i=0;i<$scope.selectedEntities.length;i++){
              $scope.selectedEntities[i] = true;
          }
      };

      $scope.callServer = function (tableState) {

        $scope.isLoading = true;

        var pagination = tableState.pagination;

        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
        var number = pagination.number || 10;  // Number of entries showed per page.

        //do a cloudQuery. 
        query = new CB.CloudQuery($scope.selectedTable.name);
        query.setSkip(start);
        query.setLimit(number);

        if(tableState.sort && tableState.sort.predicate){
           if(tableState.sort.reverse){
            //desc
            query.orderByDesc(tableState.sort.predicate);
           }else{
             //asc
             query.orderByAsc(tableState.sort.predicate);
           }

        }else{
          query.orderByDesc('createdAt');
        }

        
        query.find({success : function(list){
          //this is a list of CLoudObjects.
          $scope.displayed = list;
          $scope.selectedEntities = [];
          $scope.entityEditMode = [];
          $scope.entityEditLoadingMode = [];
          $scope.entityDeleteMode = [];
          $scope.entityDeleteLoadingMode = [];

          for(var i=0;i<list.length;i++){
              $scope.selectedEntities[i] = false;
          }

          $scope.isLoading = false;
          tableState.pagination.numberOfPages = 10; //TODO : Work on this.
          $scope.$digest();

        }, error : function(error){
            Messenger().post({
              message: 'We cannot load your data at this point in time. Please try again later.',
              type: 'error',
              showCloseButton: true
            });
        }});
      
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

      $scope.switchEditMode = function(index){
          if($scope.entityEditMode[index]){
            
            //save the object.  
            $scope.entityEditLoadingMode[index] = true;
            var obj = $scope.displayed[index];

            //save the object.
            obj.save().then(function(newObj){
               $scope.entityEditLoadingMode[index] = false;
               $scope.entityEditMode[index] = false;
               $scope.displayed[index] = newObj;
               $scope.$digest();

            }, function(error){
               Messenger().post({
                message: 'Cannot save this object at this point in time. Please try again later.',
                type: 'error',
                showCloseButton: true
              });
               $scope.entityEditLoadingMode[index] = false;
               $scope.entityEditMode[index] = false;
               $scope.$digest();
            });

          }else{
            $scope.entityEditMode[index] = true;
          }
      };

      $scope.switchDeleteMode = function(index){
          if(!$scope.entityDeleteMode[index]){
            
            //save the object.  
            $scope.entityDeleteLoadingMode[index] = true;
            var obj = $scope.displayed[index];

            //save the object.
            obj.delete().then(function(){

               $scope.entityDeleteLoadingMode[index] = false;
               $scope.entityDeleteMode[index] = false;
               $scope.displayed.splice($scope.displayed.indexOf(obj),1);
               $scope.$digest();

            }, function(error){

               Messenger().post({
                message: 'Cannot dleete this object at this point in time. Please try again later.',
                type: 'error',
                showCloseButton: true
              });

               $scope.entityDeleteLoadingMode[index] = false;
               $scope.entityDeleteMode[index] = false;
               $scope.$digest();

            });

          }else{
            $scope.entityDeleteMode[index] = true;
          }
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
            query.setSkip(0);
            query.setLimit(10);
            query.orderByDesc('createdAt');
            query.find({success : function(list){
              //this is a list of CLoudObjects.
              $scope.displayed = list;
              $scope.isLoading = false;
              $scope.$digest();

            }, error : function(error){
                Messenger().post({
                  message: 'We cannot load your data at this point in time. Please try again later.',
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
              $scope.isLoading = false;
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
               $scope.displayed = list;
                $scope.isLoading = false;
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

        //make it editable. 
        $scope.selectedEntities[$scope.displayed.length-1] = null;
        $scope.switchEditMode($scope.displayed.length-1);

        //window.scrollBy(0,900);
        //Updating Scrollbar
        $scope.$emit('content.changed');
      }; 

      $scope.deleteRow=function(){
        
        //delete first. 
        var temp = angular.copy($scope.displayed);
        $scope.displayed = [];

        for(var i=0;i<temp.length;i++){          
          if($scope.selectedEntities[i]){
             temp[i].delete();
          }else{
            $scope.displayed.push(temp[i]);
          }            
        }


      };

      $scope.refresh = function(){
        $scope.selectTable($scope.selectedTable);
      };

      $scope.selectAllEntities  = function(){
        if(!$scope.displayed)
          return;

        if($scope.selectAll)
          $scope.selectAll = false;
        else
          $scope.selectAll = true;
        
        var length = $scope.displayed.length;

        for(var i=0;i<length; i++){
          if($scope.selectAll)
            $scope.selectedEntities[i] = "checked";
          else
            $scope.selectedEntities[i] = null;
        }

      }; 

      $scope.editJSON=function(obj, colName){  

        $scope.editableObject = obj;
        $scope.jsonObjColumnName = colName;
        $scope.jsonObj=obj.get(colName);
        $('#jsonModal').modal('show');

      };

      $scope.saveObjectChanges = function(){
        $scope.editableObject.set($scope.jsonObjColumnName, $scope.jsonObj);
        $scope.jsonObj = null;
        $scope.editableObject = null;
        $scope.jsonObjColumnName = null;
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


      $scope.checkAll=function(checkall){
        $scope.checkall=checkall;
        var tableLength=$scope.tableData[$scope.selectedTable.name].length;
        for(var i=0;i<tableLength;++i){           
          $scope.rowChecked[i]=checkall;
        }
      };  

      $scope.sortColumn=function(columnName,status){        
        $scope.predicate=columnName;
        $scope.reverse=status;        
      }; 

});
 