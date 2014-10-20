module.exports.parse = function(service, module){
	try{
		require(module);
		var results = tmppool;
		for(var i = 0; i < results.length; i ++){
			var result = results[i];
			result.module = module;
			result.fullpath = formRestApiPath(result.service, result.path);
			logger.system("        - [" + result.protocol + "], " + result.fullpath + ", Params: " + stringtify(result.params) + ", module:" + module);
		}
		return results;
	}
	finally{
		tmppool = [];
	}
};

function formRestApiPath(service, path) {
	var prefix = config.rest_prefix;
	var fullPath = prefix + "/" + service;
	if(path == null || path == "/")
		path = "";
	return fullPath + path;
}

function stringtify(params){
	return "EMPTY";
}


