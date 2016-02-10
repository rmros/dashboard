
var express = require('express');
var app = express();

app.use(express.static(__dirname));

app.set('port', process.env.PORT || 1440);

var server = app.listen(app.get('port'), function() {
	console.log("CBDashboard runing on PORT:"+app.get('port'));	
});
