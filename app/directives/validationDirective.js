
app.directive('appNameValidation', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).keyup(function(){
              var error=scope.newApp.name.indexOf(".");               
              if(error>-1){
                $(element)[0].setCustomValidity("App Name shoudn't have dots(.)");
              }else{
                $(element)[0].setCustomValidity("");
              } 

              if(scope.newApp.name && scope.newApp.name.length>13){
                $(element)[0].setCustomValidity("App Name shoudn't exceed 13 characters.");
              }               
                                
            });
        }
    };
});

app.directive('appIdValidation', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).keyup(function(){
               
              var error=appIdValidation(scope.newApp.appId);
              if(error){
                $(element)[0].setCustomValidity(error);
              }else{
                $(element)[0].setCustomValidity("");
              }                
                                
            });
        }
    };
});


function appIdValidation(appId){
    var appIdValidationError=null;
    var response=true;
    //LowerCase
    if((appId) && (appId!= appId.toLowerCase())){
      response=false;
      appIdValidationError="App Id must be in lowercase.";                             
    }

    //Shouldn't Start with number
    if((appId) && (!isNaN(appId[0]))){
      response=false;
      appIdValidationError="App Id Shouldn't start with number.";         
    } 

    //No Special characters
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if((appId) && (pattern.test(appId))){
      response=false;
      appIdValidationError="App Id shoudn't contain special characters";         
    }                 

    return appIdValidationError;
}


    






