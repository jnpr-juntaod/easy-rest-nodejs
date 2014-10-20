/**
 * @module jmp-config
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc The class will help to merge all configurations of the same type to one.
 * @version 2.0
 */

/**
 * exports the whole configuration instance
 */
module.exports = {
	mergeConfig: function(name) {
		if(configMap[name] == null){
			var list = scanConfig(rootpath, name);
			configMap[name] = list;
		}
		return configMap[name];
	}
};

var configMap = {};
var fs = require("fs");
/**
 * TODO scan cmp only
 * Recursively scan all configurations by name, and aggregate them.
 * @param rootpath
 * @param name
 */
function scanConfig(rootpath, name){
	var configList = [];
    var path = rootpath + "/temp/configurations";
    var containers = fs.readdirSync(path);
    for(var i = 0; i < containers.length; i ++)
        scanDir(configList, path + "/" + containers[i], name);
	return configList;
}

function scanDir(configList, dirpath, name){
	var path = dirpath + "/" + name;
	var exist = fs.existsSync(path);
	if(exist){
		var config = require(path);
		configList.push(config);
	}
	return configList;
}
