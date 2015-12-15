app.directive('devautokomplete', function($timeout,userService){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            $(element).autocomplete({
                source:  function (request, response) {
                                     

                    userService.searchDevelopers(request.term)
                    .then(function(list){
                        scope.searchedUsers=list;

                      var details;
                      if(list && list.length>0){
                        response($.map(list, function (value, key) { 
                            details={
                                value  : value._id, 
                                label  : value.name+" ("+value.email+")"                              
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
                  
                    scope.requestInviteId=ui.item.value;

                }
            });
        }
    };
});