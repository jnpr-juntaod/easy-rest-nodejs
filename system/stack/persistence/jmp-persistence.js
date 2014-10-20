/** 
 * @module jmp-persistence
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * The persistence stack of Space Node Server
 * @version 1.0
 * @author Juntao
 * 
 */

/**
 * Get an instance of EntityManager
 * @param options
 * @returns JmpEntityManager
 */
module.exports.instance = function(options){
	options = options || {};
	this.readonly = options.readonly || false;
	this.dataSource = options.dataSource;
	this.transaction = options.transaction || false;
	return new JmpEntityManager(this.readonly, this.transaction, this.dataSource);
};


var dataSourceUtil = require("./jmp-datasource-util");
var async = require("async");
/**
 * @class JmpEntityManager
 */
function JmpEntityManager(readonly, transaction, dataSource){
	this.readonly = readonly;
	this.transaction = transaction;
	this.dataSource = dataSource;
	this.currentConnection = null;
	this.transactionStarted = false;
	this.releasedSign = false;
};


/**
 * Directly execute a sql with sql parameters.
 * @param sql
 * @param values
 * @param callback
 */
JmpEntityManager.prototype.execute = function(sql, values, callback) {
	this.getConnection(function(err, connection){
		connection.query(sql, values, callback);
	});
};

var translateUtil = require("./jmp-translateutil");
/**
 * execute a named query.
 * @type {translatorUtil|exports}
 */
JmpEntityManager.prototype.namedQuery = function(dynamicSql, paramArr, apiCtx, callback) {
    if(paramArr instanceof Jx.ApiContext) {
        callback = apiCtx;
        apiCtx = paramArr;
        paramArr = null;
    }
    var me = this;
    var criteria = apiCtx.criteria();
    if(criteria == null){
        criteria = new Criteria();
        apiCtx.criteria(criteria);
    }
    //translate the dynamic sql according to context
	translateUtil.translate(dynamicSql, apiCtx, function(err, sqlObj){
		if(err)
			callback(err, null);
        else {
            //query and convert according to mapping attribute
            var sql = sqlObj.sql;
            var sqlUnit = sqlObj.sqlUnit;
            me.query(sql, paramArr, criteria.sortable(), criteria.pageable(), function (err, result) {
                if (err) {
                    logger.error("Error while executing sql: " + sql + ",param" + JSON.stringify(paramArr));
                    callback(err);
                }
                else {
                    //process chain query(reference or children)
                    if(result.length > 0 && sqlObj.chain && sqlObj.chain.length > 0) {
                        //fetch chain records for each parent attribute in parallel
                        async.each(sqlObj.chain,
                            function(chain, callback){
                                var chainObj = sqlUnit.field(chain)
                                var jointValueArr = [];
                                for(var i = 0; i < result.length; i ++) {
                                    var value = result[i][chainObj.jointField];
                                    if(value == null || value == "")
                                        continue;
                                    if(jointValueArr.indexOf(value) != -1)
                                        continue;
                                    jointValueArr.push(value);
                                }
                                var param = [jointValueArr];
                                me.namedQuery(chainObj.ormId, param, apiCtx, function(err, cresult, cSqlObj) {
                                    if(err)
                                        callback(err);
                                    else {
                                        try {
                                            mappingChildrenResult(chainObj, chain, result, cresult, cSqlObj);
                                            callback(err, null);
                                        }
                                        catch(err) {
                                            callback(err);
                                        }
                                    }
                                });
                            },
                            function(err) {
                                if(err)
                                    callback(err);
                                else {
                                    mapResult(result, sqlUnit, apiCtx, function (err, result) {
                                        callback(err, result, sqlObj);
                                    });
                                }
                            }
                        );
                    }
                    else {
                        mapResult(result, sqlUnit, apiCtx, function (err, result) {
                            callback(err, result, sqlObj);
                        });
                    }
                }
            });
        }
	});
};

