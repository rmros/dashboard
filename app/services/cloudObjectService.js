app.factory('cloudObjectService', function () {

    //write a make id funciton here.
    var global = {};
    var fileArray=[];

    global.setFileObject = function(file){       
        global.file=file;
    };

    global.setFileArrayObject = function(file){
    	fileArray.push(file);       
        global.files=fileArray;
    };

    return global;
});
