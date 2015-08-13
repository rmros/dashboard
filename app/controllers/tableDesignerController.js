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
    $scope.newtables=[];
    $scope.addTablePopup=false;
    $rootScope.isFullScreen=false;    
      
    $scope.initialize = function() {
        $rootScope.page='tableDesigner';
        $rootScope.dataLoading=true;                                 
        $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();       
        id = $stateParams.appId;

        if($rootScope.currentProject && $rootScope.currentProject.appId === id){
          //if the same project is already in the rootScope, then dont load it.
          initCB(); 
          getProjectTables();              
        }else{
          loadProject(id);              
        }

        //Start the beacon
        initBeacon();   

    };

    $scope.goToDataBrowser=function(t){
      window.location.href="#/"+id+"/table/"+t.name;        
    };
   
    $scope.deleteTableModal=function(t){
      $scope.selectedTable = t;
      $scope.confirmTableName=null;
      $('#md-deleteTable').modal('show');
    }

    $scope.deleteTable = function(t) {
      if(t.type!='user' && t.type!='role'){
        
        if ($scope.confirmTableName === null) {

          $scope.confirmTableName=null; 
          $('#md-deleteTable').modal("hide");              
          errorNotify('Table name you entered was empty.');            
                    
        } else if($scope.confirmTableName === t.name){            
          $scope.isDeletingTable=true;
          tableService.deleteTable(t)             
          .then(function(tables){        
              if($scope.selectedTable == t)
              $scope.selectedTable = undefined;
              
              var i = $rootScope.currentProject.tables.indexOf(t);
              $rootScope.currentProject.tables.splice(i, 1);                             

              $('#md-deleteTable').modal("hide");               
              $scope.confirmTableName=null;
              successNotify("Successfully table is deleted");
              $scope.isDeletingTable=false;                                
          },
          function(error){ 
              errorNotify('We cannot delete table right now.');
              $scope.isDeletingTable=false;                                
          });              

        }else{  
          $scope.confirmTableName=null;
          $('#md-deleteTable').modal("hide");         
          errorNotify('Table name doesn\'t match');                         
        }  
      }             
                    
    };

    $scope.initiateTableSettings=function(){
        $scope.tableTypes = tableTypeService.getTableTypes();
        $scope.newTableType = "custom";
        $scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:'custom'}));
        $scope.tableError=null;

        /*var tableName="Custom";
        var incrementor=0;
        (function iterator(i) {
              $scope.checkErrorsForCreate(tableName,$rootScope.currentProject.tables,"table");
              if($scope.tableErrorForCreate){
                  ++incrementor;
                  tableName="Custom"+incrementor;
                  iterator(i+1);
              }
        })(0);
        $scope.newTableName = tableName;*/        

        
        $scope.addTablePopup=true;
        $scope.newTableName=null;

        $(".tableNewApp").stackbox({
            closeButton: false,
            animOpen:"fadeIn",
            width:"250px",
            marginY:9,
            position: 'top',
            autoAdjust:false,
            content: "#add-new-table-popup",
            autoScroll:true
        });
    };

    $scope.cancelAddtable=function(){
     $scope.tableErrorForCreate=null; 
     $scope.addTablePopup=false;  
     $scope.newTableName=null;   
    };

    $scope.selectType=function(newTableType){
      $scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:newTableType}));
      $scope.newTableName = angular.copy($scope.selectedTableType.name);
    };

    $scope.addNewTable = function(newTableName) {
      $scope.tableErrorForCreate=null;

      $scope.newTableName=angular.copy(newTableName);
      if($scope.newTableName){
        $scope.isCreatingTable=true;
        $scope.addTablePopup=false;      
        
        var table = new CB.CloudTable($scope.newTableName);       
        $rootScope.currentProject.tables.push(table);        

        tableService.saveTable(table)
        .then(function(respTable){
          $scope.goToDataBrowser(respTable);           
          $scope.newTableName =null; 
          $scope.isCreatingTable=false;
        },
        function(error){  
          //Remove               
          var index=$rootScope.currentProject.tables.indexOf(table);          
          $rootScope.currentProject.tables.splice(index,1);

          $scope.newTableName = null;
          $scope.isCreatingTable=false;          
          $scope.tableErrorForCreate="Oops,Please try again."; 
          $scope.addTablePopup=true;
          $(".tableNewApp").stackbox({
            closeButton: false,
            animOpen:"fadeIn",
            width:"250px",
            marginY:9,
            position: 'top',
            autoAdjust:false,
            content: "#add-new-table-popup",
            autoScroll:true
          });   

        });
      }else{
        $scope.tableErrorForCreate="Name cannot be empty.";
      }
                     
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
  
  $scope.filterDataType=function(dataTypeObj){
    if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation"){
      return dataTypeObj;
    }
  };        
          
  /* PRIVATE FUNCTIONS */

  function loadProject(id){

      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB();
          getProjectTables();
        }                              
      }, function(error){ 
        errorNotify('We cannot load your project at this point in time. Please try again later.');    
      });
  }

  function getProjectTables(){

    tableService.getProjectTables()
    .then(function(data){
        $rootScope.dataLoading=false;

        if(!data){                    
          $rootScope.currentProject.tables=[];                       
        }else if(data){                        
          $rootScope.currentProject.tables=data;     
        }         
       
    }, function(error){       
      $scope.loadingTablesError="We cannot load your tables at this point of time. Please try again later";  
    });
  } 
  function initCB(){
    CB.CloudApp.init($rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
  }

  function initBeacon(){
    var x = 0;
    addCircle(x);
    setInterval(function () {
      if (x === 0) {
          x = 1;
      }
      addCircle(x);
      x++;
    }, 1200);
  }

  function addCircle(id) {
      $('.first-table-beacon-container').append('<div  id="' + id + '" class="circlepulse first-table-beacon"></div>');

      $('#' + id).animate({
          'width': '38px',
          'height': '38px',
          'margin-top': '-15px',
          'margin-left': '-15px',
          'opacity': '0'
      }, 4000, 'easeOutCirc');

      setInterval(function () {
          $('#' + id).remove();
      }, 4000);
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
         bgcolor:'#149600',
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
