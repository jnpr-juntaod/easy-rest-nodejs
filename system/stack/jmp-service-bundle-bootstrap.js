var fs = require('fs');
var ServiceBundle = require("./container/jmp-service-bundle");
var bootstrap = {
	init: function(callback) {

        /**
		 * Scan all services to list.
		 */
		logger.system(" ");
		logger.systemStart("Step " + (++ global.bootSteps) + ", Scanning Services");

        //scanning workspace
		var paths = [global.rootpath, global.nodehome + "/node_modules"];
        var serviceContainersMap = {};

        Jx.Naming.register("serviceContainers", serviceContainersMap);
        for(var p = 0; p < paths.length; p ++){
            var path = paths[p];
            var serviceContainers = fs.readdirSync(path);
            for(var i = 0; i < serviceContainers.length; i ++){
                if(serviceContainers[i].startWith("."))
                    continue;
                if(serviceContainersMap[serviceContainers[i]] != null)
                    continue;
                var containerConfig = path + "/" + serviceContainers[i] + "/config.json";
                if(!fs.existsSync(containerConfig))
                    continue;
                var restConfig = path + "/" + serviceContainers[i] + "/rest/rest.json";
                if(!fs.existsSync(restConfig))
                    continue;
                logger.system("  + Found Service Package: " + serviceContainers[i]);
                var serviceContainer = new ServiceBundle("service", path + "/" + serviceContainers[i], serviceContainers[i]);
                serviceContainersMap[serviceContainers[i]] = serviceContainer;
            }
        }

        var redisHelper = require("./redis/jmp-redis-helper");
        var redisClient = redisHelper.redisClient();
        var localIp = Jx.util.getLocalIp();
        var key = localIp + "_" + Jx.serverConfig.port;
        for(var i in serviceContainersMap) {
            serviceContainersMap[i].init();
        }
        redisClient.hset(global.EASY_REST_API_KEY, key, JSON.stringify(serviceContainersMap));

        logger.system(" ");
        logger.systemStart("Step " + (++ global.bootSteps) + ", Scanning Static Contents");
        var webContainersMap = {};
        Jx.Naming.register("staticContainers", webContainersMap);
        for(var p = 0; p < paths.length; p ++) {
            var path = paths[p];
            var webContainers = fs.readdirSync(path);
            for (var i = 0; i < webContainers.length; i++) {
                if(webContainers[i].startWith("."))
                    continue;
                if(webContainersMap[webContainers[i]] != null)
                    continue;
                var configFile = path + "/" + webContainers[i] + "/config.json";
                if (!fs.existsSync(configFile))
                    continue;
                var config = require(configFile);
                if (!config.webapp)
                    continue;
                logger.system("  + Found Static Content Package: " + webContainers[i]);
                var webContainer = new ServiceBundle("webapp", path + "/" + webContainers[i], webContainers[i]);
                webContainersMap[webContainers[i]] = webContainer;
            }
        }

        for(var i in webContainersMap)
            webContainersMap[i].init();
		callback();
	}
};

module.exports = bootstrap;