app.factory('sharedDataService', function () {
  
    var global = {}; 
    global.aclObject=null; 
    var aclArray=[];     

    global.flushAclArray= function(){
    	aclArray=[];
   	}; 	
   	
    global.pushAclObject = function(newAclObj){
	   	aclArray.push(newAclObj);
	    global.aclObject=aclArray[aclArray.length-1];
	};

	global.spliceAclObjectByIndex = function(index){
		if(aclArray && aclArray.length>0){
			aclArray.splice(index,1);
		}
		if(aclArray.length==0){
			global.aclObject=null;
		}    
	};

    return global;
});
