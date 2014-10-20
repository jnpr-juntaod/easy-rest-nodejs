var util = require("../jmp-util");
var nginxHost = process.env.NGINX_HOST || util.getLocalIp();
var nginxPort = process.env.NGINX_PORT || "80";
var protocol = process.env.NGINX_PROTOCOL || "http";

Jx.serverConfig = {};
Jx.serverConfig.load_balancer_protocol = protocol;
Jx.serverConfig.load_balancer_host = nginxHost;
Jx.serverConfig.load_balancer_port = nginxPort;
Jx.API_PREFIX = "/restconf";

before(function() {
});

after(function(callback) {
    callback();
});