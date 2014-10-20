var requestEndExtension = {
	doPlugin: function(options, callback) {
        var req = options.req;
        var err = options.err;
        if(err) {
            logger.error(err + ",Path:" + req.uri);
        }
        var apiCtx = req.apiCtx;
		apiCtx.release(options.err);

        if(logger.isDebugEnabled()) {
            var endTime = new Date().getTime();
            logger.debug("  - request ended in " + (endTime - req._startTime) + "ms, uri: [" + req.method + "]" + req.url);
        }
        callback();
	},
    toString: function() {
        return "jmp-request-end";
    }
};

module.exports = requestEndExtension;