var fs = require("fs");
var util = {
	getServicePackageNames: function() {
		var dirPath = rootpath + "/service";
		var dirs = fs.readdirSync(dirPath);
		return dirs;
	},
	
	getServiceContainerNames: function(packName) {
		var dirPath = rootpath + "/service/" + packName;
		var dirs = fs.readdirSync(dirPath);
		for(var i = 0; i < dirs.length; i ++) {
			if(dirs[i] == "configurations"){
				dirs.splice(i, 1);
				break;
			}
		}
		return dirs;
	},
    memUsage: function(pid, callback) {
        var cmd = "pmap -x " + pid + "|grep total|awk '{print$4}'";
        var exec = require("child_process").exec;
        var mem = 0;
        var pm = exec(cmd);
        pm.on("close", function() {
            callback(null, mem);
        });
        pm.stdout.on("data", function(total) {
            mem = total;
        });
    },
    /**
     * get local ip address by name and family
     * @param name - name of interface, default is 'eth0'
     * @param family - family of interface, default is 'ipv4'
     * @returns {*}
     */
    getLocalIp: function(name, family) {
        family = family || "ipv4";
        var os = require('os');
        var ifaces = os.networkInterfaces();

        //remove loopback
        for (var dev in ifaces) {
            if (dev.toLowerCase().indexOf('loopback') != -1 || dev.toLowerCase() == "lo") {
                delete  ifaces[dev];
                continue;
            }
        }

        var ip = null;
        if(name == null || name == "") {
            if(ifaces["eth0"] != null) {
                name = "eth0";
            }
            else{
                for(var i in ifaces){
                    name = i;
                    break;
                }
            }
        }


        ifaces[name].forEach(function (item) {
            if(item.family.toLowerCase() == family)
                ip = item.address;
        });

        return ip;
    },
    find: function(obj, path) {
        if(obj == null || path == null)
            return obj;
        var paths = path.split("/");
        var currData = obj;
        for(var i = 0; i < paths.length; i ++) {
            currData = currData[paths[i]];
            if(currData == null) {
                return null;
            }
        }
        return currData;
    }
};

module.exports = util;