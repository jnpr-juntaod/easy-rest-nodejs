/**
 * @module jmp-bootstrap
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Bootstrap of Jmp Server. It will help to unzip service bundles and then load the core server under development mode or production mode.
 * @version 1.0
 * @author Juntao
 *
 */

//mock global logger handler in case the module is required separately. And it will be replaced if the core server is started.
global.logger = console;
console.system = console.log;

var bootstrap = {
	/**
	 * @class Server
	 */
	Server: {
		/**
		 * Start Jmp Server.
		 * @param options - options of starting information.Required information: {workspace: workspace, port: port, devmode: devmode}
		 * @param callback
		 */
		start: function(options, callback){

            //start with instrument mode
            if(options.coverage) {
                require("../system/codecoverage/istanbul-embeded").hookRequire(function (file) {
                    // && file.indexOf("/easy-rest") == -1
                    return file.indexOf("/node_modules") == -1 && file.indexOf("/easy-rest") == -1;
                });
            }

			console.log(" ");
			console.log("############ Initializing runtime variables ############");
			options.devmode = options.devmode || false;
			options.port = options.port || "8090";

			/**
			 * export global variable "modulepath"
			 */
			var modulePath = __dirname + "/../";
			global.modulepath = modulePath;

			if(options.devmode)
				this.startInDebugMode(options, callback);
			else
				this.startInDebugMode(options, callback);
		},

		startInDebugMode: function(options, callback) {
            require("./config-helper").config(options, function(err) {
                if(err)
                    callback(err);
                else {
                    require("../system/jmp-starter").start(options, function (err) {
                        callback(err);
                    });
                }
            });
        },

		startInProductionMode: function(options, callback) {
			/**
			 * ensure that all directories are there
			 */
			function initDirs(rootpath, callback) {
				var tempDir = rootpath + "/installable/temp";
				var logDir = rootpath + "/logs/*";
				console.log("  - Cleaning: " + tempDir);
				var exec = require('child_process').exec;
				var rm = exec("rm -rf " + tempDir + " " + logDir, {});
				rm.on('exit', function(code) {
					var fs = require("fs");
					var dirs = ["webapp", "installed", "logs", "installable", "service", "installable/temp"];
					for (i in dirs){
						var dirPath = rootpath + "/" + dirs[i];
						if (!fs.existsSync(dirPath)) {
							console.log("  - Creating directory: " + dirPath);
							fs.mkdirSync(dirPath);
						}
					}
					callback();
				});

			}

			/**
			 * scan all service packs and deploy them according to versions
			 */
			function scanServicePacks(rootpath, callback) {
			    var fs = require("fs");
			    var path = rootpath + "/installable";
			    var files = fs.readdirSync(path);

			    var count = 0;
			    var zippedFiles = {};
			    for(var i = 0; i < files.length; i ++){
			    	var packPath = path + "/" + files[i];
			    	var stats = fs.statSync(packPath);
			    	if(!stats.isDirectory()){
			    		console.log("  - Found illegal file: " + packPath);
			    		continue;
			    	}
			    	if(files[i] == "temp")
			    		continue;
			    	var list = [];
			    	zippedFiles[files[i]] = list;
			    	var serviceZips = fs.readdirSync(packPath);
			    	for(var j = 0; j < serviceZips.length; j ++){
			    		if(serviceZips[j].indexOf(".tar.gz") == -1){
			    			console.log("  - Found illegal file: " + packPath + "/" + serviceZips[j]);
			    			continue;
			    		}
			    		count ++;
			    		list.push(serviceZips[j]);
			    	}
			    }
			    if(count == 0){
			    	callback();
			    }
			    else{
				    var unpacking = require("./jmp-service-unpacking");
				    var installedCount = 0;
				    for(var i in zippedFiles){
						var list = zippedFiles[i];
						for(var j = 0; j < list.length; j ++){
						    console.log("  + Found Ear: " + i + "/" + list[j]);
						    unpacking.unpack(rootpath, i, list[j], function(err) {
						    	installedCount ++;
								if(installedCount == count){
								    callback();
								}
						    });
						}
				    }
			    }
			}

			/**
			 * boot entry
			 */
			function boot(options, callback) {
				var workspace = options.workspace;
				//ensure all directories are there
				initDirs(workspace, function(){
					//scann all services and deploy the newest version.
					scanServicePacks(workspace, function(){
						require("./production-config");

						require("../system/jmp-scustarter").start(options, function(err){
							callback(err);
						});
					});
				});

			}

			/**
			 * invoke boot entry
			 */
			boot(options, function(err) {
				if(callback)
					callback(err);
			});
		},

		/**
		 * Stop Jmp server
		 */
		stop: function(callback) {

		}
	}
};
module.exports = bootstrap;