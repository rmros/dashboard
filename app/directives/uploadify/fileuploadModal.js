app.directive('fileuploadModal', function(uiGridEditConstants,cloudObjectService){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs){          

            angular.element(elm).fileupload({          
                change: function (e, data) {
                    if(data.files.length>0){
                        cloudObjectService.setFileArrayObject(data.files[0]);                       
                    }
                }    
            });           

        }//End of link
    };
});
