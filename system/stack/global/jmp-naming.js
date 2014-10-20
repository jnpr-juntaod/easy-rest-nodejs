/** 
 * @module jmp-common
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Global register center. Put any global variable here with key/value.
 * @version 1.0
 * @author Juntao
 */

var Naming = {
	objectPool: {},
	lookup: function(key){
		return this.objectPool[key];
	},
	register: function(key, value){
		this.objectPool[key] = value;
	}
};

module.exports = Naming;