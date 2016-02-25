
app.directive('cbGeo', function(){
    return {
        restrict: 'E',
        transclude: true,        
        scope: {
          'editableGeopoint': '=geo', 
          'editableColumn': '=column',          
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/geoTemplate.html',       
        controller:['$scope','$rootScope',function($scope,$rootScope) { 
         
          //Set And Save
          $scope.setAndSaveGeopoint=function(valid){
            if(!$scope.editableGeopoint.longitude && $scope.editableGeopoint.longitude!=0){
              $scope.geopointEditError="Longitude must be in between -180 to 180";
            }

            if(!$scope.editableGeopoint.latitude && $scope.editableGeopoint.latitude!=0){
              $scope.geopointEditError="Latitude must be in between -90 to 90";
            }
            $scope.geopointEditError=_geoPointValidation($scope.editableGeopoint);

            if(!$scope.geopointEditError){
              if(valid && !$scope.geopointEditError){
                $scope.save({updateGeo:$scope.editableGeopoint});
              }
            }            
              
          };    

          //Validation
          function _geoPointValidation(geoPointObj){          
            if(geoPointObj.latitude<-90 || geoPointObj.latitude>90){                 
              return "Latitude must be in between -90 to 90";                  
            }            
            
            if(geoPointObj.longitude<-180 || geoPointObj.longitude>180){
              return "Longitude must be in between -180 to 180";                 
            } 
           
            return null;
          };

        }]    
    };
});
