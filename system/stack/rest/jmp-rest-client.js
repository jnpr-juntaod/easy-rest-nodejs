var restify = require('restify');

var restClient = {
	createJsonClient: function(options) {
		return new RestClientProxy(options);
	},
	createStringClient: function() {
		
	},
	createHttpClient: function() {
		
	}
};


function RestClientProxy(options) {
    options = options || {};
    if(typeof options == 'string'){
        options = {url: options};
    }
    if(!options.url){
        options.url = Jx.serverConfig.load_balancer_protocol + "://" + Jx.serverConfig.load_balancer_host + ":" + Jx.serverConfig.load_balancer_port;
    }
    options.signRequest = this.preFunc();
    this.clientInstance = restify.createJsonClient(options);
    this.options = options;
};

/**
 * Get or set apiCtx to current rest client instance.
 * @returns {Jx.ApiContext}
 */
RestClientProxy.prototype.apiCtx = function() {
    if(arguments.length == 0)
        return this._apiCtx;
    else
        this._apiCtx = arguments[0];
};

RestClientProxy.prototype.release = function() {
    this._apiCtx = null;
};

/**
 * Get or set authentication options to current rest client instance.
 * @returns {authenticate}
 */
RestClientProxy.prototype.authenticate = function() {
    if (arguments.length == 0)
        return this.options.authenticate;
    else {
        this.options.authenticate = arguments[0];
        if(this.options.authenticate && this.options.authenticate.strategy === 'basic'){
            this.clientInstance.basicAuth(this.options.authenticate.user, this.options.authenticate.password);
        }
    }
};

RestClientProxy.prototype.handleParams = function(path, queryParam){
    var qs = require('querystring');
    if(path.indexOf('?') > 0){
        path += '&' + qs.stringify(queryParam);
    }
    else {
        path += '?' + qs.stringify(queryParam);
    }
    return path;
};

RestClientProxy.prototype.handleOption = function(protocol, options){
    if(options == null)
        throw new Jx.JmpRuntimeError("options can not be null");
    if(typeof options === 'string') {
        options = {path: options};
    }
    if(protocol == "get" && options.bodyParam) {
        throw new Jx.JmpRuntimeError("Get protocol doesn't accept bodyParam");
    }

    if(options.queryParam){
        options.path = this.handleParams(options.path, options.queryParam);
    }
    if(options.criteria){
        options.path = this.handleParams(options.path, options.criteria.query());
    }
    return options;
};

RestClientProxy.prototype.sendRestReq = function(protocol, options, callback) {
    try{
        var optionObj = this.handleOption(protocol, options);
        function restCallback(err, req, res, obj) {
            if (err) {
                if(global.logger)
                    logger.error(err);
                err.details = err.message;
                err.message = "Error while requesting: [" + protocol + "] " + optionObj.path;
                callback(err);
            }
            else {
                if (req.getHeader('x-pmc-action-id')) {
                    //console.log('x-pmc-action-id is %s', req.getHeader('x-pmc-action-id'));
                    //console.log('pmc: %j', obj.pmc);
                    if (obj.data)
                        callback(null, req, res, obj.data);
                    else
                        callback(null, req, res);
                } else {
                    callback(null, req, res, obj);
                }
            }
        }
        if(optionObj.bodyParam)
            this.clientInstance[protocol](optionObj, optionObj.bodyParam, restCallback);
        else
            this.clientInstance[protocol](optionObj, restCallback);
    }
    catch(err) {
        callback(err);
    }
};

RestClientProxy.prototype.preFunc = function() {
    var func = function(req) {
        var owner = arguments.callee.owner;
        var apiCtx = owner.apiCtx();
        if(apiCtx && apiCtx.pmccallid()){
            req.headers['x-pmc-action-id'] = apiCtx.pmccallid();
            if(apiCtx.threadtracer() && apiCtx.threadtracer().threadinfo()){
                req.headers['x-pmc-parent-id'] = apiCtx.pmccallid()
            }
        }
    };
    func.owner = this;
    return func;
};

RestClientProxy.prototype.get = function(options, callback) {
    this.sendRestReq('get', options, callback);
};

RestClientProxy.prototype.put = function(options, callback) {
    this.sendRestReq('put', options, callback);
};

RestClientProxy.prototype.post = function(options, callback) {
    this.sendRestReq('post', options, callback);
};

RestClientProxy.prototype.delete = function(options, callback) {
    this.sendRestReq('del', options, callback);
};

module.exports = restClient;
