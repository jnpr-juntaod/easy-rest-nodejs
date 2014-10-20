/**
 * @module jmp-starter
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * The main starting entry of Junos Space Platform (NodeJS Server)
 * @version 1.0
 * @author Juntao
 *
 */

var starter = {
    /**
     * Start the core server with options.
     * @param options
     */
	start: function(options){

        /**
         * Global variables for space runtime environment.
         * @global
         */
        global.rootpath = options.workspace;
        global.nodehome = options.nodehome;
        global.nodeport = options.port;
        global.devmode = options.devmode;
        global.logpath = rootpath + "/temp/log";
        global.configpath = rootpath + "/temp/configurations";
        global.EASY_REST_KEY_PREFIX = "$easy_rest_";
        global.EASY_REST_API_KEY = EASY_REST_KEY_PREFIX + "AVAILABLE_APIS";
        global.EASY_REST_MODEL_KEY = EASY_REST_KEY_PREFIX + "MODEL_KEY";
        global.bootSteps = 0;


        /**
         * initialize logger first
         */
        require("./jmp-logger");

        logger.system(" ");
		logger.systemStart("Step " + (++ global.bootSteps) + ", Initializing runtime environment");

		var serverConfig = require(global.configpath + "/easy-rest/server-config");

		/**
		 * Define global variables and functions via jmp-common
		 */
		require("./jmp-common");
		Jx.serverConfig = serverConfig;

        Jx.API_PREFIX = Jx.serverConfig.rest_prefix;

		/**
		 * set port attribute to serverConfig
		 */
		Jx.serverConfig.port = options.port;
		logger.system("  + Common Utilities were initialized");


		var jmpSingleServer = require("./jmp-single");
		jmpSingleServer.startServer(options, function(err) {
            delete global.bootSteps;
            logger.system();
            if(Jx.serverStatus != "Started") {
                logger.system("Junos Space Platform was failed to be started.");
                logger.system();
            }
            else {
                logger.system("Junos Space Platform was successfully started. Listening on port: " + options.port + ", memory usage: " + JSON.stringify(process.memoryUsage()));
                logger.system();
            }
        });
	}
};

module.exports = starter;
