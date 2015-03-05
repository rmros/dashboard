app.factory('componentService', ['utilityService','componentTypeService', function (utilityService,componentTypeService) {
    
    var global = {};
    
    global.makeComponent = function(id, componentType,top,left){
        
        var data = {
                          type:'component',
                          text : componentType.text,
                          id:id,
                          componentType:componentType,
                          top : top,
                          left:left,
                          data : []
                    };

        for(var i=0;i<data.componentType.in.length;i++){
          data.data.push({}); //push an empty object.
        }
        
        return data;
    };
    

    global.makeStartComponent = function (top,left){
        return global.makeComponent('0',componentTypeService.getStartComponentType(),top,left);
    };
    
    
    return global;

}]);