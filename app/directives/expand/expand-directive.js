app.directive('expand', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){           
            $(element).collapse({
            accordion:true
            });
        }
    };
});