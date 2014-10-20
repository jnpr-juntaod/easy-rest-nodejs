var sqlBuilderEntry = require("./testentries/testentry-sqlbuilder");
var testUnitsRest = {
    action: function(action, apiCtx, callback) {
        if(action == "testGetLocalIp") {
            var ip = Jx.Util.getLocalIp();
            callback(null, ip);
        }
        else if(action == "testSqlBuilder") {
            sqlBuilderEntry.test(apiCtx, callback);
        }
        else
            callback(new Jx.JmpRuntimeError("Unknown action"));
    }
};

module.exports = testUnitsRest;