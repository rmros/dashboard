app.directive('devautokomplete', function($timeout,userService){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            $(element).autocomplete({
                source:  function (request, response) {
                                     
                    scope.requestInviteEmail=request.term;
                    userService.searchDevelopers(request.term)
                    .then(function(list){
                        scope.searchedUsers=list;

                      var details;
                      if(list && list.length>0){
                        response($.map(list, function (value, key) { 
                            details={                               
                                label  : value.name+" ("+value.email+")",
                                useremail  : value.email                              
                            };                           
                                                 
                            return details;
                        }));
                      }else{
                        return null;
                      }
                                                                       
                    },function(error){                
                    });           
                  
                },                
                select: function (event, ui) { 
                    if(ui.item.useremail){
                        scope.requestInviteEmail=ui.item.useremail;
                    }                      
                }
            });
        }
    };
});