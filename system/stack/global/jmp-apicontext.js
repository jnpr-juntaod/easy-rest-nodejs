/** 
 * @module jmp-apicontext
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * The context that crosses one request's lifecycle.
 * @version 1.0
 * @author Juntao
 * 
 */

/**
 * @class ApiContext
 */
//var requestPool = require("../../pmc/pmc-request-pool");
var restClientPool = require("../rest/jmp-rest-client-pool");
function ApiContext(req, res){
	this.req = req;
	this.res = res;
	this._principal = null;
	this.currentCriteria = null;
	this.threadTracerObject = null;
	this.pmcCallId = null;
	this.currentConnection = null;
	this.dataSourceObj = null;
	this._persistenceApi = null;
	this._persistenceApiNoTx = null;
	this._persistenceApiRO = null;
    //keep the singleton of rest client.
    this._restJsonClient = null;
    this._attrObj = null;
};

ApiContext.prototype.request = function() {
	return this.req;
};

ApiContext.prototype.response = function() {
	return this.res;
};

ApiContext.prototype.restJsonClient = function() {
  if(this._restJsonClient == null){
      this._restJsonClient = restClientPool.idleInstance();
      this._restJsonClient.apiCtx(this);
      this._restJsonClient.authenticate({strategy: "basic", user: "super", password: "super123"});
  }
  return this._restJsonClient;
};

ApiContext.prototype.persistenceApi = function(create) {
	if(create == null)
		create = true;
	if(this._persistenceApi == null || this._persistenceApi.released()){
		if(create)
			this._persistenceApi = Jx.JmpPersistence.instance({readonly: false, dataSource: this.dataSourceObj, transaction: true});
		else
			this._persistenceApi = null;
	}
	return this._persistenceApi;
};

ApiContext.prototype.persistenceApiNoTx = function(create) {
	if(create == null)
		create = true;
	if(this._persistenceApiNoTx == null || this._persistenceApiNoTx.released()){
		if(create)
			this._persistenceApiNoTx = Jx.JmpPersistence.instance({readonly: false, dataSource: this.dataSourceObj, transaction: false});
		else
			this._persistenceApiNoTx = null;
	}
	return this._persistenceApiNoTx;
};

ApiContext.prototype.persistenceApiRO = function(create) {
	if(create == null)
		create = true;
	if(this._persistenceApiRO == null || this._persistenceApiRO.released()){
		if(create)
			this._persistenceApiRO = Jx.JmpPersistence.instance({readonly: true, dataSource: this.dataSourceObj, transaction: false});
		else
			this._persistenceApiRO = null;
	}
	return this._persistenceApiRO;
};

ApiContext.prototype.dataSource = function() {
	if(arguments.length == 1)
		this.dataSourceObj = arguments[0];
	else
		return this.dataSourceObj;
};

ApiContext.prototype.connection = function() {
	if(arguments.length == 1)
		this.currentConnection = arguments[0];
	else
		return this.currentConnection;
};

//ApiContext.prototype.threadTracer = function() {
//	if(arguments.length == 1){
//		this.threadTracerObject = arguments[0];
//		requestPool.push(this.threadTracerObject.threadinfo());
//	}
//	else
//		return this.threadTracerObject;
//};
//
//ApiContext.prototype.pmccallid = function() {
//	if(arguments.length == 1)
//		this.pmcCallId = arguments[0];
//	else
//		return this.pmcCallId;
//};

ApiContext.prototype.principal = function() {
	if(arguments.length == 0)
		return this._principal;
	else
		this._principal = arguments[0];
};

ApiContext.prototype.criteria = function() {
	if(arguments.length == 0)
		return this.currentCriteria;
	else
		this.currentCriteria = arguments[0];
};

ApiContext.prototype.attribute = function() {
    if(arguments.length == 1) 
        return this._attrObj == null ? null : this._attrObj[arguments[0]];
    else if(arguments.length == 2) {
        if(this._attrObj == null)
            this._attrObj = {};
        this._attrObj[arguments[0]] = arguments[1];
    }
};

ApiContext.prototype.release = function(err) {
    var pm = this.persistenceApi(false);
    if(pm){
        if(err)
            pm.release(true);
        else
            pm.release(false);
    }
    pm = this.persistenceApiNoTx(false);
    if(pm)
        pm.release();
    pm = this.persistenceApiRO(false);
    if(pm)
        pm.release();
    if(this._restJsonClient) {
        restClientPool.returnInstance(this._restJsonClient);
        this._restJsonClient = null;
    }
};

module.exports = ApiContext;