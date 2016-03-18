//File uploader
app.directive('dmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){        
            $(element).dmUploader({               
                onNewFile: function(id, file){                 
                    
                    //var reader = new FileReader();
                    //reader.onload = function (e) {                       
                        scope.fileSelected("reader.result",file.name,file);
                    //}
                    //reader.readAsDataURL(file);
                    
                }
            });
        }
    };
});

//Especially for relation Files
app.directive('reldmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).dmUploader({               
                onNewFile: function(id, file){ 
                    
                    var column = $(element).data('column');
                    
                    //var reader = new FileReader();
                    //reader.onload = function (e) {                       
                        scope.relfileSelected(column,"reader.result",file.name,file);
                    //}
                    //reader.readAsDataURL(file);                    
                }
            });
        }
    };
});


//Especially for list relation Files
app.directive('listreldmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).dmUploader({               
                onNewFile: function(id, file){ 
                    
                    var column = $(element).data('column');
                    
                    //var reader = new FileReader();
                    //reader.onload = function (e) {                       
                        scope.relListFileSelected(column,"reader.result",file.name,file);
                    //}
                    //reader.readAsDataURL(file);                    
                }
            });
        }
    };
});

//File Directive
app.directive('ddfile', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){ 
            var allowedTypes="*";            

            if(scope.allowedFileTypes){
                allowedTypes=scope.allowedFileTypes;
            }  

            $(element).dmUploader({ 
                allowedTypes:allowedTypes,              
                onNewFile: function(id, file){                 
                    
                    var fileSize=((file.size/1024)/1024);//Convert Bytes to MBs

                    if(fileSize<13){
                        var reader = new FileReader();
                        reader.onload = function (e) {                       
                            scope.fileSelected(reader.result,file);
                        }
                        reader.readAsDataURL(file);
                    }else{
                        scope.fileSelected("reader.result",file);
                    }                    
                    
                }
            });
        }
    };
});

//File Directive
app.directive('normalddfile', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){ 
            var allowedTypes="*"; 
            var extFilter=null;           

            if(scope.allowedFileTypes){
                allowedTypes=scope.allowedFileTypes;
            }
            if(scope.extFilter){
                extFilter=scope.extFilter;
            }  

            $(element).dmUploader({ 
                allowedTypes:allowedTypes, 
                extFilter: extFilter,            
                onNewFile: function(id, file){                 
                    
                    var fileSize=((file.size/1024)/1024);//Convert Bytes to MBs

                    if(fileSize<13){
                        var reader = new FileReader();
                        reader.onload = function (e) {                       
                            scope.fileSelected(reader.result,file);
                        }
                        reader.readAsDataURL(file);
                    }else{
                        scope.fileSelected("reader.result",file);
                    }                    
                    
                }
            });
        }
    };
});


/*app.directive('filechange', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).change(function(){
                var fileUploadControl = $(element)[0];
                if(fileUploadControl && fileUploadControl.files.length > 0) {
                    //console.log(fileUploadControl.files[0]);
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,fileUploadControl.files[0].name,fileUploadControl.files[0]);
                    }
                    reader.readAsDataURL(fileUploadControl.files[0]);                    
                }
            });
        }
    };
});*/
