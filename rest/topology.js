var redisHelper = require("../system/stack/redis/jmp-redis-helper");
var async = require("async");
var topologyRest = {
    topology: function(apiCtx, callback) {
        var client = redisHelper.redisClient();
        client.hkeys(global.EASY_REST_API_KEY, function (err, result) {
            var serverKeys = [];
            async.each(result, function(r, callback) {
                var ipAndPort = r.split("_");
                client.hget(global.EASY_REST_API_KEY, r, function(err, containerStr) {
                    serverKeys.push({ip: ipAndPort[0], port: ipAndPort[1], container: JSON.parse(containerStr)});
                    callback();
                });
            },
            function(err){
                if(err) {
                    callback(err);
                }
                else {
                    callback(null, serverKeys);
                }
            });
        });
    },
    topologyByIp: function(ip, apiCtx, callback) {
        callback(null, [{a: "1", b: "1"}]);
    },
    topologyByIpAndPort: function(ip, port, apiCtx, callback) {
        callback(null, [{a: "1", b: "1"}]);
    }
};

module.exports = topologyRest;