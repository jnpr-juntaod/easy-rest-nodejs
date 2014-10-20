var configLoader = require("../private/configloader");
var groupRest = {
	getAllGroups: function(apiCtx, callback) {
		var config = configLoader.loadConfig();
		for(var i = 0; i < config.groups.length; i ++){
			config.groups[i].id = config.groups[i].name;
		}
		callback(null, config.groups);
	}
};

module.exports = groupRest;