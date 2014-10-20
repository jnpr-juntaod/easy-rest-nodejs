var configLoader = require("../private/configloader");
var instanceRest = {
	getGroupInstances: function(groupName, apiCtx, callback) {
		var config = configLoader.loadConfig();
		for(var i = 0; i < config.groups.length; i ++){
			if(config.groups[i].name == groupName){
				var instances = config.groups[i].instances;
				for(var j = 0; j < instances.length; j ++)
					instances[j].id = instances[j].ip + instances[j].port;
				return callback(null, config.groups[i].instances);
			}
		}
		return callback(null, []);
	}
};

module.exports = instanceRest;