app.directive('xeditable',['$timeout','tableErrorService','$rootScope',function($timeout,tableErrorService,$rootScope) {
    return {
        restrict: 'A',
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            var loadXeditable = function() { 
                var tableObj=ngModel.$viewValue;
                var tableId=ngModel.$viewValue.id;                
                var tableName=ngModel.$viewValue.name;                  
                   
                angular.element(element).editable({
                    pk:tableId,
                    placement:'right',
                    autotext:'never',
                    value:tableName,
                    send:'always',  
                    display:false, 
                    validate: function(value) {                  
                        var result=tableErrorService.checkErrorsForEdit(value,tableObj,$rootScope.currentProject.tables,'table');
                        if(result){                              
                             return result;                              
                        }                        
                    },                
                    url: function(params) {
                         var i = $rootScope.currentProject.tables.indexOf(tableObj);
                         $rootScope.currentProject.tables[i].name=params.value;
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