module.exports = {
	"version": "2.0", //platform version
	"name": "Space Platform", //platform name
	"vendor": "Juniper Networks", //version information
	"rootpath": rootpath,
	"rest_prefix": "/restconf", //rest api prefix, can override it in service bundle's config.js
	"sessiontimeout": 60, //one hour
	"authenticate": "jmp-sso",
	"rest_authenticate": "jmp-basic",
	"serverdelegator": "restify",
    "load_balancer_host": "_NGINX_HOST_",
    "load_balancer_port": "_NGINX_PORT_",
    "load_balancer_protocol": "_NGINX_PROTOCOL_"
};
