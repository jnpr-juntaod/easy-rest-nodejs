var extensionUtil = {
	triggerExtensions: function(extensionPoint, options, callback) {
		callback = callback || function(){};
		var extensions = this.extensions(extensionPoint);
		var index = -1;
		var onePluginCallback = function(err, result) {
			if(index == extensions.length - 1)
				callback(err);
			else if(result && result.stop)
				callback();
			else{
				var extension = extensions[++ index];
                if(logger.isDebugEnabled()) {
                    logger.debug("    - Executing plugin: [" + extensionPoint + "] " + extension.module.toString());
                }
                extension.module.doPlugin(options, onePluginCallback);
			}
		};
		onePluginCallback(null, null);
	},
    extensionMap: {},
    extensions: function(extensionPoint){
        if(arguments.length == 2) {
            var extensions = this.extensionMap[extensionPoint];
            if(extensions == null) {
                extensions = [];
                this.extensionMap[extensionPoint] = extensions;
            }
            var addingExtensions = arguments[1];
            for(var i = 0; i < addingExtensions.length; i ++) {
                var addingExt = addingExtensions[i];
                addingExt.priority = addingExt.priority || 10000;
                for(var j = 0; j < extensions.length; j ++) {
                    var ext = extensions[j];
                    if(ext.priority > addingExt){
                        break;
                    }
                }
                extensions.splice(j, 0, addingExt);
            }
        }
        else {
            var extensions = this.extensionMap[extensionPoint];
            if (extensions == null) {
                extensions = [];
                this.extensionMap[extensionPoint] = extensions;
            }
            return extensions;
        }
    }
};

module.exports = extensionUtil;