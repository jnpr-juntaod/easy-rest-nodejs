var extensionUtil = require("../extensions/jmp-extension-util");
var intercepters = {
	intercept: function(container, server) {
		function func (req, res, callback) {
			var container = arguments.callee.container;
			var server = arguments.callee.server;
            if(logger.isDebugEnabled()) {
                req._startTime = new Date().getTime();
                logger.debug("  + A new request was accepted, uri: [" + req.method + "]" + req.url);
            }
			var options = {req: req, res: res, server: server, container: container};
			extensionUtil.triggerExtensions("requestBegin", options, callback);
		};
		
		func.container = container;
		func.server = server;
		return func;
	},
	init: function() {
		
	}
};

module.exports = intercepters;