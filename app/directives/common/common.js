
/*app.directive('fixedtableheadcol', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).freezeHeader({ 'height': '300px' });
        }
    };
});

app.directive('fixedthead', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            var $table = $(element);
            $table.floatThead({
                scrollContainer: function($table){
                    return $table.closest('.data-table-design');
                },
                zIndex:8,
                useAbsolutePositioning:false
            });
        }
    };
});*/

app.directive('appNameValidation', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).keyup(function(){
              var error=scope.newApp.name.indexOf(".");               
              if(error>-1){
                $(element)[0].setCustomValidity("App Name Shoudn't have dots(.)");
              }else{
                $(element)[0].setCustomValidity("");
              }                
                                
            });
        }
    };
});

app.directive('appIdValidation', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).keyup(function(){
               
              var error=appIdValidation(scope.newApp.appId);
              if(error){
                $(element)[0].setCustomValidity(error);
              }else{
                $(element)[0].setCustomValidity("");
              }                
                                
            });
        }
    };
});

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

/*
app.directive('colresize', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).resizableColumns();
        }
    };
});*/


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

/*app.directive('filechange', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).change(function(){
                var fileUploadControl = $(element)[0];
                if(fileUploadControl && fileUploadControl.files.length > 0) {
                    //console.log(fileUploadControl.files[0]);
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,fileUploadControl.files[0].name,fileUploadControl.files[0]);
                    }
                    reader.readAsDataURL(fileUploadControl.files[0]);                    
                }
            });
        }
    };
});*/

//File uploader
app.directive('dmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){        
            $(element).dmUploader({               
                onNewFile: function(id, file){                 
                    
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,file.name,file);
                    }
                    reader.readAsDataURL(file);
                    
                }
            });
        }
    };
});

//Especially for relation Files
app.directive('reldmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).dmUploader({               
                onNewFile: function(id, file){ 
                    
                    var column = $(element).data('column');
                    
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.relfileSelected(column,reader.result,file.name,file);
                    }
                    reader.readAsDataURL(file);                    
                }
            });
        }
    };
});


//Especially for list relation Files
app.directive('listreldmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).dmUploader({               
                onNewFile: function(id, file){ 
                    
                    var column = $(element).data('column');
                    
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.relListFileSelected(column,reader.result,file.name,file);
                    }
                    reader.readAsDataURL(file);                    
                }
            });
        }
    };
});

app.directive('fileloading', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            scope.relFileProgress=$(element).progressTimer({
               timeLimit: 25,
               onFinish: function () {                   
               }
            });
        }
    }
}); 

app.directive('autokomplete', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            $(element).autocomplete({
                source:  function (request, response) {
                    var arrayRecords=[];                    

                   // scope.queryTableByName("User")
                    //.then(function(userRecords){ 

                        //scope.queryTableByName("Role")
                        //.then(function(roleRecords){ 
                            var userRecords=scope.userRecords;
                            if(userRecords.length>0){
                                for(var i=0;i<userRecords.length;i++){
                                    arrayRecords.push(CB.toJSON( userRecords[i] ));
                                }
                            }
                            
                            var roleRecords=scope.roleRecords;  
                            if(roleRecords.length>0){
                                for(var j=0;j<roleRecords.length;j++){
                                    arrayRecords.push(CB.toJSON( roleRecords[j] ));
                                }
                            }                                           
                            var details;
                           //data :: JSON list defined
                            response($.map(arrayRecords, function (value, key) { 
                                details={
                                    value  : value._id,
                                    player : value._tableName
                                };

                                if(value._tableName=="User"){
                                    details.name=value.username;
                                    details.icon='<i class="icon ion-person-stalker"></i>';
                                    details.label=value._tableName+"-"+value.username+"("+value._id+")";
                                }
                                if(value._tableName=="Role"){
                                    details.name=value.name;
                                    details.icon='<i class="icon ion-unlocked"></i>';
                                    details.label=value._tableName+"-"+value.name+"("+value._id+")";
                                }                                                                                          
                               
                                return details;
                            }));
                        //});                       
                    //}); 
                  
                },                
                select: function (event, ui) {
                    scope.newACLSpinner=true;

                    if(scope.addACL.length>0){
                        var acl = _.find(scope.addACL, function(obj){ 
                            if(obj.id==ui.item.value){
                                return obj;
                            } 
                        });
                        if(!acl){
                            var aclObj={};
                            aclObj.id=ui.item.value;
                            aclObj.name=ui.item.name;
                            aclObj.icon=ui.item.icon;
                            aclObj.player=ui.item.player;
                            aclObj.read=null;
                            aclObj.write=null;

                            scope.addACL.push(aclObj);
                            $("#acl-search-id").val(null);
                            setTimeout(function(){ 
                                $("#acl-search-id").val(null); 
                                scope.newACLSpinner=false;
                            }, 500);   
                        }
                        scope.newACLSpinner=false;

                    }else{
                        var aclObj={};
                        aclObj.id=ui.item.value;
                        aclObj.name=ui.item.name;
                        aclObj.icon=ui.item.icon;
                        aclObj.player=ui.item.player;
                        aclObj.read=null;
                        aclObj.write=null;

                        scope.addACL.push(aclObj); 
                        $("#acl-search-id").val(null);
                        setTimeout(function(){ 
                            $("#acl-search-id").val(null); 
                            scope.newACLSpinner=false;
                        }, 500); 
                    }                
                }
            });
        }
    };
});

app.directive('tristate', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            $(element).tristate({
                change: function(state, value) {
                    var settingName=$(this).data("access");
                    var player=$(this).data("player");
                    var playerId=$(this).data("playerid");
                    scope.setACL(player,settingName,value,playerId);
                },
                checked:true,
                unchecked:null,
                indeterminate:false
            });
        }
    }
}); 

function appIdValidation(appId){
    var appIdValidationError=null;
    var response=true;
    //LowerCase
    if((appId) && (appId!= appId.toLowerCase())){
      response=false;
      appIdValidationError="App Id must be in lowercase.";                             
    }

    //Shouldn't Start with number
    if((appId) && (!isNaN(appId[0]))){
      response=false;
      appIdValidationError="App Id Shouldn't start with number.";         
    } 

    //No Special characters
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if((appId) && (pattern.test(appId))){
      response=false;
      appIdValidationError="App Id shoudn't contain special characters";         
    }                 

    return appIdValidationError;
}


    






