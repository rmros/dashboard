app.factory('cloudObjectService', function () {

    //write a make id funciton here.
    var global = {};

    global.setFileObject = function(file){       
        global.file=file;
    };

    return global;
});
