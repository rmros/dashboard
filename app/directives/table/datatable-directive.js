app.directive('datatabledir', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).DataTable( {
                "ajax": "data/arrays.txt",
                "scrollY": 200,
                "scrollX": true
            } );
        }
    };
});