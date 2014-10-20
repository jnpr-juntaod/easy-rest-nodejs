var ormUtil = {
    mappingInfo: {},

    /**
     * scan and require all model objects.register them to the global mapping map according to the path
     */
    scanOrmObjects: function() {
        var fs = require("fs");
        var serviceContainers = Jx.Naming.lookup("serviceContainers");
        for(var i in serviceContainers) {
            var container = serviceContainers[i];
            var mopath = container.containerPath + "/orm";
            var exists = fs.existsSync(mopath);
            if(exists) {
                var files = fs.readdirSync(mopath);
                for(var j = 0; j < files.length; j ++) {
                    try {
                        var orm = require(mopath + "/" + files[j]);
                        for(var m in orm) {
                            this.mappingInfo[m] = orm[m];
                            this.dumpOrmInformation(orm, "  ");
                        }
                    }
                    catch(err) {
                        logger.error("error while resolving orm object: " + mopath + "/" + files[j] + " " + err);
                        throw new Jx.JmpRuntimeError("error while resolving orm object: " + mopath + "/" + files[j]);
                    }
                }
            }
        }
    },

    /**
     * recursively dump the dynamic sql mapping information.
     * @param obj
     * @param indent
     */
    dumpOrmInformation: function(obj, indent) {
        //dynamic sql itself, return
        if(obj.select || obj.extend || obj instanceof String)
            return;
        for(var i in obj) {
            logger.system(indent + "- OR Mapping: " + i);
            this.dumpOrmInformation(obj[i], indent + "  ");
        }
    },

    /**
     * get O/R Mapping information by path.
     * @param namespace
     * @returns {*}
     */
    getMappingByPath: function(path) {
        if(path == null)
            return null;
        var paths = path.split("/");
        var currObj = this.mappingInfo;
        for(var i = 0; i < paths.length; i ++) {
            currObj = currObj[paths[i]];
            if(currObj == null)
                return null;
            if(i == paths.length - 1)
                return currObj;
        }
    }
};

module.exports = ormUtil;