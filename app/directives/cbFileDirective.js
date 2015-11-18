
app.directive('cbFile', function(){
    return {
        restrict: 'E',
        transclude: true, 
        scope: {
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/fileTemplate.html',       
        controller:['$scope','$rootScope',function($scope,$rootScope) {           

            $scope.fileSelected=function(rawFile,fileObj){               
                $scope.fileInfo={};
                $scope.fileInfo.isSelected=true;               
                $scope.fileInfo.rawFile=rawFile;             
                $scope.fileInfo.obj=fileObj;
                $scope.fileInfo.extension=fileObj.name.split(".")[fileObj.name.split(".").length-1];                
            };

            $scope.saveFile=function(){
                $scope.save({fileObj:$scope.fileInfo.obj});
                $scope.removeFile();
            };

            $scope.removeFile=function(){
                $scope.fileInfo=null;
            };

            $scope.closeModal=function(){
                $scope.fileInfo=null;
            };
        }]    
    };
});
