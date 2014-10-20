/** 
 * @module jmp-rest-controller
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * The main rest entry of Junos Space Platform (NodeJS Server)
 * @version 1.0
 * @author Juntao
 * 
 */

var domain = require("domain");
/**
 * Inject around the target rest api method according to the metadata by returning a wrapper function.
 */
module.exports.respond = function(config, md) {
    //closure function to keep current variables
	var wrapFunc = function(req, res, next) {
		//indicate a signal so that post processors can get it.
		req._is_rest_call = true;
		//protect the rest logic in nodejs' domain
		var d = domain.create();
        d.add(req);
        d.add(res);
		d.name = "rest-domain";
        var modulePath = config.container.containerPath + "/rest/" + md.module;
		d.run(function(){
            var returned = false;
            try{
                //get the target rest api module.
                var targetRestService = require(modulePath);
                logger.debug("    - Invoking rest: " + modulePath + ":" + md.method);
                var targetMethod = targetRestService[md.method];
                if(targetMethod == null)
                    throw new Jx.JmpRuntimeError("The method: " + modulePath + "/" + md.method + " doesn't exist, please check rest.json");

                //fill the params according to rest api's annotation.
                var params = parseParams(req, md);
                //every rest service api will be added an apiCtx at the last of original params array.
                params.push(req.apiCtx);
                //every rest api will be added an callback function.
                params.push(function(err, results) {
                    if(returned) {
                        logger.error("Multiple returned values, please check your code. Path: " + modulePath + ", method:" + md.method);
                    }
                    returned = true;
                    //further processing in restify error handler
                    if(err){
                        next(err);
                        d.exit();
                    }
                    else{
                        try {
                            var extOptions = {req: req, res: res, container: config.container, metadata: md, data: results};
                            Jx.extensionUtil.triggerExtensions("beforeWriteData", extOptions);
                            results = extOptions.data;
                            if(results != null) {
                                if (typeof results == "string") {
                                    res.write(results);
                                }
                                else {
                                    res.send(200, results);
                                }
                            }
                            next(false);
                            d.exit();
                        }
                        catch(err) {
                            next(err);
                            d.exit();
                        }
                    }
                });
			
				targetRestService[md.method].apply(targetRestService, params);
			}
			catch(err){
                if(returned) {
                    logger.error("Multiple returned values, please check your code. Path: " + modulePath + ", method:" + md.method);
                }
				next(err);
                d.exit();
            }
		});
		
		//ensure all errors are caught and the domain safely exits.
		d.on("error", function(err){
            logger.error("Error while invoking rest api. Path: " + modulePath + ", method:" + md.method + " " + err);
            next(err);
            d.exit();
        });
	};
	
	return wrapFunc;
};


function parseParams(req, metadata){
	var params = [];
	if(metadata.params != null && metadata.params.length > 0){
		for(var i = 0; i < metadata.params.length; i ++){
			var param = metadata.params[i];
			var value = null;
			if(param.type == null || param.type == "ReqParam"){
				value = req.params[param.name];
			}
			else if(param.type == "PathParam"){
				value = req.params[param.name];
			}
			else if(param.type == "Body") {
				value = req.body;
			}
			else if(param.type == "BodyString") {
				value = req.body.toString();
			}
            else if(param.type == "MatrixParam") {
                for(var j = 0; j < 10; j ++) {
                    var reqParam = req.params[j];
                    if(reqParam == null)
                        break;
                    var key = param.name + "=";
                    if(reqParam.startWith(key)) {
                        value = reqParam.substring(key.length).split(",");
                        break;
                    }
                }
            }
			params.push(value);
		}
	}
	return params;
};