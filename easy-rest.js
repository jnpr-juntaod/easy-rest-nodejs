/** 
 * @module easy-rest
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * It's a bootstrap to be invoked directly by shell scripts. If you are using it inner NodeJs, please use require("easy-rest").Server.start(callback) instead.
 * @version 1.0
 * @author Juntao
 * 
 */

console.log(" ");
console.log("############ Arguments ############");

var args = process.argv;
var workspace = null;
var port = null;
var devmode = process.env["NODE_ENV"] == "development";
var nodeHome = null;
var coverage = false;
for(var i = 2; i < args.length; i ++){
	if(args[i].indexOf("--port=") != -1){
		port = args[i].substring("--port=".length);
	}
    else if(args[i].indexOf("--wp=") != -1){
        workspace = args[i].substring("--wp=".length);
    }
	else if(args[i].indexOf("--devmode=") != -1){
		devmode = args[i].substring("--devmode=".length);
	}
    else if(args[i].indexOf("--nodehome=") != -1) {
        nodeHome = args[i].substring("--nodehome=".length);
    }
    else if(args[i].indexOf("--coverage") != -1){
        coverage = args[i].substring("--coverage=".length);
    }
}

if(nodeHome == null || nodeHome == ""){
    //dev mode, try to find the node home via directory structure
    if(devmode) {
        var paths = __dirname.split("/");
        if(paths[paths.length - 2] == "node_modules"){
            paths.splice(paths.length - 2, 2);
            nodeHome = paths.join("/");
        }
        else
            nodeHome = __dirname.substring(0, __dirname.lastIndexOf("/"));
    }
}

if(nodeHome == null || nodeHome == ""){
    console.log("NodeJS Home is null, please set it by passing parameter --nodehome=path. ");
    return;
}

console.log("  - Node home is: " + nodeHome);

workspace = workspace || nodeHome;
console.log("  - Workspace directory is: " + workspace);

port = port || process.env["NODEJS_PORT"];
if(port == null){
	console.log("  - NodeJs listening port is null and default value is '8090'. Use argument: --port=xxxx or system 'NODEJS_PORT=port' variable to change it");
	port = "8090";
}

console.log("  - Port is: " + port);

console.log("  - Running in development mode:" + devmode);

console.log("  - Running in instrument mode:" + coverage);

var options = {workspace: workspace, port: port, devmode: devmode, nodehome: nodeHome, coverage: coverage};
var Server = require("./bootstrap/jmp-bootstrap").Server;

Server.start(options, function(err){
    if(err)
        console.error(err);
});
