//random Directives
/*app.directive('random', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
            	var index=$(this).data("index");
            	var targetScope=angular.element($(".fixedTd")).scope();
		        targetScope.showSerialNo[index]=true;
		        targetScope.$digest();
		    }, function(){
		        var index=$(this).data("index");		
		      	var targetScope=angular.element($(".fixedTd")).scope();
		        targetScope.showSerialNo[index]=false;
		        targetScope.$digest();
		    });   	         
        }
    };
});
*/