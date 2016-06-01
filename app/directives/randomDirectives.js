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


app.directive('cbellipsis', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var ElmContent=$(element).text(); 
            if(ElmContent.length>260){
                var trimmedString=ElmContent.substring(0, 260);
                trimmedString=trimmedString+"...";
                $(element).text(trimmedString);
            } 

        }
    };
});

app.directive('colorhover', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){          

            $(element).hover(function(){
                var itscolor=scope.authSettings.settings.general.primaryColor;
                $(this).css("background-color", LightenDarkenColor(itscolor,-40));
            }, function(){
                var itscolor=scope.authSettings.settings.general.primaryColor;
                $(this).css("background-color", itscolor);
            });

            function LightenDarkenColor(col, amt) {
      
                var usePound = false;
              
                if (col[0] == "#") {
                    col = col.slice(1);
                    usePound = true;
                }
             
                var num = parseInt(col,16);
             
                var r = (num >> 16) + amt;
             
                if (r > 255) r = 255;
                else if  (r < 0) r = 0;
             
                var b = ((num >> 8) & 0x00FF) + amt;
             
                if (b > 255) b = 255;
                else if  (b < 0) b = 0;
             
                var g = (num & 0x0000FF) + amt;
             
                if (g > 255) g = 255;
                else if (g < 0) g = 0;
             
                return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
              
            }             
        }
    };    

});
