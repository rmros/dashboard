app.directive('autokomplete', function($timeout){
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
                            $timeout(function(){ 
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
                        $timeout(function(){ 
                          $("#acl-search-id").val(null); 
                          scope.newACLSpinner=false;          
                        }, 500);
                    }                
                }
            });
        }
    };
});