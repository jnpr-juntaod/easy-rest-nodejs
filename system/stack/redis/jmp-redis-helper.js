var redis = require("redis");

var redisHelper = {
    clientInstance: null,
    redisClient: function() {
        if(this.clientInstance == null) {
            this.clientInstance = redis.createClient();
        }
        return this.clientInstance;
    }
};

module.exports = redisHelper;