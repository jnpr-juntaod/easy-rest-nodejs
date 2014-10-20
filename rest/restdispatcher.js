var restClient = Jx.restClient.createJsonClient({});
var async = require("async");
var restPool = null; //get rest pool from redis.
var permissionCache = null;//
var restDispatcher = {
    dispatch: function(apiCtx, callback) {
//        var targetRest = this.getTargetRest(apiCtx);
        async.each([
            checkRbac,
            chain,
            requestTarget,
            performanceRecord
        ], function(err, result) {
            //auditLog();
            if(err)
                callback(err);
            else
                callback(null, result);
        });


        function checkRbac(callback) {
            //targetRest.capability;
            callback();
        }

        function auditLog(callback) {
            //record audit log to db;
            callback();
        }

        function performanceRecord(callback) {
            callback();
        }

        function chain(callback) {
            callback();
        }

        function requestTarget(callback) {
            callback();
        }
    }
};



module.exports = restDispatcher;