var fs = require("fs");
var testUtil = {
    runCases: function(files, callback){
		var spawn = require('child_process').spawn;
		var child = spawn("node", [__dirname + "/jmp-mocha-runner.js", files.join(",")]);
		var result = null;
		child.on('exit', function(code){
			callback(null, result);
		});
		child.stdout.on('data', function(data) {
			result = data.toString();
		});
		child.stderr.on('data', function(data) {
			console.log(data.toString());
		});
    },
    runSuite: function(rootpath, module, container, callback) {
    	
    },
    runAll: function(rootpath, container, callback) {
    	
    },
    generateReportSync: function(dir, format) {
    	format = format || "lcov";
    	var reportGen = require("./jmp-report-gen");
    	if(format == "lcov")
    		reportGen.genReportLcov(dir);
    }
};
module.exports = testUtil;
