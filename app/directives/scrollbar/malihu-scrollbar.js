app.directive('malihuscrollbar', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){           
             $(element).mCustomScrollbar({
                axis:"yx",
                theme:"3d-thick",
                scrollInertia:800,
                scrollbarPosition:"outside",               
                alwaysShowScrollbar:2,
                autoExpandScrollbar:true,
                advanced:{
                    autoExpandHorizontalScroll:true,
                    updateOnContentResize: true
                },
                scrollButtons:{
                    enable:true,
                    scrollType:"stepless",
                    scrollAmount:200
                }                
              });
        }
    };
});
