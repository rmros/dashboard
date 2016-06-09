app.factory('cloudBoostApiService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

  var global = {};    

  global.loadTableData = function(table,orderBy,orderByType,limit,skip) {          
    var q=$q.defer();
      if(table){   
        var query = new CB.CloudQuery(table.name);

        if(orderByType=="asc"){
          query.orderByAsc(orderBy);
        }
        if(orderByType=="desc"){
          query.orderByDesc(orderBy);
        }
          
        query.setLimit(limit);
        query.setSkip(skip);

        for(var i=0;i<table.columns.length;++i){
          if(table.columns[i].dataType=="File"){
            query.include(table.columns[i].name);
          }
          
          //List of files
          if(table.columns[i].dataType=="List" && table.columns[i].relatedTo=="File"){
            query.include(table.columns[i].name);
          }        
        } 

        query.find({success : function(list){ 
          q.resolve(list);
        }, error : function(error){ 
          q.reject(error);             
        }});       
      }                  
    return  q.promise;     
  };

  global.saveCloudObject = function(obj){
    var q=$q.defer(); 

    //save the object.
    obj.save({ success: function(newObj){ 
        q.resolve(newObj);  
      },error: function(err) {
        q.reject(err);                  
       //$scope.$digest();
      }
    });

    return  q.promise;      
  };

  global.deleteCloudObject = function(obj){
    var q=$q.defer();

    obj.delete().then(function(obj){    
      q.resolve(obj);
    }, function(error){ 
      q.reject(error);
    });

    return  q.promise;
  };

  global.queryTableById = function(table,objectId) {          
    var q=$q.defer();
      
      var query = new CB.CloudQuery(table.name); 
      for(var i=0;i<table.columns.length;++i){
        if(table.columns[i].dataType=="File"){
          query.include(table.columns[i].name);
        }else if(table.columns[i].dataType=="List" && table.columns[i].document.relatedTo!='Text' && table.columns[i].document.relatedTo!='EncryptedText' && table.columns[i].document.relatedTo!='Email' && table.columns[i].document.relatedTo!='Number' && table.columns[i].document.relatedTo!='URL' && table.columns[i].document.relatedTo!='DateTime' && table.columns[i].document.relatedTo!='Boolean'  && table.columns[i].document.relatedTo!='Object' && table.columns[i].document.relatedTo!='GeoPoint'){
          //Relations or Files
          query.include(table.columns[i].name);
        }
      }

      query.findById(objectId,{
      success : function(record){ 
        q.resolve(record);                 

      }, error : function(error){                
        q.reject(error);
      }}); 

    return  q.promise;  
             
  };
  
  global.queryTableByName = function(tableName) {          
    var q=$q.defer();
      
      var query = new CB.CloudQuery(tableName);       
      query.find({
      success : function(records){ 
        q.resolve(records);                 

      }, error : function(error){                
        q.reject(error);
      }}); 

    return  q.promise;           
  };

  global.queryCountByTableName = function(tableName) {          
    var q=$q.defer();
      
      var query = new CB.CloudQuery(tableName);
      query.limit=9999;      
      query.count({
        success : function(number){
          q.resolve(number);
        }, error : function(error){
          q.reject(error);
        }
      }); 

    return  q.promise;           
  }; 



  global.queryContainedIn = function(tableName,columnName,queryArray){
    var q=$q.defer(); 

    var query = new CB.CloudQuery(tableName);      
    query.containedIn(columnName, queryArray);
    query.find({
      success: function(list){
       q.resolve(list);          
      },
      error: function(err) {
       q.reject(err);
      }
    });

    return  q.promise;      
  };

  global.getCBFile = function(fileObj,successCallBk,errorCallBk,progressCallBk){  

    //var q=$q.defer();

      var file = new CB.CloudFile(fileObj);
      file.save({
        success: function(newFile) {          
          successCallBk(newFile); 
        },
        error: function(err) {         
          errorCallBk(err); 
        },
        uploadProgress : function(percentComplete){
          progressCallBk(percentComplete);
        }
      });                

    //return  q.promise;
  }; 

  global.search = function(table,searchValue) {          
    var q=$q.defer(); 

    var query = new CB.CloudQuery(table.name);

    if(searchValue){
      query.search(searchValue);
    }   

    query.find({
    success : function(records){ 
      q.resolve(records); 
    }, error : function(error){                
      q.reject(error);
    }});     

    return  q.promise;           
  };  

  global.filterQuery = function(table,filterList) {          
    var q=$q.defer();    

      //Add Filters To query(Private function to loop over)     
      var query=addFiltersToQuery(table,filterList); 

      query.find({
      success : function(records){ 
        q.resolve(records);                 

      }, error : function(error){                
        q.reject(error);
      }}); 

    return  q.promise;           
  }; 


  //Private Function to process filters
  function addFiltersToQuery(table,filterList){
    var currentQuery = new CB.CloudQuery(table.name);
    for(var i=0;i<filterList.length;++i){

      var queryValue;
      if(filterList[i].colDataType=="DateTime"){
        queryValue=new Date(filterList[i].value);
      }else{
        queryValue=filterList[i].value;
      }

      var queryArrayValue=[];
      if(filterList[i].colDataType=="List" && filterList[i].colRelatedTo=="DateTime"){
        for(var d=0;d<filterList[i].arrayValue.length;++d){
          queryArrayValue.push(new Date(filterList[i].arrayValue[d]));
        }
      }else{
        queryArrayValue=filterList[i].arrayValue;
      }

      if(filterList[i].contriant=="And"){ 
        if(filterList[i].filter=="equalTo"){
          currentQuery.equalTo(filterList[i].colName, queryValue); 
        }
        if(filterList[i].filter=="notEqualTo"){
          currentQuery.notEqualTo(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="containedIn"){
          currentQuery.containedIn(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="containsAll"){
          currentQuery.containsAll(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="notContainedIn"){
          currentQuery.notContainedIn(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="greaterThan"){
          currentQuery.greaterThan(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="greaterThanEqualTo"){
          currentQuery.greaterThanEqualTo(filterList[i].colName, queryValue); 
        }
        if(filterList[i].filter=="lessThan"){
          currentQuery.lessThan(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="lessThanEqualTo"){
          currentQuery.lessThanEqualTo(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="startsWith"){
          currentQuery.startsWith(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="exists"){
          currentQuery.exists(filterList[i].colName); 
        } 
        if(filterList[i].filter=="doesNotExists"){
          currentQuery.doesNotExists(filterList[i].colName); 
        } 
        if(filterList[i].filter=="near"){
          filterList[i].longitude=parseInt(filterList[i].longitude);
          filterList[i].latitude=parseInt(filterList[i].latitude);
          filterList[i].value=parseInt(filterList[i].value);

          var loc = new CB.CloudGeoPoint(filterList[i].longitude,filterList[i].latitude);
          currentQuery.near(filterList[i].colName,loc, filterList[i].value); 
        }
        if(filterList[i].filter=="geoWithin"){
          if(filterList[i].arrayValue.length>2){
            var geoPointsCB=[];
            for(var g=0;g<filterList[i].arrayValue.length;++g){

              var longitude=parseInt(filterList[i].arrayValue[g].longitude);
              var latitude=parseInt(filterList[i].arrayValue[g].latitude);

              var loc = new CB.CloudGeoPoint(longitude,latitude);              
              geoPointsCB.push(loc);
            }
            currentQuery.geoWithin(filterList[i].colName, geoPointsCB); 
          }
          
        }    
      }

      if(filterList[i].contriant=="Or"){   
        var query = new CB.CloudQuery(table.name); 

        if(filterList[i].filter=="equalTo"){
          query.equalTo(filterList[i].colName, queryValue); 
        }
        if(filterList[i].filter=="notEqualTo"){
          query.notEqualTo(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="containedIn"){
          query.containedIn(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="containsAll"){
          query.containsAll(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="notContainedIn"){
          query.notContainedIn(filterList[i].colName, queryArrayValue); 
        } 
        if(filterList[i].filter=="greaterThan"){
          query.greaterThan(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="greaterThanEqualTo"){
          query.greaterThanEqualTo(filterList[i].colName, queryValue); 
        }
        if(filterList[i].filter=="lessThan"){
          query.lessThan(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="lessThanEqualTo"){
          query.lessThanEqualTo(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="startsWith"){
          query.startsWith(filterList[i].colName, queryValue); 
        } 
        if(filterList[i].filter=="exists"){
          query.exists(filterList[i].colName); 
        } 
        if(filterList[i].filter=="doesNotExists"){
          query.doesNotExists(filterList[i].colName); 
        } 
        if(filterList[i].filter=="near"){
          filterList[i].longitude=parseInt(filterList[i].longitude);
          filterList[i].latitude=parseInt(filterList[i].latitude);
          filterList[i].value=parseInt(filterList[i].value);

          var loc = new CB.CloudGeoPoint(filterList[i].longitude,filterList[i].latitude);
          query.near(filterList[i].colName,loc, filterList[i].value); 
        }
        if(filterList[i].filter=="geoWithin"){
          if(filterList[i].arrayValue.length>2){
            var geoPointsCB=[];
            for(var g=0;g<filterList[i].arrayValue.length;++g){

              var longitude=parseInt(filterList[i].arrayValue[g].longitude);
              var latitude=parseInt(filterList[i].arrayValue[g].latitude);

              var loc = new CB.CloudGeoPoint(longitude,latitude);
              geoPointsCB.push(loc);
            }
            query.geoWithin(filterList[i].colName, geoPointsCB); 
          }
        }

        currentQuery = CB.CloudQuery.or(currentQuery, query);
      }    
    }

    return currentQuery;
  }

return global;

}]);

