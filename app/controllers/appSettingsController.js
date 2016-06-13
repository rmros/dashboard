app.controller('appSettingsController',
['$scope',
'$q',
'$rootScope',
'$stateParams', 
'$location',
'projectService',
'$timeout',
'appSettingsService',
function($scope,
$q,  
$rootScope,
$stateParams,
$location,
projectService,
$timeout,
appSettingsService){	    

  
  var id;
  $rootScope.showAppPanel=true;
  $rootScope.isFullScreen=false;
  $rootScope.page='appsettings'; 

  $scope.spinners={};

  $scope.generalSettings={
    category:"general",
    settings:{
      appName:null,
      appInProduction:false,
      appIcon:null
    }
  };

  $scope.emailSettings={
    category:"email",
    settings:{
      mandrill:{
        apiKey:null,
        enabled:true
      },
      mailgun:{
        apiKey:null,
        domain:null,
        enabled:false
      },
      fromEmail:null,
      fromName:null

    }
  };

  $scope.pushSettings={
    category:"push",
    settings:{
      apple:{
        certificates:[]
      },
      android:{
        credentials:[]
      },
      windows:{
        credentials:[]
      }
    }
  }; 

  $scope.authSettings={
    category:"auth",
    settings:{
      general:{
        enabled:true,
        callbackURL: null,
        primaryColor: "#549afc"        
      },
      custom:{
        enabled:true
      },
      sessions:{
        enabled:true,
        sessionLength: 30
      },
      signupEmail:{
        enabled:false,
        allowOnlyVerifiedLogins:false,        
        template:""        
      },
      resetPasswordEmail:{
        enabled:false,       
        template:""        
      },     
      facebook:{
        enabled:false,
        appId:null,
        appSecret:null,       
        attributes:_getFbAttributesList(),
        permissions:_getFbPermissions()
      },
      google:{
        enabled:false,
        appId:null,
        appSecret:null,       
        attributes:_getGoogleAttributesList(),
        permissions:_getGooglePermissions()
      },
      twitter:{
        enabled:false,
        appId:null,
        appSecret:null,      
        attributes:null,
        permissions:null
      },
      linkedIn:{
        enabled:false,
        appId:null,
        appSecret:null,       
        attributes:null,
        permissions:{
          r_basicprofile:true,
          r_emailaddress:false,
          rw_company_admin:false,
          w_share:false
        }
      },   
      github:{
        enabled:false,
        appId:null,
        appSecret:null,       
        attributes:{
          user:{
            enabled: true,
            scope: 'user'
          },
          userEmail:{
            enabled: true,
            scope: 'user:email'
          }         
        },
        permissions:_getGithubPermissions()
      }
    }
  };

  $scope.facebook={
    moreAttributes:false,
    morePermissions:false
  };

  $scope.google={
    moreAttributes:false,
    morePermissions:false
  };

  $scope.github={
    moreAttributes:false,
    morePermissions:false
  };

  $scope.signupHtml={
    htmlMode:{
       css:{
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      },
      enabled:true
    },
    previewMode:{
       css:{
        cursor: "pointer"
      },
      enabled:false
    }   
  };

  $scope.resetPswdHtml={
    htmlMode:{
       css:{
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      },
      enabled:true
    },
    previewMode:{
       css:{
        cursor: "pointer"
      },
      enabled:false
    }   
  };


  $scope.fileAllowedTypes="*";//Files

  $scope.settingsMenu={
    general:true,
    email:false,
    push:false,
    auth:false
  };

  $scope.settingsMenuHover={
    general:false,
    email:false,
    push:false,
    auth:false
  }; 

  $scope.templateEditorOptions = {
      lineWrapping : false,
      lineNumbers: true,  
      theme:'monokai',     
      mode : "text/html"             
  };

  $scope.authPageSimilate={
    authenticateSpinner:false,
    authenticateError:null,
    isLogin:true,
    forgotPasswordPage:false,
    forgotPasswordSpinner:false,
    forgotPwdError:null
  };
  
  $scope.init= function() {  

    id = $stateParams.appId;   

    $rootScope.pageHeaderDisplay="App Settings";

    var promises=[];
    promises.push(_getDefaultTemplate("reset-password"));
    promises.push(_getDefaultTemplate("sign-up"));    

    $q.all(promises).then(function(list){

      $scope.authSettings.settings.resetPasswordEmail.template=list[0];
      $scope.authSettings.settings.signupEmail.template=list[1];      

      if($rootScope.currentProject && $rootScope.currentProject.appId === id){
        //if the same project is already in the rootScope, then dont load it.
        getSettings();                                
      }else{
        loadProject(id);              
      }

    },function(error){

      if($rootScope.currentProject && $rootScope.currentProject.appId === id){
        //if the same project is already in the rootScope, then dont load it.
        getSettings();                                
      }else{
        loadProject(id);              
      }
      
    });


    //Add Callback URL with appId
    $scope.loginPageURL=SERVER_URL+"/page/"+id+"/authentication";
    $scope.fbCallbackURL=SERVER_URL+"/auth/"+id+"/facebook/callback";
    $scope.googleCallbackURL=SERVER_URL+"/auth/"+id+"/google/callback";
    $scope.twitterCallbackURL=SERVER_URL+"/auth/"+id+"/twitter/callback";
    $scope.linkedInCallbackURL=SERVER_URL+"/auth/"+id+"/linkedin/callback";
    $scope.githubCallbackURL=SERVER_URL+"/auth/"+id+"/github/callback";

  };

  $scope.updateSettings=function(categoryName){

    var settingsObj=null;
    var validate=false;
    var validateMsg=null;

    if(categoryName=="general"){
      settingsObj=$scope.generalSettings.settings;
      validate=true;
      validateMsg=null;
    }
    if(categoryName=="email"){
      settingsObj=$scope.emailSettings.settings;
      if(((settingsObj.mailgun.domain && settingsObj.mailgun.apiKey) || settingsObj.mandrill.apiKey) && settingsObj.fromEmail){
        validate=true;

        if(settingsObj.mailgun.enabled){
          settingsObj.mandrill.apiKey=null;
        }
        if(settingsObj.mandrill.enabled){
          settingsObj.mailgun.apiKey=null;
          settingsObj.mailgun.domain=null;
        }

        if(!__isDevelopment){
          /****Tracking*********/            
           mixpanel.track('Save Email Settings', {"appId": $rootScope.currentProject.appId});
          /****End of Tracking*****/
        }

      }else{
        validate=false;
        validateMsg="All Mandrill API Key,From Email,From Name are required";
      }
    }
    if(categoryName=="push"){
      settingsObj=$scope.pushSettings.settings; 
      validate=true;
      validateMsg=null;
      if(!__isDevelopment){
        /****Tracking*********/              
         mixpanel.track('Save Push Settings', {"App id": $rootScope.currentProject.appId});
        /****End of Tracking*****/
      }     

    }

    if(categoryName=="auth"){
      settingsObj=$scope.authSettings.settings; 

      validate=true;
      validateMsg=_validateSocialFields(settingsObj);
      if(validateMsg){
        validate=false;
      }else{
        /****Tracking*********/            
         mixpanel.track('Save Auth Settings', {"appId": $rootScope.currentProject.appId});
        /****End of Tracking*****/ 
      }           
    }
    
    if(validate){
   
      $scope.spinners[categoryName]=true;
      appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,categoryName,settingsObj)
      .then(function(settings){
        $scope.spinners[categoryName]=false;                                    
      }, function(error){ 
        $scope.spinners[categoryName]=false;                
      });

    }else{
      WarningNotify(validateMsg);
    }
  };  

  $scope.initAddAppIcon=function(){
    $scope.editableFile=null;
    $("#md-appsettingsfileviewer").modal();
  };

  $scope.removeAppIcon=function(){
    $scope.generalSettings.settings.appIcon=null;
  };

  $scope.initAddAppleCertificate=function(){
    $scope.editableFile=null;
    $("#md-appsettingsfileviewer").modal();
  };

  $scope.saveFile=function(file){
    if(file){
      var names=file.name.split(".");

      //App Icon
      if($scope.settingsMenu.general){
        if(names[1]=="png"){
          $("#md-appsettingsfileviewer").modal("hide");

          appSettingsService.upsertAppSettingFile($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,file,"general")
          .then(function(resp){
            $scope.generalSettings.settings.appIcon=resp;
          },function(error){
            errorNotify("Error on saving app icon, try again..");
          });
          
        }else{
          errorNotify("Only .PNG is allowed");
        }
      }

      //Apple Certificate
      if($scope.settingsMenu.push){
        if(names[1]=="p12"){
          $("#md-appsettingsfileviewer").modal("hide");

          appSettingsService.upsertAppSettingFile($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,file,"push")
          .then(function(resp){

            if($scope.pushSettings.settings.apple.certificates.length==0){
              $scope.pushSettings.settings.apple.certificates.push(resp);
            }else if($scope.pushSettings.settings.apple.certificates.length>0){
              $scope.pushSettings.settings.apple.certificates[0]=resp;
            }

          },function(error){
            errorNotify("Error on saving apple certificate, try again..");
          });
          
        }else{
          errorNotify("Only .P12 is allowed");
        }
      }

    }    
  };

  //Toggler
  $scope.selectSettings=function(settingsName){
    if(settingsName=="general"){
      $scope.settingsMenu.general=true;
      $scope.settingsMenu.email=false;
      $scope.settingsMenu.push=false;
      $scope.settingsMenu.auth=false;
    }
    if(settingsName=="email"){
      $scope.settingsMenu.general=false;
      $scope.settingsMenu.email=true;
      $scope.settingsMenu.push=false;
      $scope.settingsMenu.auth=false;
    }
    if(settingsName=="push"){
      $scope.settingsMenu.general=false;
      $scope.settingsMenu.email=false;
      $scope.settingsMenu.push=true;
      $scope.settingsMenu.auth=false;
    }
    if(settingsName=="auth"){
      $scope.settingsMenu.general=false;
      $scope.settingsMenu.email=false;
      $scope.settingsMenu.push=false;
      $scope.settingsMenu.auth=true;
    }
  }; 

  $scope.menuHover=function(settingsName){
    if(settingsName=="general" && !$scope.settingsMenu.general && !$scope.settingsMenuHover.general){     
      $scope.settingsMenuHover.general=true;
    }    

    if(settingsName=="email" && !$scope.settingsMenu.email && !$scope.settingsMenuHover.email){
      $scope.settingsMenuHover.email=true;
    }
   
    if(settingsName=="push" && !$scope.settingsMenu.push && !$scope.settingsMenuHover.push){
      $scope.settingsMenuHover.push=true;
    }

    if(settingsName=="auth" && !$scope.settingsMenu.auth && !$scope.settingsMenuHover.auth){
      $scope.settingsMenuHover.auth=true;
    }
    
  };

  $scope.menuLeave=function(settingsName){
    
    if(settingsName=="general" && !$scope.settingsMenu.general && $scope.settingsMenuHover.general){     
      $scope.settingsMenuHover.general=false;
    }
    
    if(settingsName=="email" && !$scope.settingsMenu.email && $scope.settingsMenuHover.email){
      $scope.settingsMenuHover.email=false;
    }
    
    if(settingsName=="push" && !$scope.settingsMenu.push && $scope.settingsMenuHover.push){
      $scope.settingsMenuHover.push=false;
    }

    if(settingsName=="auth" && !$scope.settingsMenu.auth && $scope.settingsMenuHover.auth){
      $scope.settingsMenuHover.auth=false;
    }
  }; 

  $scope.toggleSignupEmail=function(mode){    
    if(mode=="html"){
      $scope.signupHtml.htmlMode.enabled=true;
      $scope.signupHtml.htmlMode.css={
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      };
      $scope.signupHtml.previewMode.enabled=false;
      $scope.signupHtml.previewMode.css={
        cursor: "pointer"        
      };
    }

    if(mode=="preview"){
      $scope.signupHtml.previewMode.enabled=true;
      $scope.signupHtml.previewMode.css={
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      };

      $scope.signupHtml.htmlMode.enabled=false;
      $scope.signupHtml.htmlMode.css={
        cursor: "pointer"        
      };
    }

  };

  $scope.toggleResetPswdEmail=function(mode){    
    if(mode=="html"){
      $scope.resetPswdHtml.htmlMode.enabled=true;
      $scope.resetPswdHtml.htmlMode.css={
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      };
      $scope.resetPswdHtml.previewMode.enabled=false;
      $scope.resetPswdHtml.previewMode.css={
        cursor: "pointer"        
      };
    }

    if(mode=="preview"){
      $scope.resetPswdHtml.previewMode.enabled=true;
      $scope.resetPswdHtml.previewMode.css={
        cursor: "pointer",
        "border-bottom": "1px solid #488ff9",
        color: "#488ff9"
      };

      $scope.resetPswdHtml.htmlMode.enabled=false;
      $scope.resetPswdHtml.htmlMode.css={
        cursor: "pointer"        
      };
    }

  };
  
  $scope.toggleEmailConfig=function(option){    
    if(option=="mandrill"){
      $scope.emailSettings.settings.mandrill.enabled=true;
      $scope.emailSettings.settings.mailgun.enabled=false;      
    }
    if(option=="mailgun"){
      $scope.emailSettings.settings.mandrill.enabled=false;
      $scope.emailSettings.settings.mailgun.enabled=true;       
    }
  };

  $scope.toggleFbAttributes=function(bool){    
    $scope.facebook.moreAttributes=bool;
  };

  $scope.toggleFbPermissions=function(bool){    
    $scope.facebook.morePermissions=bool;
  };  

  $scope.toggleGooglePermissions=function(bool){    
    $scope.google.morePermissions=bool;
  };

  $scope.toggleGithubPermissions=function(bool){    
    $scope.github.morePermissions=bool;
  };

  $scope.authSimilateAuth=function(authPage){
    if(authPage=="login"){
      $scope.authPageSimilate.isLogin=true;
    }
    if(authPage=="signup"){
      $scope.authPageSimilate.isLogin=false;
    }
  };

  $scope.similateToForgotPwd=function(bool){
    $scope.authPageSimilate.forgotPasswordPage=bool;
  }; 

  $scope.loginUrlClick=function(){
    $scope.loginUrlClippr=true;
  };
  $scope.loginUrlOutsideClick=function(){
    $scope.loginUrlClippr=false;
  };
  


/********************************Private fuctions****************************/
  function loadProject(id){ 
    //$scope.settingsLoading=true;  
    projectService.getProject(id)
    .then(function(currentProject){
      if(currentProject){
        $rootScope.currentProject=currentProject; 
        getSettings();                
      }                              
    }, function(error){ 
      console.log(error); 
      $scope.settingsLoading=false;          
    });   
  }	

  function getSettings(){ 
    //$scope.settingsLoading=true;  
    appSettingsService.getSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master)
    .then(function(settings){

      if(settings && settings.length>0){

        var general=_.where(settings, {category: "general"});
        if(general && general.length>0){
          $scope.generalSettings=general[0];
        } 

        var email=_.where(settings, {category: "email"});
        if(email && email.length>0){
          $scope.emailSettings=email[0];
        } 

        var push=_.where(settings, {category: "push"});
        if(push && push.length>0){
          $scope.pushSettings=push[0];
        }

        var auth=_.where(settings, {category: "auth"});
        if(auth && auth.length>0){
          $scope.authSettings=auth[0];
        }

        $scope.settingsLoading=false;        

      }else{
        var promises=[];
        promises.push(appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,"general",$scope.generalSettings.settings));
        promises.push(appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,"email",$scope.emailSettings.settings));
        promises.push(appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,"push",$scope.pushSettings.settings));
        promises.push(appSettingsService.putSettings($rootScope.currentProject.appId,$rootScope.currentProject.keys.master,"auth",$scope.authSettings.settings));

        $q.all(promises).then(function(settings){
          $scope.settingsLoading=false;                                               
        }, function(error){ 
          $scope.settingsLoading=false;            
        });
      }       
                                    
    }, function(error){ 
      $scope.settingsLoading=false;           
    });
 
  }   


  function _validateSocialFields(settings){

    
    if(!settings.custom.enabled && !settings.facebook.enabled && !settings.google.enabled && !settings.twitter.enabled && !settings.linkedIn.enabled && !settings.github.enable){
      return "You need to enable atleast one authentication provider.";
    }   

    if(settings.general.callbackURL && !_validateUrl(settings.general.callbackURL)){
      return "App callbackURL is invalid.";
    }

    if(!_validateNumber(settings.sessions.sessionLength)){
      return "Invalid Session Length, should be a number.";
    }

    if(Number(settings.sessions.sessionLength)<1 || Number(settings.sessions.sessionLength)>365){
      return "Session Length should be in between 1 to 365";
    }

    if(settings.facebook.enabled){
      if(!settings.facebook.appId || !settings.facebook.appSecret){
        return "Facebook App ID and App Secret is required.";
      }
    }

    if(settings.google.enabled){
      if(!settings.google.appId || !settings.google.appSecret){
        return "Google App ID and App Secret is required.";
      }
    }

    if(settings.twitter.enabled){
      if(!settings.twitter.appId || !settings.twitter.appSecret){
        return "Twitter Consumer Key and Consumer Secret is required.";
      }
    }

    if(settings.linkedIn.enabled){
      if(!settings.linkedIn.appId || !settings.linkedIn.appSecret){
        return "LinkedIn Consumer Key and Consumer Secret is required.";
      }
    }

    if(settings.github.enabled){
      if(!settings.github.appId || !settings.github.appSecret){
        return "GitHub App ID and App Secret is required.";
      }
    }

    return null;
  } 


  function _validateUrl(url){

    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(url);

  }

  function _validateNumber(num){
    if(num && num!=""){
        var tempData=angular.copy(num);     
        num=Number(num);        
        if(num.toString()!=tempData){
          return false;          
        }      
    }else{
      return false;
    }     
    return true;
  }

  function _getDefaultTemplate(templateName){ 
    var q=$q.defer();

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
      if(xmlhttp.status === 200 && xmlhttp.readyState === 4){
        q.resolve(xmlhttp.responseText);
      }
      if(xmlhttp.status !== 200 && xmlhttp.status!==0){
        q.reject("Failed to load default email template");
      }
    };
    xmlhttp.open("GET","assets/files/"+templateName+".html",true);
    xmlhttp.send();

    return  q.promise;
  }

  function _getFbAttributesList(){
    return {
          id:true,
          about:false,
          age_range:false,
          bio:false,
          birthday:false,
          context:false,
          cover:false,
          currency:false,
          devices:false,
          education:false,
          email:false,
          favorite_athletes:false,
          favorite_teams:false,
          first_name:false,
          gender:false,
          hometown:false,
          inspirational_people:false,
          install_type:false,
          installed:false,
          interested_in:false,
          is_shared_login:false,
          is_verified:false,
          languages:false,
          last_name:false,
          link:false,
          locale:false,
          location:false,
          meeting_for:false,
          middle_name:false,
          name:false,
          name_format:false,
          payment_pricepoints:false,
          political:false,
          public_key:false,
          quotes:false,
          relationship_status:false,
          religion:false,
          security_settings:false,
          shared_login_upgrade_required_by:false,
          significant_other:false,
          sports:false,
          test_group:false,
          third_party_id:false,
          timezone:false,
          token_for_business:false,
          updated_time:false,
          verified:false,
          video_upload_limits:false,
          viewer_can_send_gift:false,
          website:false,
          work:false
        }
  }

  function _getFbPermissions(){
    return {
      public_profile:{
        enabled:true,
        scope:"public_profile"
      },
      user_friends:{
        enabled:false,
        scope:"user_friends"
      },
      email:{
        enabled:false,
        scope:"email"
      },
      user_about_me:{
        enabled:false,
        scope:"user_about_me"
      },
      "user_actions_books":{
        enabled:false,
        scope:"user_actions.books"
      },
      "user_actions_fitness":{
        enabled:false,
        scope:"user_actions.fitness"
      },
      "user_actions_music":{
        enabled:false,
        scope:"user_actions.music"
      },
      "user_actions_news":{
        enabled:false,
        scope:"user_actions.news"
      },
      "user_actions_video":{
        enabled:false,
        scope:"user_actions.video"
      },     
      user_birthday:{
        enabled:false,
        scope:"user_birthday"
      },
      user_education_history:{
        enabled:false,
        scope:"user_education_history"
      },
      user_events:{
        enabled:false,
        scope:"user_events"
      },
      user_games_activity:{
        enabled:false,
        scope:"user_games_activity"
      },
      user_hometown:{
        enabled:false,
        scope:"user_hometown"
      },
      user_likes:{
        enabled:false,
        scope:"user_likes"
      },
      user_location:{
        enabled:false,
        scope:"user_location"
      },
      user_managed_groups:{
        enabled:false,
        scope:"user_managed_groups"
      },
      user_photos:{
        enabled:false,
        scope:"user_photos"
      },
      user_posts:{
        enabled:false,
        scope:"user_posts"
      },
      user_relationships:{
        enabled:false,
        scope:"user_relationships"
      },
      user_relationship_details:{
        enabled:false,
        scope:"user_relationship_details"
      },
      user_religion_politics:{
        enabled:false,
        scope:"user_religion_politics"
      },
      user_tagged_places:{
        enabled:false,
        scope:"user_tagged_places"
      },
      user_videos:{
        enabled:false,
        scope:"user_videos"
      },
      user_website:{
        enabled:false,
        scope:"user_website"
      },
      user_work_history:{
        enabled:false,
        scope:"user_work_history"
      },
      read_custom_friendlists:{
        enabled:false,
        scope:"read_custom_friendlists"
      },
      read_insights:{
        enabled:false,
        scope:"read_insights"
      },
      read_audience_network_insights:{
        enabled:false,
        scope:"read_audience_network_insights"
      },
      read_page_mailboxes:{
        enabled:false,
        scope:"read_page_mailboxes"
      },
      manage_pages:{
        enabled:false,
        scope:"manage_pages"
      },
      publish_pages:{
        enabled:false,
        scope:"publish_pages"
      },
      publish_actions:{
        enabled:false,
        scope:"publish_actions"
      },
      rsvp_event:{
        enabled:false,
        scope:"rsvp_event"
      },
      pages_show_list:{
        enabled:false,
        scope:"pages_show_list"
      },
      pages_manage_cta:{
        enabled:false,
        scope:"pages_manage_cta"
      },
      pages_manage_instant_articles:{
        enabled:false,
        scope:"pages_manage_instant_articles"
      },
      ads_read:{
        enabled:false,
        scope:"ads_read"
      },
      ads_management:{
        enabled:false,
        scope:"ads_management"
      }
    }
  }


  function _getGoogleAttributesList(){
    return {          
      'userinfoProfile':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      },
      'userinfoEmail':{
        enabled: true,
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      }
    }
  }

  function _getGooglePermissions(){
    return{
      'contacts':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/contacts'
      },
      'blogger':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/blogger'
      },
      'calendar':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/calendar'
      },
      'gmail':{
        enabled: false,
        scope: 'https://mail.google.com/'
      }, 
      'googlePlus':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/plus.login'
      },     
      'youtube':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/youtube'
      },
      'books':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/books'
      },
      'drive':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/drive'
      },
      'coordinates':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/coordinate'
      },     
      'picasa':{
        enabled: false,
        scope: 'https://picasaweb.google.com/data/'
      },
      'spreadsheets':{
        enabled: false,
        scope: 'https://spreadsheets.google.com/feeds/'
      },
      'webmasters':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/webmasters'
      },
      'tasks':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/tasks'
      },
      'analytics':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/analytics'
      },
      'UrlShortener':{
        enabled: false,
        scope: 'https://www.googleapis.com/auth/urlshortener'
      }
    }
  }

  function _getGithubPermissions(){
    return {  
      userFollow:{
        enabled: true,
        scope: 'user:follow'
      },   
      public_repo:{
        enabled: false,
        scope: 'public_repo'
      },
      repo:{
        enabled: false,
        scope: 'repo'
      },
      repo_deployment:{
        enabled: false,
        scope: 'repo_deployment'
      },
      repoStatus:{
        enabled: false,
        scope: 'repo:status'
      },
      delete_repo:{
        enabled: false,
        scope: 'delete_repo'
      },
      notifications:{
        enabled: false,
        scope: 'notifications'
      },
      gist:{
        enabled: false,
        scope: 'gist'
      },
      readRepoHook:{
        enabled: false,
        scope: 'read:repo_hook'
      },
      writeRepoHook:{
        enabled: false,
        scope: 'write:repo_hook'
      },
      adminRepoHook:{
        enabled: false,
        scope: 'admin:repo_hook'
      },
      adminOrgHook:{
        enabled: false,
        scope: 'admin:org_hook'
      },
      readOrg:{
        enabled: false,
        scope: 'read:org'
      },
      writeOrg:{
        enabled: false,
        scope: 'write:org'
      },
      adminOrg:{
        enabled: false,
        scope: 'admin:org'
      },
      readPublicKey:{
        enabled: false,
        scope: 'read:public_key'
      },
      writePublicKey:{
        enabled: false,
        scope: 'write:public_key'
      },
      adminPublicKey:{
        enabled: false,
        scope: 'admin:public_key'
      },
      readGpgKey:{
        enabled: false,
        scope: 'read:gpg_key'
      },
      writeGpgKey:{
        enabled: false,
        scope: 'write:gpg_key'
      },
      adminGpgKey:{
        enabled: false,
        scope: 'admin:gpg_key'
      }
    }
  }
		
}]);
