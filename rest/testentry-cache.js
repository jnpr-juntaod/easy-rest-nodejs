var usrcapabilitycache = require("../system/stack/cache/user-capability");
var testEntry = {
    test: function(action, apiCtx, callback) {
        if(action == "testUserCapabilityCache") {
            usrcapabilitycache.get("user_capability", "758", function(err, result){
                //var value = result;
                callback(null, {"result": result});
            });

            //usrcapabilitycache.versionCheck();
        }
        else
            callback(null, {"result": "Action: " + action});
    }
};

module.exports = testEntry;