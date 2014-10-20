/**
 * Security Intercepter
 * @param req
 * @param res
 * @param options
 * @param callback
 */

var securityIntercepter = {
	doPlugin: function(options, callback) {
		var req = options.req;
		var res = options.res;
		if(req.session){
			callback();
		}
		else{
			var authenticate = options.container.restObj.authenticate;
			var server = options.server;
			if(authenticate != null && authenticate != ""){
				var authFunc = server.passport.authenticate(authenticate);
				authFunc(req, res, function() {
					callback();
				});
			}
			else
				callback();
		}
	},
    toString: function() {
        return "security-intercepter";
    }
}

module.exports = securityIntercepter;