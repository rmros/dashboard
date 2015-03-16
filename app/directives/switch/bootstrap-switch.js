app.directive('bootstrapswitch', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            /*Switch*/
             $(element).bootstrapSwitch();  
        }
    };
});