app.controller('emailCampaignController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'emailCampaignService',
'cloudBoostApiService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
emailCampaignService,
cloudBoostApiService){	
  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='email'; 

  $scope.pushData={
    subject:null,
    body:null
  }; 

  $scope.sendPushSpinner=false; 


  $scope.init= function() {
    id = $stateParams.appId;

    if($rootScope.currentProject && $rootScope.currentProject.appId === id){
      //if the same project is already in the rootScope, then dont load it.
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;                    
    }else{
      loadProject(id);              
    }
  };

  $scope.sendCampaign = function(){
      var valid = true;
      var toValidate = ['subject','body']
      toValidate.forEach(function(x){
        if($scope.pushData[x] == null || $scope.pushData[x] == ''){
          errorNotify( x+ " of email is required" );
          valid = false
        }
      })
      if(valid){
        $scope.sendPushSpinner=true;
        emailCampaignService.sendCampaign($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,$scope.pushData.subject,$scope.pushData.body)
        .then(function(data){
          $scope.sendPushSpinner=false;
          $scope.pushData={
            subject:null,
            body:null
          }; 
          successNotify( "Email campaign successful." );
        },function(err){
          err = JSON.parse(err)
          if(err.error == "No users found"){
            errorNotify( "Currently there are no users to initiate an email campaign." );
          } else if(err.error == "Email Configuration is not found."){
            errorNotify( "You have not yet configured any email for this application." );
          } else {
            errorNotify( "Somthing went wrong, please try again later." );
          }
          $scope.pushData={
            subject:null,
            body:null
          }; 
          $scope.sendPushSpinner=false;
        })
      }
  }



  //Private Functions
  function loadProject(id){
    
    if($rootScope.currentProject){
      $rootScope.pageHeaderDisplay=$rootScope.currentProject.name; 
    }else{
      projectService.getProject(id)
      .then(function(currentProject){
        if(currentProject){
          $rootScope.currentProject=currentProject;
          $rootScope.pageHeaderDisplay=$rootScope.currentProject.name;
        }                              
      }, function(error){          
      });
    }
    
  }

}]);
