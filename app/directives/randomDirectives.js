//random Directives
app.directive('verticalscroll', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).scroll(function(e){               
                $(".fixed-table-wrapper")[0].scrollTop=e.target.scrollTop;
            });         	         
        }
    };
});