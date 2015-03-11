app.directive('scrollbar', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){           
             $(element).enscroll({
                drawScrollButtons: true,
                cornerClass: 'corner2',

                verticalTrackClass: 'track1',
                verticalHandleClass: 'handle1',                
                scrollUpButtonClass: 'scroll-up1',
                scrollDownButtonClass: 'scroll-down1',

                horizontalScrolling:true,
                scrollLeftButtonClass:'scroll-left1',
                scrollRightButtonClass:'scroll-right1',
                horizontalTrackClass: 'horizontal-track2',
                horizontalHandleClass: 'horizontal-handle2'                
             });
        }
    };
});
