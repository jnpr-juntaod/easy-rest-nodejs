/** 
 * @module jmp-logger
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * A logger wrapper for 3rdParty logs. The default implementation is log4js.
 * @version 2.0
 * @author Juntao
 */

/**
 * merge all log4js configurations and save it to logs directory
 */
var log4jsConfigList = require("./jmp-confighelper").mergeConfig("log4js.json");
var log4jsConfig = {"appenders": [], "levels": {}};
for(var i = 0; i < log4jsConfigList.length; i ++){
	var config = log4jsConfigList[i];
	if(config.appenders){
		for(var j = 0; j < config.appenders.length; j ++){
			var appender = config.appenders[j];
            //appender.filename = logRootPath + "/" + appender.filename;
			log4jsConfig.appenders.push(appender);
		}
	}
	if(config.levels){
		for(var j in config.levels)
			log4jsConfig.levels[j] = config.levels[j];
	}
}

/**
 * write the temporary file to logs folder.
 */
var fs = require("fs");
var tempLogPath = rootpath + "/temp/log/" + global.nodeport + "/log4js.json";
fs.writeFileSync(tempLogPath, JSON.stringify(log4jsConfig));

/**
 * initialize log4js with log4js.json.
 */
var log4js = require("log4js");
var logRootPath = rootpath + "/temp/log/" + global.nodeport;
log4js.configure(tempLogPath, { reloadSecs: 60, cwd: logRootPath});

/**
 * create all appenders.
 */
var sysLogger = log4js.getLogger("system");
var log = log4js.getLogger("server");

/**
 * @global
 */
global.logger = {
	/**
	 * log system messages to log files in any log level.
	 */
	system: function(message, errObj) {
		if(message == null)
			message = "  ";
		
		sysLogger.info(message);
		logger.info(message);
	},

	systemStart: function(title) {
		this.system("############ " + title + " ############");
	},

	debug: function(message) {
		log.debug(message);
        if(global.devmode)
            console.info(message);
	},

	info: function(message) {
		log.info(message);
        if(global.devmode)
            console.info(message);
	},
	error: function(message, errorObj) {
		log.error(message);
        if(global.devmode)
            console.error(message);
	},
	warn: function(message){
		log.warn(message);
        if(global.devmode)
            console.warn(message);
	},
    isDebugEnabled: function() {
        return log.isDebugEnabled();
    },
    isErrorEnabled: function() {
        return log.isErrorEnabled();
    },
    isInfoEnabled: function() {
        return log.isInfoEnabled();
    },
    isWarnEnabled: function() {
        return log.isWarnEnabled();
    },
	getLogger: function(name) {
		return log4js.getLogger(name);
	},
	getServerPlugin: function() {
		return log4js.connectLogger(log, {level: 'auto'});
	}
};