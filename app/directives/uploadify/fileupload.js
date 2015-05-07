app.directive('fileupload', function(uiGridEditConstants,cloudObjectService){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs){          

            angular.element(elm).fileupload({                          
                change: function (e, data) {
                    if(data.files.length>0){                                               
                        cloudObjectService.setFileObject(data.files[0]);
                        scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    }else{
                        scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    }
                }
            }); 

            //Detect on Cancel or close
            angular.element(elm)               
                .on("click.filesSelector", function () {                   
                    var cancelled = false; /* need this because .one calls handler once for each event type */
                  
                    setTimeout(function () {
                        $(document).one("mousemove.filesSelector focusin.filesSelector", function () {                          
                            if (angular.element(elm).val().length === 0 && !cancelled) {
                               cancelled = true; /* prevent double cancel */
                               /* that's the point of cancel*/
                               scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                            }
                        }); 

                }, 1); 
            });


        }//End of link
    };
});
