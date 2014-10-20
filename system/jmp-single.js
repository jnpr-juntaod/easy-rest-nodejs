/** 
 * @module jmp-single
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Start a single instance server. 
 * @version 2.0
 * @author Juntao
 * 
 */

module.exports.startServer = function(options, callback) {
	/**
	 * catch all uncaught exceptions.
	 */
	process.on('uncaughtException', function (err) {
		logger.error("Uncaught exception: " + err.code + "," + err.message, err);
	});

    Jx.serverStatus = "Starting";

    function dumpingServerConfiguration(callback) {
        var info = require("./jmp-starting-info");
        info.dump(options, Jx.serverConfig);
        callback();
    }

    //Start server delegator according to configurations, default is "restify"
    var jmpServer = require("./jmp-server-" + Jx.serverConfig.serverdelegator);
    function startingServerDelegator(callback) {
        logger.system(" ");
        logger.systemStart("Step " + (++ global.bootSteps) + ", Starting Server Delegator");

        jmpServer.start(options, function(err, serverInstance) {
            logger.system("  - Delegator '" + Jx.serverConfig.serverdelegator + "' was started");
            Jx.serverInstance = serverInstance;
            //start notification here
            var notificationUtil = require("./stack/notification/jmp-notification");
            notificationUtil.startNotification(jmpServer);
            callback(err);
        });
    }


    function serviceBootstrap(callback) {
        var bootstrap = require("./stack/jmp-service-bundle-bootstrap");
        bootstrap.init(function(err) {
            callback(err);
        });
    }

    function installingServiceBundles(callback) {
        try{
            logger.system();
            logger.systemStart("Step " + (++ global.bootSteps) + ", Installing Services ");
            var serviceContainers = Jx.Naming.lookup("serviceContainers");
            var installer = require("./stack/container/jmp-service-installer");
            if(serviceContainers){
                for(var i in serviceContainers) {
                    var serviceContainer = serviceContainers[i];
                    installer.installService(jmpServer, serviceContainer);
                }
            }
            callback();
        }
        catch(err) {
            callback(err);
        }
    }

    function installingStaticContents(callback) {
        try{
            logger.system();
            logger.systemStart("Step " + (++ global.bootSteps) + ", Installing Static Contents ");
            var staticContainers = Jx.Naming.lookup("staticContainers");
            var installer = require("./stack/container/jmp-service-installer");
            if(staticContainers){
                for(var i in staticContainers) {
                    var staticContainer = staticContainers[i];
                    installer.installStatic(jmpServer, staticContainer);
                }
            }
            callback();
        }
        catch(err) {
            callback(err);
        }
    }

    function initializingDataSources(callback) {
        try{
            logger.system();
            logger.systemStart("Step " + (++ global.bootSteps) + ", Initializing DataSources ");
            require("./stack/persistence/jmp-datasource-util").init();
            callback();
        }
        catch(err) {
            callback(err);
        }
    }

    function initializingYangModel(callback) {
        logger.system();
        logger.systemStart("Step " + (++ global.bootSteps) + ", Initializing Yang Model");

        Jx.yang = require("yang-model");
        callback();
    }

    function initializingOrm(callback) {
        logger.system();
        logger.systemStart("Step " + (++ global.bootSteps) + ", Initializing OR Mapping");
        Jx.ormUtil.scanOrmObjects();
        callback();
    }

    function triggeringHooks(callback) {
        logger.system();
        logger.systemStart("Stage " + (++ global.bootSteps) + ", Initializing service bundle' hooks ");

        logger.system("  + Triggering service bundle init extensions");
        Jx.extensionUtil.triggerExtensions("serviceBundleInit", {}, function(err, result) {
            if(err) {
                callback(err);
            }
            else{
                callback();
            }
        });
    }

    var async = require("async");
    async.series([dumpingServerConfiguration, initializingYangModel, serviceBootstrap, startingServerDelegator, installingServiceBundles, installingStaticContents, initializingDataSources, initializingOrm, triggeringHooks],
    function(err, results) {
        if(err){
            logger.error(err);
            Jx.serverStatus = "Started Failed";
            callback();
        }
        else{
            Jx.serverStatus = "Started";
            callback();
        }
    });
};