JmpEntityManager.prototype.namedQuerySingleResult = function(dynamicSql, paramArr, apiCtx, callback) {
    this.namedQuery(dynamicSql, paramArr, apiCtx, function(err, result) {
        if(err)
            callback(err);
        else
            callback(null, result[0]);
    });
};

function mapResult(result, sqlUnit, apiCtx, callback) {
    //convert by sql unit.
    var records = null;
    var mappingDatas = [];
    var count = null;
    if(result instanceof Jx.Page) {
        records = result.records();
        count = result.totalRecords();
    }
    else
        records = result;
    var fieldsMap = sqlUnit.fieldsMap();
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var mappingData = {};
        for (var col in record) {
            var colInf = fieldsMap[col];
            if (colInf == null)
                continue;
            var func = colInf.func;
            if(func) {
                func();
            }
            else {
                var path = colInf.path;
                var currData = mappingData;
                for (var p = 0; p < path.length; p++) {
                    if (p == path.length - 1)
                        currData[path[p]] = record[col];
                    else if (currData[path[p]] == undefined) {
                        var obj = {};
                        currData[path[p]] = obj;
                        currData = obj;
                    }
                    else
                        currData = currData[path[p]];
                }
            }
        }
        mappingDatas.push(mappingData);
    }

    var datas = {};
    var mapping = sqlUnit.mapping();
    if(mapping) {
        if(typeof mapping == "string") {
            var ms = mapping.split("/");
            var currData = datas;
            for(var i = 0; i < ms.length; i ++) {
                if(i != ms.length - 1) {
                    currData[ms[i]] = {};
                    currData = currData[ms[i]];
                }
                else {
                    currData[ms[i]] = mappingDatas;
                    currData["@size"] = count;
                }
            }
        }
        else
            throw new Jx.JmpRuntimeError("Not implemented");
    }
    else
        datas = mappingDatas;

    postProcess(datas, sqlUnit, apiCtx, callback);
}

function mappingChildrenResult(chainObj, chain, result, cresult, cSqlObj) {
    var cJointField = chainObj.cJointField;
    var jointField = chainObj.jointField;
    if (jointField == null || jointField == "" || cJointField == null || cJointField == "") {
        throw new Jx.JmpRuntimeError("jointField or cJointField can not be null for attribute: " + chain);
    }
    else{
        var clist = Jx.util.find(cresult, cSqlObj.sqlUnit.mapping());
        for (var i = 0; i < result.length; i++) {
            var record = result[i];
            var jointValue = record[jointField];
            var crecords = [];
            for (var j = 0; j < clist.length; j++) {
                if (clist[j][cJointField] == jointValue)
                    crecords.push(clist[j]);
            }
            record[chain] = crecords;
        }
    }
}

function postProcess(result, sqlUnit, apiCtx, callback) {
    //after all have been done. invoke postProcess for further processing.
    var postProcess = sqlUnit.postProcess();
    if (postProcess) {
        postProcess(apiCtx, result, function(err, result) {
            callback(err, result);
        });
    }
    else
        callback(null, result);
}

/**
 * @memberof JmpEntityManager
 * @param {String} sql - Sql to be executing.
 * @param {Pageable} [pageable] - Pageable criteria
 * @param {Sortable} [sortable] - Sortable criteria
 * @param {Function} [callback] - Callback function
 */
