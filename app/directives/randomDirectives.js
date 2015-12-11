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

