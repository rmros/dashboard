
app.directive('cbSearchObjects', function(){
    return {
        restrict: 'E',
        transclude: true,       
        scope: {
          'relationTableData': '=objectlist', 
          'tableDef': '=table', 
          'searchRelDocsError': '=error',                   
          'link': '&link'
        },   
        templateUrl: 'app/directives/templates/searchCloudObjectsTemplate.html',       
        controller:['$scope','$rootScope',function($scope,$rootScope) {  
          
          $scope.linkRecord=function(record){
            $scope.link({cbRecord:record});
          };

          $scope.goToDataBrowser=function(t){  
            $("#md-searchreldocument").modal("hide");
            $("#md-mdlistcommontypes").modal("hide");;     
            window.location.href="#/"+$rootScope.currentProject.appId+"/table/"+t.name;
          };

        }]    
    };
});
