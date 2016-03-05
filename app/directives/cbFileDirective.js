
app.directive('cbFile', function(){
    return {
        restrict: 'E',
        transclude: true,         
        scope: {
          'allowedFileTypes': '=filetype',
          'editableFile': '=edit', 
          'deleteFile': '&delete', 
          'save': '&save'
        },   
        templateUrl: 'app/directives/templates/fileTemplate.html',       
        controller:['$scope','$rootScope','cloudBoostApiService',function($scope,$rootScope,cloudBoostApiService) {           

            $scope.fileSelected=function(rawFile,fileObj){               
                $scope.fileInfo={};
                $scope.fileInfo.isSelected=true;               
                $scope.fileInfo.rawFile=rawFile;             
                $scope.fileInfo.obj=fileObj;
                $scope.fileInfo.extension=fileObj.name.split(".")[fileObj.name.split(".").length-1]; 
                $scope.fileInfo.spinner=false;
                $scope.fileInfo.progress=0;
                $scope.fileInfo.error=null;
                
                $("#selectd-file-img").attr("src",rawFile); 
                $scope.$digest();              
            };

            $scope.saveFile=function(){

                $scope.fileInfo.spinner=true;
                $scope.fileInfo.error=null;
                $scope.fileInfo.progress=0;
                cloudBoostApiService.getCBFile($scope.fileInfo.obj,function(cloudBoostFile){
                    $scope.fileInfo.error=null;                    
                    $scope.fileInfo.progress=100;
                    $scope.save({fileObj:cloudBoostFile});
                    $scope.removeFile();
                    $scope.$digest();                    
                },function(error){ 
                    $scope.fileInfo.spinner=false;                
                    $scope.fileInfo.error=error;
                    $scope.$digest();                    
                },function(uploadProgress){  
                    uploadProgress=uploadProgress*100;
                    uploadProgress=Math.round(uploadProgress);

                    $scope.fileInfo.progress=uploadProgress;
                    $scope.$digest();   
                });              
                
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
