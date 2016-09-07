app.factory('fileService', ['$q','$http','$rootScope',function ($q,$http,$rootScope) {

    var global = {};

    global.getAllFoldersBy = function(folderId,orderBy,orderByType,limit,skip){

      var q=$q.defer();

        var query = new CB.CloudQuery("_File");  
        
        query.equalTo('folderId',folderId);        

        if(orderByType=="asc"){
          query.orderByAsc(orderBy);
        }

        if(orderByType=="desc"){
          query.orderByDesc(orderBy);
        }
       
        query.setLimit(limit);
        query.setSkip(skip);

        query.find({success : function(list){ 
          q.resolve(list);
        }, error : function(error){ 
          q.reject(error);             
        }});  

      return  q.promise;

    };

    global.deleteFolder = function(file){

      var q=$q.defer();

        file.delete({
          success: function(file) {
            q.resolve(file);
          }, error: function(error) {
            q.reject(error);
          }
        });

      return  q.promise;

    };

    global.saveFolder = function(file){

      var q=$q.defer();

        file.save({
          success: function(file) {
            q.resolve(file);
          }, error: function(error) {
            q.reject(error);
          }
        });

      return  q.promise;

    };

    global.createFolder = function(path,folderName){

      var q=$q.defer();

        CB.CloudFile.createFolder(path,folderName,{
          success: function(folder) {
            q.resolve(folder);
          }, error: function(error) {
            q.reject(error);
          }
        });

      return  q.promise;

    };
    
    return global;

}]);
