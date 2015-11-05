//Scrollbar for both vertical and horizontal
app.directive('malihuscrollbar', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).mCustomScrollbar({
                axis:"yx",               
                advanced:{autoExpandHorizontalScroll:true,
                    updateOnContentResize: true},
                scrollbarPosition:"outside",
                theme:"dark-thick",
                scrollButtons:{enable:true,
                    scrollAmount: 20,
                    scrollType: "stepless"
                },callbacks:{
                  onTotalScroll: function(){
                    var pos=$(".smoothTable").scrollTop();
                    //console.log("Hey buddy I got totally scrolled: "+pos);
                    scope.addMoreRecords();
                  }
                }
            });           
        }
    };
});

//A mini Scrollbar for both vertical and horizontal
app.directive('malihuscrollbarForPopup', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).mCustomScrollbar({
                axis:"y",               
                advanced:{autoExpandHorizontalScroll:true},
                scrollbarPosition:"outside",
                theme:"minimal-dark"
            });
        }
    };
});

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