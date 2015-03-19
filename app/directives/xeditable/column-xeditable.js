app.directive('columnXeditable',['$timeout','tableErrorService','$rootScope',function($timeout,tableErrorService,$rootScope) {
    return {
        restrict: 'A',
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {            
            var loadXeditable = function() {               
                var colObj=ngModel.$viewValue;
                var colId=ngModel.$viewValue.id;                
                var colName=ngModel.$viewValue.name; 
                var colDisable=!ngModel.$viewValue.isEditable;                               
                   
                angular.element(element).editable({
                    pk:colId,
                    placement:'right',
                    autotext:'never',
                    value:colName,
                    send:'always',
                    disabled:colDisable,  
                    display:false,                   
                    validate: function(value) {                  
                        var result=tableErrorService.checkErrorsForEdit(value,colObj,scope.selectedTable.columns,'column');
                        if(result){                              
                            return result;                              
                        }                      
                    },                
                    url: function(params) {
                         var i = scope.selectedTable.columns.indexOf(colObj);
                         scope.selectedTable.columns[i].name=params.value;
                         scope.saveTables();
                         scope.$apply();                       
                    } 

                });
            }
            $timeout(function() {
                loadXeditable();
            }, 10);
        }
    };
}]);