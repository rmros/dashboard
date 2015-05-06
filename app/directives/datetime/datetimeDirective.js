app.directive('datetimeDirective', function(uiGridEditConstants){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs){         

            /*angular.element(elm).change(function(){
                scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
            });*/

            angular.element(elm).blur(function(){
                scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
            });

        }//End of link
    };
});
