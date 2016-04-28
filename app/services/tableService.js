app.factory('tableService',
 ['$q','$http', 'utilityService', 'tableTypeService','$rootScope',
 function ($q,$http, utilityService, tableTypeService,$rootScope) {

    var global = {}; 

    global.saveTables = function(tables){

        var q=$q.defer();

        var promise = [];
      
        for(var i=0;i<tables.length; i++){
          promise.push(global.saveTable(tables[i]));
        }

        $q.all(promise).then(function(){
            q.resolve();
        }, function(){
            q.reject();
        });

        return  q.promise;
    };

    global.deleteTables = function(tables){

        var q=$q.defer();

        var promise = [];
      
        for(var i=0;i<tables.length; i++){
          promise.push(global.deleteTable(tables[i]));
        }

        $q.all(promise).then(function(){
          q.resolve();
        }, function(){
          q.reject();
        });

        return  q.promise;
    };

    global.deleteTable = function(table){
        var q=$q.defer();

        //var tableObj = new CB.CloudTable(table.name);
        table.delete()
        .then(function(status){
          q.resolve(status);

           if(!__isDevelopment){
            /****Tracking*********/            
             mixpanel.track('Delete Table', { "Table name": table.name,"appId": $rootScope.currentProject.appId});
            /****End of Tracking*****/
           }
        },function(){
          q.reject(status);
        });

        return  q.promise;
        
    };

    global.saveTable = function(table){
        var q=$q.defer();

        var create=true;      

        if(table && table.document && table.document._id){
         create=false;         
        }       

        table.save()
        .then(function(obj){
          table=obj;         
          q.resolve(obj);
      
          if(create && !__isDevelopment){
            /****Tracking*********/            
             mixpanel.track('Create Table', { "Table name": table.name,"appId": $rootScope.currentProject.appId});
            /****End of Tracking*****/
          }        

        }, function(err){
          q.reject(err);
        });            

        return  q.promise;
    };
     
    global.getProjectTables = function(){
        var q=$q.defer();

        CB.CloudTable.getAll()
        .then(function(tableArray){
          q.resolve(tableArray);
        }, function(err){
          q.reject(err);          
        });      

        return  q.promise;
      };

    global.getProjectTableByName = function(name){
        var q=$q.defer();

        var obj = new CB.CloudTable(name);

        CB.CloudTable.get(obj)
        .then(function(table){      
          q.resolve(table); 
        }, function(err){
          q.reject(err);
        });     

        return  q.promise;
    }; 

    return global;

}]);
