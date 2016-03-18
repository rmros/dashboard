
app.directive('dashboardFile', function(){
    return {
        restrict: 'E',
        transclude: true,         
        scope: {
          'allowedFileTypes': '=filetype',
          'editableFile': '=edit', 
          'deleteFile': '&delete', 
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/dashboardFileTemplate.html',       
        controller:['$scope','$rootScope',function($scope,$rootScope) {           

            $scope.fileSelected=function(rawFile,fileObj){               
                $scope.fileInfo={};
                $scope.fileInfo.isSelected=true;               
                $scope.fileInfo.rawFile=rawFile;             
                $scope.fileInfo.obj=fileObj;
                $scope.fileInfo.extension=fileObj.name.split(".")[fileObj.name.split(".").length-1];                
                
                $("#selectd-file-img").attr("src",rawFile); 
                $scope.$digest();              
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
