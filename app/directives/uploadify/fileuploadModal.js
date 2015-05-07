app.directive('fileuploadModal', function(uiGridEditConstants){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs){          

            angular.element(elm).fileupload({          
                change: function (e, data) {
                    if(data.files.length>0){
                        var index=angular.element(elm).data("index");                       
                        scope.fileChange(data.files[0],index);                        
                    }
                }    
            });           

        }//End of link
    };
});
