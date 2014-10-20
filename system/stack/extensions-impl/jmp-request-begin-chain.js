/**
 * Security Intercepter
 * @param req
 * @param res
 * @param options
 * @param callback
 */
var chainIntercepter = {
	doPlugin: function(options, callback) {
        callback();
	},
    toString: function() {
        return "chain-intercepter";
    }
}

module.exports = chainIntercepter;