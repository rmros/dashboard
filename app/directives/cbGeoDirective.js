
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
            if(!$scope.geoPointValidation('longitude',$scope.editableGeopoint.longitude)){
              $scope.geoPointValidation('latitude',$scope.editableGeopoint.latitude);    
            }
            if(valid && !$scope.geopointEditError){
              $scope.save({updateGeo:$scope.editableGeopoint});
            }  
          };    

          //Validation
          $scope.geoPointValidation=function(type,value){
            $scope.geopointEditError=null;
            if(type=="latitude"){

                if(!value || value<-90 || value>90){
                  $scope.geopointEditError={
                    type:type,
                    msg:"Latitude must be in between -90 to 90"
                  };
                  
                }else{
                  $scope.geopointEditError=null;
                }    
            }
            if(type=="longitude"){

                if(!value || value<-180 || value>180){
                  $scope.geopointEditError={
                    type:type,
                    msg:"Longitude must be in between -180 to 180"
                  };
                }else{
                  $scope.geopointEditError=null;
                }    
            }
            return $scope.geopointEditError;
          };

        }]    
    };
});
