
var express = require('express');
var app = express();

app.get('/app/key.js',function(req,res){
	res.setHeader('Content-type', 'text/plain');
	res.charset = 'UTF-8';
	var content= "";

	/***************************************************Connecting URLs*********************************************************/
	content+= "var __isDevelopment = "+(process.env["CLOUDBOOST_DEVELOPMENT"] || "false")+";\n";
	

	content+= "var frontendServerURL = null,\n";
	           content+= "SERVER_URL = null,\n";
	           content+= "landingURL = null,\n";
	         content+= "analyticsURL = null,\n";
	         content+= "ACCOUNTS_URL=null,";
			 content+= "FILES_URL=null,";
	         content+= "tablesURL = null;\n";

	content+= "landingURL = 'https://www.cloudboost.io';\n";

	content+= "if(window.location.hostname==='dashboard.cloudboost.io'){\n";
		content+= "ACCOUNTS_URL='https://accounts.cloudboost.io';\n";
	    content+= "frontendServerURL='https://service.cloudboost.io';\n";
	    content+= "SERVER_URL='https://api.cloudboost.io';\n";
		content+= "FILES_URL='https://files.cloudboost.io';\n";
	    content+= "tablesURL='https://tables.cloudboost.io';\n";
	content+= "}else if(window.location.hostname==='beta-dashboard.cloudboost.io'){\n";
	    content+= "frontendServerURL='https://beta-service.cloudboost.io';\n";
	    content+= "SERVER_URL='https://beta-api.cloudboost.io';\n";
	    content+= "tablesURL='https://beta-tables.cloudboost.io';\n";
	content+= "}else{\n";
	    content+= "frontendServerURL = window.location.protocol+'//'+window.location.hostname + ':3000';\n";
	    content+= "SERVER_URL =  window.location.protocol+'//'+window.location.hostname + ':4730';\n";
	    content+= "tablesURL =  window.location.protocol+'//'+window.location.hostname + ':3333';\n";
		content+= "FILES_URL =  window.location.protocol+'//'+window.location.hostname + ':3012';\n";
	    content+= "ACCOUNTS_URL= window.location.protocol+'//'+window.location.hostname + ':1447';\n";
	content+= "}\n";

		res.write(content);
		res.end();
	});

app.use(express.static(__dirname));

app.set('port', process.env.PORT || 1440);

var server = app.listen(app.get('port'), function() {
	console.log("CBDashboard runing on PORT:"+app.get('port'));	
});
