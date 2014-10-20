var configLoader = require("../private/configloader");
var serviceRest = {
	getGroupServices: function(groupName, apiCtx, callback) {
		var config = configLoader.loadConfig();
		for(var i = 0; i < config.groups.length; i ++){
			if(config.groups[i].name == groupName){
				var services = config.groups[i].services;
				if(services == "*"){
					services = getAllAvailableServices();
				}
				return callback(null, services);
			}
		}
		return callback(null, []);
	},
	
	getAvailableServices: function(apiCtx, callback) {
		var fs = require("fs");
		var path = Jx.serverConfig.node_home + "/depot";
		var services = getAllAvailableServices();
		callback(null, services);
	}
};

function getAllAvailableServices() {
	var fs = require("fs");
	var path = Jx.serverConfig.node_home + "/depot";
	var files = fs.readdirSync(path);
	var services = [];
    for(var i = 0; i < files.length; i ++){
    	var servicePack = files[i];
    	var zipPath = path + "/" + files[i];
    	var zips = fs.readdirSync(zipPath);
    	for(var j = 0; j < zips.length; j ++)
    		services.push({"servicepack": files[i], "servicename": zips[j]});
    }
	return services;
}
module.exports = serviceRest;