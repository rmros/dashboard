//random Directives
/*app.directive('random', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).datetimepicker();   	         
        }
    };
});
*/

app.directive('datetimepicker', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).datetimepicker({format:"Y-m-d H:i:s",
            	closeOnDateSelect:false
        	});   	         
        }
    };
});

app.directive('clickElsewhere', function ($parse, $rootScope) {
    return {
        restrict: 'A',
        compile: function ($element, attr) {
            var fn;
            fn = $parse(attr['clickElsewhere']);
            return function (scope, element) {
                var offEvent;
                offEvent = $rootScope.$on('click', function (event, target) {
                    if (element.find($(target)).length || element.is($(target))) {
                        return;
                    }
                    return scope.$apply(function () {
                        return fn(scope);
                    });
                });
                return scope.$on('$destroy', offEvent);
            };
        }
    };
});
