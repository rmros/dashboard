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

app.directive('colresize', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).resizableColumns();
        }
    };
});


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
                }   


            });
        }
    };
});

app.directive('malihuscrollbarForPopup', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).mCustomScrollbar({
                axis:"yx",               
                advanced:{autoExpandHorizontalScroll:true},
                scrollbarPosition:"outside",
                theme:"minimal-dark"
            });
        }
    };
});

app.directive('prettyphoto', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){          
            $("a[rel^='prettyPhoto']").prettyPhoto({
                animation_speed: 'fast',
                allow_resize: true,                
                markup: '<div class="pp_pic_holder"> \
                <div class="ppt">&nbsp;</div> \
                <div class="pp_top"> \
                    <div class="pp_left"></div> \
                    <div class="pp_middle"></div> \
                    <div class="pp_right"></div> \
                </div> \
                <div class="pp_content_container"> \
                    <div class="pp_left"> \
                    <div class="pp_right"> \
                        <div class="pp_content"> \
                            <div class="pp_loaderIcon"></div> \
                            <div class="pp_fade"> \
                                <a  class="pp_expand" title="Expand the image">Expand</a> \
                                <div class="pp_hoverContainer"> \
                                    <a class="pp_next" href="#">next</a> \
                                    <a class="pp_previous" href="#">previous</a> \
                                </div> \
                                <div id="pp_full_res"></div> \
                                <div class="pp_details"> \
                                    <div class="pp_nav"> \
                                        <a href="#" class="pp_arrow_previous">Previous</a> \
                                        <p class="currentTextHolder">0/0</p> \
                                        <a href="#" class="pp_arrow_next">Next</a> \
                                    </div> \
                                    <p class="pp_description"></p> \
                                    {pp_social} \
                                    <a class="pp_close" href="#">Close</a> \
                                </div> \
                            </div> \
                        </div> \
                    </div> \
                    </div> \
                </div> \
                <div class="pp_bottom"> \
                    <div class="pp_left"></div> \
                    <div class="pp_middle"></div> \
                    <div class="pp_right"></div> \
                </div> \
            </div> \
            <div class="pp_overlay"></div>',
    gallery_markup: '<div class="pp_gallery"> \
                        <a href="#" class="pp_arrow_previous">Previous</a> \
                        <div> \
                            <ul> \
                                {gallery} \
                            </ul> \
                        </div> \
                        <a href="#" class="pp_arrow_next">Next</a> \
                    </div>',
                social_tools:"",
                custom_markup: '<div class="sdsd">\
                                <span>rtbathula</span>\
                                </div>' 
            });
        }
    };
});

app.directive('filechange', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).change(function(){
                var fileUploadControl = $(element)[0];
                if(fileUploadControl && fileUploadControl.files.length > 0) {
                    console.log(fileUploadControl.files[0]);
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,fileUploadControl.files[0].name,fileUploadControl.files[0]);
                    }
                    reader.readAsDataURL(fileUploadControl.files[0]);                    
                }
            });
        }
    };
});

