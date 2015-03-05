app.factory('utilityService', function () {

    //write a make id funciton here.
    var global = {};

    global.makeId = function(){

        //creates a random string of 8 char long.
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return 'x'+text; //should start with char.

    };

    return global;
});
