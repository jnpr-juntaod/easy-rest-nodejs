/**
 * @module config-helper
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Organize all variables and replace config files with the variables.
 * @version 1.0
 * @author Juntao
 *
 */
var fs = require("fs");
module.exports = {
	config: function(options, callback) {
        var rootpath = options.workspace;
        var nodehome = options.nodehome;
		var exec = require("child_process").exec;
        var util = require("../system/jmp-util");
		var env = {
			"_DB_PSWD_" : options.dbpasswd || process.env.DB_PSWD,
			"_DB_USER_" : options.dbuser || process.env.DB_USER,
			"_DB_HOST_" : options.dbhost || process.env.DB_HOST,
			"_DB_NAME_" : options.dbname || process.env.DB_NAME,
            "_DB_PORT_" : options.dbport || process.env.DB_PORT || "3306",

			"_NODEJS_PORT_" : options.nodeport || process.env.NODEJS_PORT || "8090",
		    "_NGINX_PORT_": options.nginxport || process.env.NGINX_PORT || "80",
            "_NGINX_HOST_": options.nginxhost || process.env.NGINX_HOST || util.getLocalIp(),
            "_NGINX_PROTOCOL_": options.nginxprotocol || process.env.NGINX_PROTOCOL || "http",
            "_STOMP_HOST_": process.env.JBOSS_HOST,
			"_STOMP_PORT_" : options.stompport || process.env.STOMP_PORT || "61614",
			"_STOMP_USER_" : options.stompuser || process.env.STOMP_USER || "stomp",
			"_STOMP_PSWD_" : options.stomppasswd || process.env.STOMP_PASSWD || "stomp_123",
            "_REDIS_HOST_" : options.redishost || "127.0.0.1",
            "_REDIS_PORT_" : options.redisport || "6379"
		};

		function checkEnv(callback) {
			var hasErrors = false;
            for (var n in env) {
                var name = n.substring(1, n.length - 1);
                if(env[n] == null){
                    console.log("  - " + name + " is None, please setup it either by parameter or environment variables!");
                    hasErrors = true;
                }
                if(options.devmode)
                    console.log("  - " + name + ":" + env[n]);
            }
            if(hasErrors)
                callback(new Error("There are some configuration errors"));
            else
                callback();
		}

		var replace = function(str, params) {
			for (p in params) {
				if (params[p] != null) {
					var re = new RegExp(p, 'g');
					str = str.replace(re, params[p]);
				}
			}
			return str;
		};

		function setConfigParam(filename) {
			var data = fs.readFileSync(filename, {encoding : "utf-8"});
			fs.writeFileSync(filename, replace(data, env));
		}

		function doConfig() {
            checkDir();
            copyDir(function() {
                console.log(" ");
                console.log("############ Replacing configuration files ############");
                var path = rootpath + "/temp/configurations";
                var config_files = [ "db-config.js", "server-config.js", "log-config.js",
                    "sso-config.js", "stomp-config.js"];
                var containers = fs.readdirSync(path);
                for(var i = 0; i < containers.length; i ++) {
                    for (var f in config_files) {
                        var filename = path + "/" + containers[i] + "/" + config_files[f];
                        if(!fs.existsSync(filename))
                            continue;
                        console.log("  - reconfig: " + filename);
                        setConfigParam(filename);
                    }
                }
                callback();
            });
        }

        /**
         * make sure all directories are created.
         */
        function checkDir() {
            var path = rootpath + "/temp";
            if(!fs.existsSync(path))
                fs.mkdirSync(path);
            var logPath = path + "/log";
            if(!fs.existsSync(logPath))
                fs.mkdirSync(logPath);
            logPath = logPath + "/" + options.port;
            if(!fs.existsSync(logPath))
                fs.mkdirSync(logPath);
            else{
                var files = fs.readdirSync(logPath);
                for(var i = 0; i < files.length; i ++)
                    fs.unlinkSync(logPath + "/" + files[i]);
            }
            var configPath = path + "/configurations";
            if(!fs.existsSync(configPath))
                fs.mkdirSync(configPath);
            else{
                var exec = require("child_process").exec;
                exec("rm -rf " + configPath + "/*", function(err, result){

                });
            }
        }

        function copyDir(callback) {
            var configFiles = [];
            var containers = fs.readdirSync(rootpath);
            for(var i = 0; i < containers.length; i ++){
                var configPath = rootpath + "/" + containers[i] + "/configurations";
                if(containers[i]!= "temp" && fs.existsSync(configPath)) {
                    configFiles.push(rootpath + "/" + containers[i]);
                }
            }

            containers = fs.readdirSync(nodehome + "/node_modules");
            for(var i = 0; i < containers.length; i ++){
                var configPath = nodehome + "/node_modules/" + containers[i] + "/configurations";
                var containerPath = nodehome + "/node_modules/" + containers[i];
                if(fs.existsSync(configPath) && configFiles.indexOf(containerPath) == -1) {
                    configFiles.push(containerPath);
                }
            }
            var async = require("async");
            var exec = require("child_process").exec;
            async.each(configFiles, function(file, callback) {
                var container = file.substring(file.lastIndexOf("/") + 1);
                var cp = exec("cp -rf " + file + "/configurations " + rootpath + "/temp/configurations/" + container);
                cp.on("exit", function() {
                   callback();
                });
                cp.on("error", function(err) {
                   console.log(err);
                });
            }, function(err, result){
                callback(err);
            });
        }

        function checkNginx(callback) {
            var client = require(env["_NGINX_PROTOCOL_"]);

            var options = {
                hostname: env["_NGINX_HOST_"],
                port: env["_NGINX_PORT_"],
                path: '/js-hello-easy-rest',
                method: 'GET'
            };

            var req = client.request(options, function(res) {
                if(res.statusCode  != 200) {
                    var msg = "Nginx is not correctly configured or started. You can run config-nginx.sh first.Status code: " + res.statusCode;
                    callback(new Error(msg));
                }
                else
                    callback();
            });

            req.on("error", function(err) {
                var msg = "Nginx is not correctly configured or started. You can run config-nginx.sh first." + err;
                callback(new Error(msg));
            });

            req.end();
        }

        function checkRedis(callback) {
            var redis = require("redis");
            var client = redis.createClient(env["_REDIS_PORT_"], env["_REDIS_HOST_"]);
            client.on("error", function(err){
                var msg = "Redis is not correctly configured or started. You should start redis first." + err;
                callback(new Error(msg));
            });
            client.on("ready", function() {
                callback();
            });
        }

		console.log(" ");
		console.log("############ Final Variables ############ ");

        var async = require("async");
        async.series([
            checkEnv,
//          checkNginx,
            checkRedis,
            doConfig
        ],
        function(err, results){
            callback(err);
        });
	}

}
