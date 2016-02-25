app.directive('cbAcl', function(){
    return {
        restrict: 'E',
        transclude: true,       
        scope: {          
          'setAndSaveACLObject':'&save'         
        },   
        templateUrl: 'app/directives/templates/aclTemplate.html',       
        controller:['$scope','$rootScope','$q','cloudBoostApiService','sharedDataService',
        function($scope,$rootScope,$q,cloudBoostApiService,sharedDataService) {   

            //ACL          
            $scope.addACL=[];
            $scope.newACLSpinner=false;
            $scope.userRecords=[];
            $scope.roleRecords=[];
            $scope.aclPublic={
              id:"all",
              name:"Public",
              icon:"ion-person-stalker",
              player:"User",
              readValue:null,
              writeValue:null
            };            

            $scope.changeACL=function(player,settingName,bool,playerId,arrayName){
              if(arrayName=="newacl"){
                for(var i=0;i<$scope.addACL.length;++i){
                  if($scope.addACL[i].id==playerId){
                    if(settingName=="read"){
                      $scope.addACL[i].read=bool;
                    }else if(settingName=="write"){
                      $scope.addACL[i].write=bool;
                    }
                  }
                }
              }else if(arrayName=="user"){
                for(var i=0;i<$scope.aclUsers.length;++i){
                  if($scope.aclUsers[i].id==playerId){
                    if(settingName=="read"){
                      $scope.aclUsers[i].readValue=bool;
                    }else if(settingName=="write"){
                      $scope.aclUsers[i].writeValue=bool;
                    }
                  }
                  
                }

                //Public ACL
                if(playerId=="all"){
                  if(settingName=="read"){
                    $scope.aclPublic.readValue=bool;
                  }else if(settingName=="write"){
                    $scope.aclPublic.writeValue=bool;
                  }
                }

              }else if(arrayName=="role"){
                for(var i=0;i<$scope.aclRoles.length;++i){
                  if($scope.aclRoles[i].id==playerId){
                    if(settingName=="read"){
                      $scope.aclRoles[i].readValue=bool;
                    }else if(settingName=="write"){
                      $scope.aclRoles[i].writeValue=bool;
                    }
                  }
                }
              }
           
              $scope.setACL(player,settingName,bool,playerId,$scope.aclObject);              
                
            };

            $scope.setACL=function(player,settingName,bool,playerId,aclObject){  
              //User
              if(player=="User"){    
                //$scope.editableRow.ACL = new CB.ACL(); 
                if(settingName=="read"){
                  if(bool==true || bool==false){
                    aclObject.setUserReadAccess(playerId,bool);
                  }else if(bool==null){
                    var allowIndex=aclObject.document.read.allow.user.indexOf(playerId);
                    if(allowIndex>-1){
                      aclObject.document.read.allow.user.splice(allowIndex,1);
                    } 
                    var denyIndex=aclObject.document.read.deny.user.indexOf(playerId);
                    if(denyIndex>-1){
                      aclObject.document.read.deny.user.splice(denyIndex,1);
                    }       
                  }                  
                }

                if(settingName=="write"){      
                  if(bool==true || bool==false){
                    aclObject.setUserWriteAccess(playerId,bool);
                  }else if(bool==null){
                    var allowIndex=aclObject.document.write.allow.user.indexOf(playerId);
                    if(allowIndex>-1){
                      aclObject.document.write.allow.user.splice(allowIndex,1);
                    } 
                    var denyIndex=aclObject.document.write.deny.user.indexOf(playerId);
                    if(denyIndex>-1){
                      aclObject.document.write.deny.user.splice(denyIndex,1);
                    }
                  }
                }
              }  

              //Role
              if(player=="Role"){    
                //$scope.editableRow.ACL = new CB.ACL(); 
                if(settingName=="read"){
                  if(bool==true || bool==false){
                    aclObject.setRoleReadAccess(playerId,bool);
                  }else if(bool==null){
                    var allowIndex=aclObject.document.read.allow.role.indexOf(playerId);
                    if(allowIndex>-1){
                      aclObject.document.read.allow.role.splice(allowIndex,1);
                    } 
                    var denyIndex=aclObject.document.read.deny.role.indexOf(playerId);
                    if(denyIndex>-1){
                      aclObject.document.read.deny.role.splice(denyIndex,1);
                    }       
                  }
                  
                }
                if(settingName=="write"){      
                  if(bool==true || bool==false){
                    aclObject.setRoleWriteAccess(playerId,bool);
                  }else if(bool==null){
                    var allowIndex=aclObject.document.write.allow.role.indexOf(playerId);
                    if(allowIndex>-1){
                      aclObject.document.write.allow.role.splice(allowIndex,1);
                    } 
                    var denyIndex=aclObject.document.write.deny.role.indexOf(playerId);
                    if(denyIndex>-1){
                      aclObject.document.write.deny.role.splice(denyIndex,1);
                    }
                  }
                }
              }
                
            };

            $scope.removeACL=function(player,playerId,arrayName,aclObject){

              if(arrayName=="newacl"){
                for(var i=0;i<$scope.addACL.length;++i){
                  if($scope.addACL[i].id==playerId){
                    $scope.addACL.splice(i,1);
                  }
                }
              }else if(arrayName=="user"){
                for(var i=0;i<$scope.aclUsers.length;++i){
                  if($scope.aclUsers[i].id==playerId){
                    $scope.aclUsers.splice(i,1);
                  }
                }

              }else if(arrayName=="role"){
                for(var i=0;i<$scope.aclRoles.length;++i){
                  if($scope.aclRoles[i].id==playerId){
                    $scope.aclRoles.splice(i,1);
                  }
                }
              }

              if(player=="User"){
                var allowIndex=aclObject.document.read.allow.user.indexOf(playerId);
                if(allowIndex>-1){
                  aclObject.document.read.allow.user.splice(allowIndex,1);
                } 
                var denyIndex=aclObject.document.read.deny.user.indexOf(playerId);
                if(denyIndex>-1){
                  aclObject.document.read.deny.user.splice(denyIndex,1);
                }
              }  

              if(player=="Role"){
                var allowIndex=aclObject.document.read.allow.role.indexOf(playerId);
                if(allowIndex>-1){
                  aclObject.document.read.allow.role.splice(allowIndex,1);
                } 
                var denyIndex=aclObject.document.read.deny.role.indexOf(playerId);
                if(denyIndex>-1){
                  aclObject.document.read.deny.role.splice(denyIndex,1);
                }
              }  

              $("#acl-search-id").val(null);
            };

            $scope.save=function(){
              $scope.setAndSaveACLObject({cbaclobject:$scope.aclObject});
            };

            /****************************************Initialization************************************/
            $scope.sharedDataService=sharedDataService;
            $scope.$watch("sharedDataService.aclObject",function(newValue, oldValue) {
                if(newValue && (newValue!=oldValue)){                
                  $scope.aclObject = newValue;
                  initCbApp();
                  prepareACLDisplay(newValue);
                  $scope.addACL=[];
                  $scope.aclUsers=[];
                  $scope.aclRoles=[];
                  $scope.aclPublic={
                    id:"all",
                    name:"Public",
                    icon:"ion-person-stalker",
                    player:"User",
                    readValue:null,
                    writeValue:null
                  };

                  //Getting Users For Autocomplete
                  cloudBoostApiService.queryTableByName("User")
                  .then(function(userRecords){         
                    $scope.userRecords=userRecords;        
                  },function(error){         
                  });

                  //Getting Roles For Autocomplete
                  cloudBoostApiService.queryTableByName("Role")
                  .then(function(roleRecords){         
                    $scope.roleRecords=roleRecords;  
                  },function(error){ 
                  });
                }                 
            });           

            //Private functions
            function prepareACLDisplay(aclObject){
              $scope.aclRoles=[]; 
              $scope.aclUsers=[]; 

              //Role   
              var rolePromise=[];
              rolePromise.push(createACL("Role",aclObject.document.read.allow.role,"read","allow"));
              rolePromise.push(createACL("Role",aclObject.document.read.deny.role,"read","deny"));

              rolePromise.push(createACL("Role",aclObject.document.write.allow.role,"write","allow"));
              rolePromise.push(createACL("Role",aclObject.document.write.deny.role,"write","deny"));

              $q.all(rolePromise).then(function(dList){
                var readRoles=[];
                var writeRoles=[];

                if(dList[0].length>0){
                  readRoles=dList[0]; 
                }
                if(dList[1].length>0){
                  if(readRoles.length>0){
                    readRoles=roles.concat(dList[1]); 
                  }else{
                    readRoles=dList[1];
                  } 
                }

                if(dList[2].length>0){
                  writeRoles=dList[2]; 
                }
                if(dList[3].length>0){
                  if(writeRoles.length>0){
                    writeRoles=roles.concat(dList[3]); 
                  }else{
                    writeRoles=dList[3];
                  } 
                }
                
                for(var i=0;i<readRoles.length;++i){
                  for(var j=0;j<writeRoles.length;++j){
                    if(readRoles[i].id==writeRoles[j].id){
                      readRoles[i].writeValue=writeRoles[j].writeValue;
                      writeRoles.splice(j,1);
                    }
                  }
                }    

                $scope.aclRoles=readRoles.concat(writeRoles);
              },function(){
              });

              //User   
              var userPromise=[];
              userPromise.push(createACL("User",aclObject.document.read.allow.user,"read","allow"));
              userPromise.push(createACL("User",aclObject.document.read.deny.user,"read","deny"));

              userPromise.push(createACL("User",aclObject.document.write.allow.user,"write","allow"));
              userPromise.push(createACL("User",aclObject.document.write.deny.user,"write","deny"));

              $q.all(userPromise).then(function(dList){
                var readUsers=[];
                var writeUsers=[];

                if(dList[0].length>0){
                  readUsers=dList[0]; 
                }
                if(dList[1].length>0){
                  if(readUsers.length>0){
                    readUsers=roles.concat(dList[1]); 
                  }else{
                    readUsers=dList[1];
                  } 
                }

                if(dList[2].length>0){
                  writeUsers=dList[2]; 
                }
                if(dList[3].length>0){
                  if(writeUsers.length>0){
                    writeUsers=roles.concat(dList[3]); 
                  }else{
                    writeUsers=dList[3];
                  } 
                }

                if(readUsers.length>0){
                  for(var i=0;i<readUsers.length;++i){
                    if(writeUsers.length>0){
                      for(var j=0;j<writeUsers.length;++j){
                        if(readUsers[i].id==writeUsers[j].id){
                          readUsers[i].writeValue=writeUsers[j].writeValue;
                          //Special case (Public)          
                          if(readUsers[i].id==writeUsers[j].id && readUsers[i].id=="all"){
                            $scope.aclPublic.readValue=readUsers[i].readValue;
                            $scope.aclPublic.writeValue=readUsers[i].writeValue;
                          }
                          writeUsers.splice(j,1);
                        }          
                      }
                    }else{
                      //Special case (Public) 
                      if(readUsers[i].id=="all"){
                        $scope.aclPublic.readValue=readUsers[i].readValue;
                        $scope.aclPublic.writeValue=null;
                      }          
                    }
                    
                  }
                }else if(writeUsers.length>0){
                  for(var j=0;j<writeUsers.length;++j){            
                    //Special case (Public)          
                    if(writeUsers[j].id=="all"){
                      $scope.aclPublic.readValue=null;
                      $scope.aclPublic.writeValue=writeUsers[j].writeValue;
                    }                  
                  } 
                }
                

                $scope.aclUsers=readUsers.concat(writeUsers);
                   
              },function(){
              });

            }

            function createACL(tableName,array,readOrWrite,permission){
              var q=$q.defer();
              var returnList=[];

              if(array.length>0){
                var promises=[];
                for(var i=0;i<array.length;++i){
                  if(tableName && array[i]!="all"){
                    var tableDef= _.first(_.where($rootScope.currentProject.tables, {name: tableName})); 
                    promises.push(cloudBoostApiService.queryTableById(tableDef,array[i]));
                  }else if(array[i]=="all"){         

                      var jsonObj={};
                      jsonObj.id=array[i];                 
                      jsonObj.name="Public";
                      jsonObj.player=tableName;
                      
                      jsonObj.readValue=null;
                      jsonObj.writeValue=null;
                      
                      if(readOrWrite=="read" && permission=="allow"){  
                        jsonObj.readValue=true;                    
                      }else if(readOrWrite=="read" && permission=="deny"){  
                        jsonObj.readValue=false;                     
                      } 

                      if(readOrWrite=="write" && permission=="allow"){  
                        jsonObj.writeValue=true;                     
                      }else if(readOrWrite=="write" && permission=="deny"){  
                        jsonObj.writeValue=false;                         
                      }    

                      if(tableName=="Role"){
                        jsonObj.icon="ion-unlocked";
                      }else if(tableName=="User"){
                        jsonObj.icon="ion-person-stalker"; 
                        $scope.aclPublic.icon="ion-person-stalker";   
                      }     

                      returnList.push(jsonObj);      
                  }      
                }

                if(promises.length>0){
                  $q.all(promises).then(function(list){
                    

                    for(var i=0;i<array.length;++i){
                      var jsonObj={};
                      jsonObj.id=array[i];          

                      if(tableName=="Role"){
                        jsonObj.name=list[i].get("name");
                      }else if(tableName=="User"){
                        jsonObj.name=list[i].get("username"); 
                      }

                      jsonObj.player=tableName;
                      
                      jsonObj.readValue=null;
                      jsonObj.writeValue=null;

                      
                      if(readOrWrite=="read" && permission=="allow"){  
                        jsonObj.readValue=true;         
                      }else if(readOrWrite=="read" && permission=="deny"){  
                        jsonObj.readValue=false;            
                      } 

                      if(readOrWrite=="write" && permission=="allow"){  
                        jsonObj.writeValue=true;         
                      }else if(readOrWrite=="write" && permission=="deny"){  
                        jsonObj.writeValue=false;            
                      }    

                      if(tableName=="Role"){
                        jsonObj.icon="ion-unlocked";
                      }else if(tableName=="User"){
                        jsonObj.icon="ion-person-stalker";  
                      }     

                      returnList.push(jsonObj);        
                    }
                    q.resolve(returnList);
                  },function(error){
                    q.reject(error);
                  });

                }else{
                  q.resolve(returnList);
                }
                  
              }else{   
                q.resolve(returnList);
              } 

              return  q.promise; 
            }

            //Init CloudBoost APP
            function initCbApp(){
              CB.CloudApp.init($rootScope.currentProject.appId,$rootScope.currentProject.keys.master);    
            }
        }]    
    };
});
