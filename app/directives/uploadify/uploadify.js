app.directive('uploadify', function(uiGridEditConstants,cloudObjectService){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs){          

            angular.element(elm).uploadify({
                'auto'     : false,
                'swf'      : 'assets/js/uploadfy/uploadify.swf',
                'onCancel' : function(file) {
                    if (!file.name) {
                        
                        scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    }
                    else {
                        scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    }
                },
                'onSelect' : function(file) {           

                    if (!file.name) {
                        
                        scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    }
                    else {      
                        cloudObjectService.setFileObject(file);                  
                        scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    }
                },
                'onDialogClose'  : function(queueData) {
                    
                    if (queueData.queueLength==0) {
                        
                        scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    }
                    else {
                        scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    }
                    
                }     
            }); 
        }
    };
});