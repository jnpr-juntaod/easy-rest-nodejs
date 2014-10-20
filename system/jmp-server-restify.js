/** 
 * @module jmp-server-restify
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * The restify http server. It will handle all rest requests and static contents.
 * @version 1.0
 * @author Juntao
 * 
 */

var restify = require('restify');
var log4js = require("log4js");
module.exports = {
	serverInstance: null,
	passport: null,
	strategy: null,
	/**
	 * starting server with configurations. 
	 */
	start: function(options, callback){
        //get formatters from plugin and register them to restify server.
        var formatOptions = {formatters: {}};
        logger.system("  + Triggering response-formatter extensions");
		Jx.extensionUtil.triggerExtensions("response-formatter", formatOptions);
        var server = restify.createServer({
			name: Jx.serverConfig.name,
            formatters: formatOptions.formatters
		});

		//add filters to server
		server.use(restify.acceptParser(server.acceptable.concat(["text/css"])));
		server.use(restify.dateParser());
		server.use(restify.queryParser());
		server.use(restify.gzipResponse());
		server.use(restify.bodyParser());
		server.use(restify.conditionalRequest());

		//handle request logger.
		server.use(logger.getServerPlugin());

		//add convenient methods to request and response objects,like getCookie, setCookie
		server.use(require("./jmp-req-res"));

		//add Jmp Session Manager to server
		server.use(require("./jmp-session").sessionFilter);

		//add Security Support to server
		this.passport = require("passport");
		server.use(this.passport.initialize());
		server.use(this.passport.session());

		this.passport.serializeUser(function(req, user, done) {
			done(null, user.id);
		});

		this.passport.deserializeUser(function(req, id, done) {
			done(null, req.session.user);
		});
		
		server.listen(options.port, function() {
			callback(null, server);
		});

		server.on("uncaughtException", function(req, res, route, err) {
			logger.error(err);
		});
		
		server.on("after", function(req, res, route, err) {
			if(err)
				logger.error(err);
			var options = {req: req, res: res, route: route, err: err};
			//for performance issue, we separated rest apis' finish event and all finish event(including static contents).
			if(req._is_rest_call){
				Jx.extensionUtil.triggerExtensions("requestFinished", options, function(){
				});
			}
			Jx.extensionUtil.triggerExtensions("allRequestFinished", options, function(){
			});
		});
		
		this.serverInstance = server;
	},
	
	/**
	 * Server static content. a light wrapper.
	 * @param options
	 */
	serverStatic: function(options) {
		return restify.serveStatic(options);
	}
};