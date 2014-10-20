/** 
 * @module jmp-service-installer
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Install a service container into current runtime env.
 * @version 2.0
 * @author Juntao
 * 
 */
var restController = require("../rest/jmp-rest-controller");
var intercepter = require("./jmp-service-intercepter");
//initialize intercepter plugins first.
intercepter.init();
var installer = {
	installService: function(server, container) {
		
		var serverInstance = server.serverInstance;
        logger.system("  + Installing service container: " + container.containerName);
        /**
         * register rest api
         */
        var servicePath = container.containerPath + "/rest";
        var restObj = container.restConfig();
        if(restObj){
            for(var i = 0; i < restObj.modules.length; i ++){
                var module = restObj.modules[i];
                var rests = module.apis;
                for(var j = 0; j < rests.length; j ++){
                    var oneRest = rests[j];
                    var protocol = oneRest.protocol.toLowerCase();
                    var uri = oneRest.uri;
                    if(uri == null || uri == ""){
                        logger.system("    - Rest configuration error for: " + (servicePath + "/" + oneRest.module) + ", uri is null");
                        continue;
                    }
                    logger.system("      - Mapping Rest Api: [" + protocol + "] " + uri + " -> " + (servicePath + "/" + oneRest.module));
                    serverInstance[protocol](uri, intercepter.intercept(container, server), restController.respond(restObj, oneRest));
                }
            }
        }

        /**
         * there are passport strategy providers
         */
        if(container.serviceConfig.passport && container.serviceConfig.passport.length > 0) {
            logger.system("      + Installing passport strategy");
            for(var j = 0; j < container.serviceConfig.passport.length; j ++){
                var strategyConfig = container.serviceConfig.passport[j];
                logger.system("        - Mapping passport strategy: " + strategyConfig.name);
		        var strategy = require(container.containerPath + "/" + strategyConfig.handler);
                server.passport.use(strategy);
            }
        }
	},
	installStatic: function(server, container) {
		var serverInstance = server.serverInstance;

//		logger.system("    + Installing static container: sculib");
//		/**
//		 * mapping sculib expecially
//		 */
//		var reg = new RegExp("^/sculib/?.*");
//		serverInstance.get(reg, server.serverStatic({
//			directory: modulepath + "/../"
//		}));
//
//		logger.system("      - Mapping static content: [" + modulepath + "/sculib] -> sculib" );
//
//		logger.system("    + Installing static container: cloudsculib");
//		reg = new RegExp("^/cloudsculib/?.*");
//		serverInstance.get(reg, server.serverStatic({
//			directory: modulepath + "/../"
//		}));
		
        logger.system("  + Installing static container: " + container.containerName);
        /**
         * register static resources
         */
        var webPath = container.containerPath.substring(0, container.containerPath.length - container.containerName.length);
        var context = container.containerName;
        logger.system("    - Mapping static content: [" + webPath + "] -> " + context);


        var authenticate = container.serviceConfig.authenticate;
        if(authenticate == "inherit")
            authenticate = Jx.serverConfig.authenticate;
        /**
         * protect index.html of the container.
         */
        if(authenticate != null && authenticate != ""){
            logger.system("      - protected by strategy: " + authenticate);
            serverInstance.get(context + "/index.html", server.passport.authenticate(authenticate), function(req, res, next){
                res.contentType = "text/html";
                writeDefaultHtml(req, res);
            });
        }

        var reg = new RegExp("^/" + context + "/?.*");
        serverInstance.get(reg, server.serverStatic({
            directory: webPath,
            default: "index.html"
        }));
	}
};

var ctxDefaultContentMap = {};
function writeDefaultHtml(req, res){
	var url = req.url;
	var context = url.substring(1, url.lastIndexOf("/"));
	var defaultHtml = ctxDefaultContentMap[context];
	if(defaultHtml != null){
		res.write(defaultHtml);
		res.end();
	}
	else{
		var fs = require("fs");
		fs.readFile(getDefaultPath(context), function(err, data){
			if(err)
				return next(err);
			defaultHtml = data.toString();
			ctxDefaultContentMap[context] = defaultHtml;
			res.write(defaultHtml);
			res.end();
		});
	}
};
function getDefaultPath(context) {
	var webapp = getWebAppByContext(context);
	var result = webapp.containerPath + "/index.html";
	return result;
};

function getWebAppByContext(context){
	var staticContainers = Jx.Naming.lookup("staticContainers");
	if(staticContainers){
        for(var i in staticContainers){
            if(staticContainers[i].containerName == context){
                return staticContainers[i];
            }
        }
	}
	return null;
}

module.exports = installer;
