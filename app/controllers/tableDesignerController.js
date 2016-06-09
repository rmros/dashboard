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
     $state,
     beaconService,
     $document,
     $compile) {
    
    var id;      
    $scope.newtables=[];
    $scope.addTablePopup=false;
    $rootScope.showAppPanel=true;
    $rootScope.isFullScreen=false;  
    $scope.tableCreateSpinner=[];
    $scope.tableCreatedTick=[];  

    $scope.openTableOptions=[];
    $scope.closeTableOptions=[];

    $scope.tableTypes=["Custom","Role","User","Device"];
      
    $scope.initialize = function() {
        $rootScope.page='tableDesigner';
        $rootScope.dataLoading=true;                                 
        $scope.colDataTypes=columnDataTypeService.getcolumnDataTypes();       
        id = $stateParams.appId;

        if($rootScope.currentProject && $rootScope.currentProject.appId === id){
          //if the same project is already in the rootScope, then dont load it.
          initCB(); 
          getProjectTables(); 
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;               
        }else{
          loadProject(id);              
        }

        //getBeacon
        getBeacon();
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
      if(t.document.type!='user' && t.document.type!='role'){
        
        if($scope.confirmTableName === null) {

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
              successNotify("Your table deleted successfully");
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
        //$scope.tableTypes = tableTypeService.getTableTypes();
        $scope.newTableType = "Custom";
        //$scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:'custom'}));
        $scope.tableError=null;
        $scope.tableErrorForCreate=null;
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
      //$scope.selectedTableType=_.first(_.where($scope.tableTypes, {type:newTableType}));
      //$scope.newTableName = angular.copy($scope.selectedTableType.name);
      $scope.tableErrorForCreate=null;
      $scope.newTableName=newTableType;    
      if(newTableType!="Custom"){
        $scope.newTableName=angular.copy(newTableType);
      }
      var tableAdded=_.find($scope.currentProject.tables, function(eachObj){ 
        if(eachObj.name==newTableType){ 
          return true;          
        }
      });
      $scope.tableErrorForCreate=null;
      if(tableAdded){
        $scope.tableErrorForCreate="This table already exists.";       
      }

    };

    $document.on("keydown",function($event) {
      if($event && $event.keyCode==13 && $scope.addTablePopup && $scope.newTableName && !$scope.tableErrorForCreate){
        $scope.addNewTable();  
        //angular.element('#add-new-table-popup').css({
        //"display":"none"
        //});
      }      
    });

    $scope.addNewTable = function() {
      $scope.tableErrorForCreate=null;     

      if($scope.newTableName){
        $scope.isCreatingTable=true;
        $scope.addTablePopup=false;              
        
        var table = new CB.CloudTable($scope.newTableName);       
        $rootScope.currentProject.tables.push(table);
        var index=$rootScope.currentProject.tables.indexOf(table);               

        //Start Spinner
        $scope.tableCreateSpinner[index]=true;

        tableService.saveTable(table)
        .then(function(respTable){

          if($scope.newTableName.toLowerCase()!="custom"){
            var tTypeIndex=$scope.tableTypes.indexOf($scope.newTableName);
            if(tTypeIndex>-1){
              $scope.tableTypes.splice(tTypeIndex,1);
            }
          }
                  

          $rootScope.currentProject.tables[index]=respTable;          
          //$scope.goToDataBrowser(respTable);           
          $scope.newTableName =null; 
          $scope.newTableType = "Custom";
          $scope.isCreatingTable=false;

          //Stop Spinner and Show Tickmark for sec
          $scope.tableCreateSpinner[index]=false;
          $scope.tableCreatedTick[index]=true;
          $scope.newTableAdded=true;

          $timeout(function(){ 
            $scope.tableCreatedTick[index]=false;
          }, 1300);

          $timeout(function(){ 
            $scope.newTableAdded=false;
          }, 2000);                   
        },
        function(error){            
          //Remove              
          $scope.tableCreateSpinner[index]=false;         
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

        //Update Beacon
        if($scope.beacon && !$scope.beacon.firstTable){
          $scope.beacon.firstTable=true;
          updateBeacon();   
        }
        
      }else{
        $scope.tableErrorForCreate="Name cannot be empty.";
      }
                     
  };

  //Table Errors
  $scope.checkErrorsForCreate=function(name,arrayList,type,$event){
    if($event && $event.keyCode!=13){
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
  }
 
  
  $scope.filterDataType=function(dataTypeObj){
    if(dataTypeObj.type!="List" && dataTypeObj.type!="Relation"){
      return dataTypeObj;
    }
  };        
   
  $scope.hoverIn = function(index){
    $scope.openTableOptions[index]=true;
    $scope.closeTableOptions[index]=false;
  };

  $scope.hoverOut = function(index){
    $scope.openTableOptions[index]=false;
    $scope.closeTableOptions[index]=true;
  };       
  /* PRIVATE FUNCTIONS */

  function loadProject(id){
    
    if($rootScope.currentProject){
      initCB();
      getProjectTables();
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          initCB();
          getProjectTables();
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;  
        }                              
      }, function(error){ 
       $rootScope.dataLoading=false;
       $scope.loadingError="We cannot load your project at this point of time. Please try again later.";
      });
    }
    
  }

  function getProjectTables(){

    tableService.getProjectTables()
    .then(function(data){
        $rootScope.dataLoading=false;

        if(!data){                    
          $rootScope.currentProject.tables=[];                       
        }else if(data){                        
          $rootScope.currentProject.tables=data;          

          for(var i=0;i<data.length;++i){
            for(var j=0;j<$scope.tableTypes.length;++j){
              if($scope.tableTypes[j]==data[i].name && (data[i].name.toLowerCase()!="custom")){
                $scope.tableTypes.splice(j,1);
              }
            }
          }    
        } 
       

    }, function(error){  
      $rootScope.dataLoading=false;     
      $scope.loadingError="We cannot load your tables at this point of time. Please try again later";
      if(error=="Reached Plan Limit. Upgrade Plan."){
       $scope.loadingError=error;
      }  
    });
  }
   
  function initCB(){
    CB.CloudApp.init(SERVER_URL,$rootScope.currentProject.appId, $rootScope.currentProject.keys.master);
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
    
      
});
