/**
 * @module jmp-datasource
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * The DataSource Model that can support failover and read/write separation features.
 * @version 1.0
 */

var mysql = require("mysql");
function DataSource(dsconfig){
	this.dsconfig = dsconfig;
	this.hasReadDataSource = false;
	this.init();
}

DataSource.prototype.init = function() {
	this.poolCluster = mysql.createPoolCluster();
	this.poolCluster.dsconfig = this.dsconfig;
	if(!this.dsconfig.defaultGroup || this.dsconfig.defaultGroup.length == 0){
		throw new Jx.JmpContainerError("The defaultGroup of database configurations can not be null");
	}
	for(var i = 0; i < this.dsconfig.defaultGroup.length; i ++){
		this.poolCluster.add("WRITE" + i, this.dsconfig.defaultGroup[i]);	
	}
	
	if(this.dsconfig.readGroup && this.dsconfig.readGroup.length > 0){
		this.hasReadDataSource = true;
		for(var i = 0; i < this.dsconfig.readGroup.length; i ++){
			this.poolCluster.add("READ" + i, this.dsconfig.readGroup[i]);	
		}
	}
	
	var me = this;
	this.poolCluster.on('remove', function (nodeId) {
		logger.system('[DataSource] datasource was removed : ' + nodeId); //nodeId = MASTER I
		//tryRecovery(nodeId);
		me.init();
	});
};

DataSource.prototype.getConnection = function(callback, readonly) {
	readonly = readonly || false;
	var me = this;
	if(this.hasReadDataSource && readonly){
		this.poolCluster.getConnection('READ*', 'RANDOM', function (err, connection) {
			if(err){
				logger.system(err);
				this.poolCluster.getConnection('WRITE*', 'ORDER', function (err, connection) {
					if(err){
						logger.system(err);
						callback(err);
					}
					else{
                        if(logger.isDebugEnabled())
						    logger.debug("    - Got connection from WRITE queue, DataSource: " + me.dsconfig.name + ", Readonly: " + readonly);
						callback(null, connection);
					}
				});
			}
			else{
                if(logger.isDebugEnabled())
				    logger.debug("    - Got connection from READ queue, DataSource: " + me.dsconfig.name + ", Readonly: " + readonly);
				callback(null, connection);
			}
		});
	}

	else{
		this.poolCluster.getConnection('WRITE*', 'ORDER', function (err, connection) {
			if(err){
				logger.system(err);
				callback(err);
			}
			else{
                if(logger.isDebugEnabled())
				    logger.debug("    - Got connection from WRITE queue, DataSource: " + me.dsconfig.name + ", Readonly: " + readonly);
				callback(null, connection);
			}
		});
	}
};

/**
 * try to recover the failed node
 * @param nodeId
 */
function tryRecovery(nodeId){
	//setTimeout();
}

module.exports = DataSource;