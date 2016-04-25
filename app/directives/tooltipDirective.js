app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){            
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});

app.directive('infotooltipleft', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .attr('title',scope.$eval(attrs.infotooltipleft))
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-shadow',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('normaltooltipleft', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .attr('title',scope.$eval(attrs.normaltooltipleft))
            .tooltipster({
               arrow:true,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-shadow',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('infotooltipright', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)  
            .attr('title',scope.$eval(attrs.infotooltipright))          
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-light',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('errortooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .attr('title',scope.$eval(attrs.errortooltip))
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-light',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});


app.directive('htmltooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .darkTooltip({                
                gravity:'west',                
                theme:'custm',
                opacity:1               
            });
        }
    };
});




