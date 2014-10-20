/** 
 * @module jmp-container
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Memory instance of an Service Container.
 * @version 2.0
 * @author Juntao
 * 
 */

function ServiceBundle(type, containerPath, containerName){
    this.containerType = type;
	this.containerPath = containerPath;
	this.containerName = containerName;
	this.serviceConfig = null;
	this.restObj = null;
}

var extensionUtil = require("../extensions/jmp-extension-util");
/**
 * Init a service container.
 * @private
 */
ServiceBundle.prototype.init = function() {
	var fs = require("fs");
	var configPath = this.containerPath + "/config.json";

    this.serviceConfig = require(configPath);
    this.serviceConfig.context = this.serviceConfig.context || this.containerName;

    var extensionMap = this.serviceConfig.extensions;
    if(extensionMap) {
        for(var i in extensionMap) {
            var point = i;
            var extsDesc = extensionMap[i];
            var exts = [];
            for(var j = 0; j < extsDesc.length; j ++) {
                exts.push({priority: extsDesc[j].priority, module: require(this.containerPath + "/" + extsDesc[j].module)});
                logger.system("    - Extension: [" + point + "], priority: " + extsDesc[j].priority + ", module: " + extsDesc[j].module);
            }
            extensionUtil.extensions(point, exts);
        }
    }

    //The services bundle will take effective only if existing "rest.json"
	if(fs.existsSync(this.containerPath + "/rest/rest.json")){
        this.restObj = this.applyOneConfig(null, this.containerPath + "/rest/rest.json");
		this.restObj.container = this;
		if(this.restObj.authenticate == null || this.restObj.authenticate == "")
			this.restObj.authenticate = null;
		else if(this.restObj.authenticate == "inherit")
			this.restObj.authenticate = Jx.serverConfig.rest_authenticate;

        var files = fs.readdirSync(this.containerPath + "/rest");
        for(var i = 0; i < files.length; i ++) {
            if(files[i] == "rest.json")
                continue;
            if(files[i].startWith("rest-") && files[i].endWith(".json")){
                var oneRestObj = this.applyOneConfig(this.restObj.uri_prefix, this.containerPath + "/rest/" + files[i]);
                for(var j = 0; j < oneRestObj.modules.length; j ++) {
                    this.restObj.modules.push(oneRestObj.modules[j]);
                }
            }
        }

        var yangInclude = this.restObj.yang_include || [];
        if(fs.existsSync(this.containerPath + "/generated/api-conf")) {
            files = fs.readdirSync(this.containerPath + "/generated/api-conf");
            for (var i = 0; i < files.length; i++)
                yangInclude.push(files[i]);
        }
        if(yangInclude != null && yangInclude.length > 0) {
            for(var i = 0; i < yangInclude.length; i ++) {
                var include = yangInclude[i];
                var path = this.containerPath + "/generated/api-conf/" + include;
                if(!fs.existsSync(path)) {
                    throw new Jx.JmpContainerError("Can not find the included yang api configuration file," + path);
                }
                var oneRestObj = this.applyOneConfig(this.restObj.uri_prefix, path);
                for(var j = 0; j < oneRestObj.modules.length; j ++) {
                    this.restObj.modules.push(oneRestObj.modules[j]);
                }
            }
        }
	}
};

ServiceBundle.prototype.applyOneConfig = function(parent_uri_prefix, filePath) {
    var restObj = require(filePath);
//    restObj.apis = restObj.apis || [];
//    for(var i = 0; i < restObj.apis.length; i ++) {
//        var desc = restObj.apis[i];
//        //if the configuration item is a provider class, invoke it. And add dynamic generated apis to the container.
//        if(typeof desc == "string") {
//            var provider = require(this.containerPath + "/" + desc);
//            var rests = provider.apis();
//            for(var j = 0; j < rests.length; j ++)
//                restObj.apis.push(rests[j]);
//            restObj.apis.splice(i, 1);
//            i --;
//        }
//    }

    restObj.modules = restObj.modules || [];

    //form rest api url prefix.
    var uri_prefix = restObj.uri_prefix;
    if(uri_prefix == "inherit")
        uri_prefix = parent_uri_prefix;
    if(uri_prefix == "inherit"){
        uri_prefix = Jx.serverConfig.rest_prefix + "/" + this.containerName;
    }
    else if(uri_prefix != null && uri_prefix != "" && !uri_prefix.startWith("/")) {
        uri_prefix = Jx.serverConfig.rest_prefix + "/" + uri_prefix;
    }
    else
        uri_prefix = Jx.serverConfig.rest_prefix

    for(var i = 0; i < restObj.modules.length; i ++) {
        var module = restObj.modules[i];
        module.apis = module.apis || [];
        //add a test entry for each container. It's for backend codes which depends on runtime context only.
//        module.apis.push(this.getTestEntryApi(module));
        for(var j = 0; j < module.apis.length; j ++) {
            var oneRest = module.apis[j];
            if(oneRest["uri-reg"] != null) {
                //absolute path
                if(oneRest["uri-reg"].startWith("\\/"))
                    oneRest.uri = new RegExp(oneRest["uri-reg"]);
                else {
                    var prefix = uri_prefix.replaceAll("/", "\\/");
                    var modulePart = "";
                    if(module.name != "")
                        modulePart += module.name + ":";
                    oneRest.uri = new RegExp(prefix + "\\/" + modulePart + oneRest["uri-reg"]);
                }
            }
            else if(oneRest.uri != null){
                oneRest.uri = oneRest.uri.trim();
                if(!oneRest.uri.startWith("/")) {
                    var uri = oneRest.uri;
                    if (uri != "") {
                        var modulePart = "";
                        if(module.name != "")
                            modulePart += module.name + ":";
                        oneRest.uri = uri_prefix + "/" + modulePart + oneRest.uri;
                    }
                    else
                        oneRest.uri = uri_prefix + "/" + module.name;
                }
            }
            else
                throw new Jx.JmpRuntimeError("There are neither uri-reg nor uri attributes for rest api configuration in module: " + module.name);
            oneRest.produces = oneRest.produces || [];
//            //default, support application/json
//            if (oneRest.produces.length == 0)
//                oneRest.produces.push("application/json");
        }
    }
    return restObj;
};

ServiceBundle.prototype.restConfig = function() {
	return this.restObj;
};

//ServiceBundle.prototype.getTestEntryApi = function(module) {
//    return {
//        "protocol": "GET",
//        "chain": [],
//        "uri": module.name + "/testentry/:action",
//        "params": [{name: "action", type: "PathParam"}],
//        "module": "testentry.js",
//        "method": "action"
//    };
//};

ServiceBundle.prototype.toJSON = function() {
    var restObj = {};
    for(var i in this.restObj) {
        if(i == "container")
            continue;
        restObj[i] = this.restObj[i];
    }
    var obj = {
        containerPath: this.containerPath,
        containerName: this.containerName,
        restObj: restObj
    };
    return obj;
};

module.exports = ServiceBundle;

