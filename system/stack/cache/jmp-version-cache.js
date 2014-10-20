/**
 * @module VersionCache
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Version Cache instance.
 * @version 2.0
 * @author Jian Ni
 *
 */

function VersionCache(tables, realtime) {
    this._tables = tables;
    this._realtime = realtime;
    this._interval = 2000;
    this._version = {};
    this._localcache = {};
    if(!realtime) {
        setInterval(this.versionCheck(), this._interval);
    }
    this.redisclient = require("../redis/jmp-redis-helper").redisClient();
}

VersionCache.prototype = {
    get: function(key, field, callback) {
        var me = this;
        var localversion = this.localVersion(key);

        if(this._realtime) {
            this.getDbVersion(function(err, result){
                if (err)
                    logger.error(err);
                if (localversion == "" || localversion != result) {
                    var dbversion = result;
                    me.loadData(field, function(err, result){
                        if (err)
                            logger.error(err);
                        var value = JSON.stringify(result);
                        var cache = {};
                        cache[field] = value;
                        me.putLocalCache(key, cache, dbversion);
                        callback(null, me.getLocalCache(key, field));
                    });
                }
            });

        }
        else {
            this.getRedisVersion(function(err, result){
                if(err) {
                    logger.error(err);
                }
                var redisversion = result;
                if(localversion == undefined || redisversion == ""){
                    me.getDbVersion(function(err, result){
                        if (err)
                            logger.error(err);
                        var dbversion = result;
                        me.loadData(field, function(err, result){
                            if (err)
                                logger.error(err);
                            var value = JSON.stringify(result);
                            var cache = {};
                            cache[field] = value;
                            me.setRedisCache(me.rediskey, field, value);
                            me.setRedisVersion(me.redisversionkey, dbversion);
                            me.putLocalCache(key, cache, dbversion);
                            callback(null, me.getLocalCache(key, field));
                        });
                    });

                }
                else if (localversion != result || me.getLocalCache(key) == undefined) {
                    me.getRedisCache(key, field, function(err, result){
                        if(err){
                            logger.error(err);
                        }
                        var cache = {};
                        cache[field] = result;
                        me.putLocalCache(key, cache, redisversion);
                        callback(null, me.getLocalCache(key, field));
                    });

                }
            });
        }


    },

    set: function(key, value) {
        this._localcache[key] = value;
    },

    localVersion: function(key) {
        return this._version[key];
    },

    setVersion: function(key, value) {
        this._version[key] = value;
    },

    putLocalCache:  function(key, value, version){
        this._localcache[key] = value;
        this._version[key] = version;
    },

    getLocalCache: function(key, field) {
       return this._localcache[key][field];
    },

    loadData: function(field, callback) {},

    setRedisCache: function (key, field, value) {
        this.redisclient.hset(key, field, value, function(err, result){
            if(err)
                logger.error(err);
        });
    },

    setRedisVersion: function (key, value) {
        this.redisclient.set(key, value, function(err, result){
            if(err)
                logger.error(err);
        });
    },

    getRedisCache: function (key, field, callback) {
        var me = this;
        this.redisclient.hget(key, field, function(err, result){
            if(err) {
                logger.error(err);
            }
            //if cache is not found in redis, loadData from DB
            if(result == "") {
                me.loadData(field, function(err, result){
                    if(err)
                        logger.error(err);
                    var value = JSON.stringify(result);
                    var cache = {};
                    cache[field] = value;
                    me.setRedisCache(me.rediskey, field, value);
                    me.setRedisVersion(me.redisversionkey, dbversion);
                    me.putLocalCache(key, cache, dbversion);
                });
            }
            callback(null, result);
        });
    },

    getRedisVersion: function(callback){
        this.redisclient.get(this.redisversionkey, function(err, result){
            callback(err, result);
        });
    },

    getRedisfield: function(callback){
        this.redisclient.hkeys(this.rediskey, function(err, result){
            callback(err, result);
        });
    },

    getDbVersion: function(callback) {
        var me = this;
        var pm = Jx.JmpPersistence.instance({dataSource: "MySqlDS"});
        var tables = me._tables;
        pm.query("select update_time, table_name from information_schema.tables where table_schema= ? and table_name in (?)", ['build_db', tables], function(err, result) {
            if(err)
                callback(err);
            else {
                var key = "";
                for (var i = 0; i < tables.length; i++) {
                    for (var j = 0; j < result.length; j++) {
                        if (result[j]["table_name"] == tables[i]) {
                            key += result[j]["update_time"]?Math.round(+result[j]["update_time"]/1000):0;
                            break;
                        }
                    }
                    if (i != tables.length - 1)
                        key += "_";
                }
                callback(null, key);
            }
        });
    },

    versionCheck: function() {
        var me = this;
        this.getDbVersion(function(err, result){
            if(err)
                logger.error(err);
            var dbversion = result;
            me.getRedisVersion(function(err, result){
                if(err)
                    logger.error(err);
                if(result == "" || result != dbversion) {
                    //Update all Redis cache
                    me.getRedisfield(function(err, result){
                        var fields = result;
                        for (var i =0; i < fields.length; i++) {
                            me.loadData(fields[i], function (err, result) {
                                if (err)
                                    logger.error(err);
                                var value = JSON.stringify(result);
                                me.setRedisCache(me.rediskey, fields[i], value);
                                me.setRedisVersion(me.redisversionkey, dbversion);
                            });
                        }
                    });

                }
            });

        });
    }

};

module.exports = VersionCache;