require("easy-rest").testEntry();
var assert = require("assert");
var restClient = Jx.restClient.createJsonClient();
describe('test_version_cache', function(){
    it('should return action name', function(callback){
        restClient.get(Jx.API_PREFIX + '/data/cache-management:testentry/action=testUserCapabilityCache', function(err, req, res, result) {
            console.log(result);
            assert(result != null);
            callback();
        });
    });
});