JmpEntityManager.prototype.query = function() {
	if(arguments.length < 2 || arguments.length > 5){
		return callback(new Jx.JmpRuntimeError("illegal arguments, must be at least one sql and one callback and less than 4 parameters"));
	}
	
	//fix parameters
	var sql , sortable , pageable,  callback, params;
	for(var i = 0; i < arguments.length; i ++){
	    if(typeof arguments[i] == "string"){
	    	sql = arguments[i];
	    }
		else if(arguments[i] instanceof Jx.Pageable){
			pageable = arguments[i];
		}
		else if(arguments[i] instanceof Jx.Sortable){
			sortable = arguments[i];
		}
		else if(typeof arguments[i] == "function"){
			callback = arguments[i];
		}
        else if(arguments[i] instanceof Array)
            params = arguments[i];
	}
	var fullSql = buildQuerySql(sql, sortable, pageable);
	this.getConnection(function(err, connection){
		connection.query(fullSql, params, function(err, result){
			if(err)
				callback(err);
			else{
				if(pageable != null && pageable.pageSize > 0){
					var countSql = buildCountSql(sql);
					connection.query(countSql, params, function(err, countResult){
						if(err){
							return callback(err);
						}
						else{
							var count = countResult[0]["c"];
							callback(null, new Jx.Page(result, count));
						}
					});
				}
				else {
                    if(pageable)
                        callback(null, new Jx.Page(result, result.length));
                    else
                        callback(null, result);
                }
			}
		});
	});
};

/**
 * @private
 * @param sql
 * @param sortable
 * @param pageable
 * @returns {*}
 */
function buildQuerySql(sql, sortable, pageable){
	if(sortable != null){
		if(typeof sortable == "string"){
			sql += " ORDER BY " + sortable;
		}
		else{
			sql += " ORDER BY " + sortable.toString();
		}
	}
	if(pageable != null && pageable.pageSize > 0){
		sql += " limit " + pageable.offset + "," + pageable.pageSize;
	}
	return sql;
}

/**
 * @private
 * @param sql
 * @returns {string}
 */
function buildCountSql(sql){
	var countSql = "select count(*) as c from (" + sql + ") count_tb";
	return countSql;
}

/**
 * Release current connection.If there is transaction in this connection, the transaction will be committed.
 * @param roolback
 * @param callback
 */
JmpEntityManager.prototype.release = function(rollback, callback) {
	if(rollback instanceof Function){
		callback = rollback;
		rollback = false;
	}
	if(rollback == null)
		rollback = false;
	callback = callback || function() {};
	if(this.releasedSign)
		callback();
	this.releasedSign = true;
	var oThis = this;
	if(this.transactionStarted){
		if(rollback){
			this.currentConnection.rollback(function(err){
				if(err)
					logger.error(err);
				oThis.transactionStarted = false;
				oThis.currentConnection.release();
				oThis.currentConnection = null;
				callback(err);
			});
		}
		else{
			this.currentConnection.commit(function(err){
				if(err){
					logger.error(err);
					oThis.currentConnection.rollback(function(err){
						if(err)
							logger.error(err);
						oThis.transactionStarted = false;
						oThis.currentConnection.release();
						oThis.currentConnection = null;
						callback(err);
					});
				}
				else{
					oThis.transactionStarted = false;
					oThis.currentConnection.release();
					oThis.currentConnection = null;
					callback(err);
				}
			});
		}
	}
	else{
		if(this.currentConnection){
			this.currentConnection.release();
			this.currentConnection = null;
			callback();
		}
	}
};

/**
 * return if the entity manager has been released.
 * @returns {boolean}
 */
JmpEntityManager.prototype.released = function() {
	return this.releasedSign;
};

/**
 *
 * get a connection of db.
 * @private
 */
JmpEntityManager.prototype.getConnection = function(callback) {
	if(this.currentConnection == null){
		var oThis = this;
		dataSourceUtil.dataSource(this.dataSource).getConnection(function(err, connection){
			if(err)
				callback(err);
			else{
				oThis.currentConnection = connection;
				if(oThis.transaction && (!oThis.transactionStarted)){
					connection.beginTransaction(function(err){
						if(err)
							callback(err, null);
						else{
							oThis.transactionStarted = true;
							callback(null, connection);
						}
					});
				}
				else{
					callback(null, connection);
				}
			}
		});
	}
	else{
		callback(null, this.currentConnection);
	}
};