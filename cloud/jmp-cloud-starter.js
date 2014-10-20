var rootpath = __dirname;
var options = {workspace: rootpath + "/cloud", port: "8888", devmode: false};
var Server = require("./../bootstrap/jmp-bootstrap").Server;

Server.start(options, function(){
});