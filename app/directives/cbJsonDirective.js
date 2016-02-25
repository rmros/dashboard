
app.directive('cbJson', function(){
    return {
        restrict: 'E',
        transclude: true,       
        scope: {
          'editableJsonObj': '=json', 
          'editableColumn': '=column',          
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/jsonTemplate.html',       
        controller:['$scope','$rootScope',function($scope,$rootScope) {

            $scope.setAndSaveJsonObject=function(){
                try {
                  var data=JSON.parse($scope.editableJsonObj);
                  if(typeof data!="object"){
                    $scope.commonError="Invalid Object";
                  }else{
                    $scope.save({updateJson:$scope.editableJsonObj});
                  }                      
                }
                catch(err) {
                  $scope.commonError="Invalid Object";
                }
            };
          
        }]    
    };
});
