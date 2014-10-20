/**
 * @module jmp-datasource-util
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * This util will help to scan all database configurations, initialize them and provide an API to access them.
 * @version 1.0
 */
var DataSource = require("./jmp-datasource");
var dataSourceUtil = {
    /**
     * @private
     * dataSources map
     */
	dsMap: {},

    /**
     * @private
     * initialize all dataSources according to the configurations.
     */
	init: function() {
		var dbconfig = require("../../jmp-confighelper").mergeConfig("db-config.js");
		for(var i = 0; i < dbconfig.length; i ++){
			for(var j = 0; j < dbconfig[i].length; j ++){
				var config = dbconfig[i][j];
				var ds = new DataSource(config);
				this.dsMap[config.name] = ds;
				logger.system("  - DataSource: " + config.name + " was initialized");
			}
		}
	},

    /**
     * get the dataSource according to dsName.
     * @param dsName
     * @returns {*}
     */
	dataSource: function(dsName) {
		if(dsName == null){
			throw new Jx.JmpContainerError("Datasource name can not be null");
		}
		
		return this.dsMap[dsName];
	}
};

module.exports = dataSourceUtil;