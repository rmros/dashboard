app.factory('tableErrorService', function () {

    var global = {};

    global.checkErrorsForCreate = function(name,arry,type){
      if(type=="table"){
        var error=tableErrorsForCreate(name,arry);
      }

      if(type=="column"){
        var error=columnErrorsForCreate(name,arry);
      }
      return error;

    };

    global.checkErrorsForEdit=function(name,thisObj,arry,type){
      if(type=="table"){
        var error=tableErrorsForEdit(name,thisObj,arry);
      }

      if(type=="column"){
        var error=columnErrorsForEdit(name,thisObj,arry);
      }

      return error;

    }

    function tableErrorsForCreate(name,arry){
        var isNull=isEmpty(name);
        if(isNull){
          return "Name cannot be empty";
        }
       
        var isStartNumber=isStartWithNumber(name);
        if(isStartNumber){
            return "Name cannot start with a number";
        }
        var isSpecialChar=isContainsSpecialChars(name);
        if(isSpecialChar){
            return "Name cannot contain any special characters.";
        }

        var spaces=areSpaces(name);
        if(spaces){
            return "Spaces are not allowed";
        }

        var isCommon=isCommonName(name,arry);
        if(isCommon){
            return "Name already exists.";
        }
        return null;
    }

    function tableErrorsForEdit(name,thisObj,arry){
        var isNull=isEmpty(name);
        if(isNull){
          return "Name cannot be empty";
        }
        
        var isStartNumber=isStartWithNumber(name);
        if(isStartNumber){
            return "Name cannot start with a number";
        }
        var isSpecialChar=isContainsSpecialChars(name);
        if(isSpecialChar){
             return "Name cannot contain any special characters.";
        }
        var spaces=areSpaces(name);
        if(spaces){
            return "Spaces are not allowed";
        }

        var isCommon=isCommonNameExceptThisObj(name,thisObj,arry);
        if(isCommon){
            return "Name already exists.";
        }
        return null;
    }

    function columnErrorsForCreate(name,arry){
        var isNull=isEmpty(name);
        if(isNull){
          return "Column name shouldn't be empty";
        }

        var isCommon=isCommonName(name,arry);
        if(isCommon){
            return "Name already exists.";
        }   
        
        var isStartNumber=isStartWithNumber(name);
        if(isStartNumber){
            return "Column name shouldn't start with number";
        }
        var isSpecialChar=isContainsSpecialChars(name);
        if(isSpecialChar){
            return "Column name shouldn't contain any special characters.";
        }
        var spaces=areSpaces(name);
        if(spaces){
            return "Spaces are not allowed.";
        }

        return null;
    }

    function columnErrorsForEdit(name,thisObj,arry){
        var isNull=isEmpty(name);
        if(isNull){
          return "Column name shouldn't be empty";
        }
        
        var isStartNumber=isStartWithNumber(name);
        if(isStartNumber){
            return "Column name shouldn't start with number";
        }
        var isSpecialChar=isContainsSpecialChars(name);
        if(isSpecialChar){
            return "Column name shouldn't contain any special characters.";
        }
        var spaces=areSpaces(name);
        if(spaces){
            return "Spaces are not allowed.";
        }

        var isCommon=isCommonNameExceptThisObj(name,thisObj,arry);
        if(isCommon){
            return "This Column name already exist. Please try with different name.";
        }
        return null;
    }

    function isEmpty(name){
        if(name){
            return false;
        }
            return true;
    }

    function areSpaces(name){
      var regexp = /^\S+$/
        if(name.match(regexp)){
            return false;
        }
            return true;
    }

    function isUpperCase(name){
        if(name[0].match(/^[A-Z]/)){
            return true;
        }
            return false;
    }
    function isStartWithNumber(name){
        if(isNaN(name[0])){
            return false;
        }
          return true;


    }
    function isLowerCase(name){
        if(name[0].match(/^[a-z]/)){
            return true;
        }
        return false;
    }
    function isContainsSpecialChars(name){
      var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
      if(pattern.test(name)){
          return true;
      }
          return false;
    }

    function isCommonName(name,arry){
        var isThere=false;    
        for(var i=0;i<arry.length;++i){
            if(arry[i].name.toLowerCase()==name.toLowerCase()){
                isThere=true;
                break;
            }
        } 

        return isThere;  
    }

    function isCommonNameExceptThisObj(name,thisObj,arry){     

        var isThere=false;

        for(var i=0;i<arry.length;++i){
            if(arry[i].id!=thisObj.id){
                if(arry[i].name.toLowerCase()==name.toLowerCase()){
                    isThere=true;
                    break;
                }
            }
        }
        return isThere;
    }


    return global;
});
