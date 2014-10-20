/**
 * @module jmp-rest-client-pool
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * This is the pool for backend rest client instances. It can significantly save the creating time for each request.
 * @version 1.0
 * @author Juntao
 *
 */
var restClientPool = {
    idlePool: [],
    usingPool: [],
    increaseSize: 20,
    idleInstance: function() {
        if(this.idlePool.length > 0) {
           var ins = this.idlePool.shift();
           this.usingPool.push(ins);
           return ins;
        }
        //there are no idle instances, create new.
        var instances = this.createInstances();
        for(var i = 0; i < instances.length; i ++) {
            this.idlePool.push(instances[i]);
        }
        return this.idleInstance();
    },

    returnInstance: function(instance) {
        var found = false;
        for(var i = 0; i < this.usingPool.length; i ++) {
            if(this.usingPool[i] === instance) {
                var ins = this.usingPool.splice(i, 1);
                this.idlePool.push(ins[0]);
                found = true;
                break;
            }
        }
        if(!found) {
            logger.error("No rest client was found in using pool");
        }
    },

    /**
     * @private
     * @returns {Array}
     */
    createInstances: function() {
        var instances = [];
        for(var i = 0; i < this.increaseSize; i++) {
            instances[i] = Jx.restClient.createJsonClient();
        }
        return instances;
    }
};

module.exports = restClientPool;