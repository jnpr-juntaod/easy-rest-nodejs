/**
 * @module jmp-req-res
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Filter for each request, extend the request and response's api.
 * @version 1.0
 * @author Juntao
 *
 */
module.exports = function(req, res, next) {
	req.getCookie = getCookie;
	req.getCookies = getCookies;
	res.setCookie = setCookie;
	//delegate redirect action, so that we can do something special of platform
	res.redirect = redirect;
	//keep the variable for log4js
	req.originalUrl = req.url;
    return next();
};

function getCookie(key) {
	return this.getCookies()[key.toUpperCase()];
}

function getCookies(){
	if(this._cookiesParsed != null){
		return this._cookiesParsed;
	}
	this._cookiesParsed = {};
	var cookieStr = this.headers.cookie;
	if(cookieStr == null || cookieStr == ""){
		return this._cookiesParsed;
	}
	var cookiesPair = cookieStr.split(";");
	for(var i = 0; i < cookiesPair.length; i ++){
		var pairStr = cookiesPair[i].trim();
		var pair = pairStr.split("=");
		this._cookiesParsed[pair[0].toUpperCase()] = pair[1];
	}
	return this._cookiesParsed;
}

function setCookie(key, value, path){
	var cookieStr = key + "=" + value;
	if(path != null)
		cookieStr += ";Path=" + path;
	this.header("Set-Cookie", cookieStr);
}

function redirect(url, status) {
	//use 303 status code to indicate that we need to clear session cookies.
	if(status == 303){
		status = 302;
		this.setCookie("JSESSIONID", null, "/");
		this.setCookie("JSESSIONIDSSO", null, "/");
        var index = url.indexOf("?");
        if(index > 0) {
            var queryStr = url.substring(index + 1);
            var qs = require("querystring");
            var pairs = qs.parse(queryStr);
            if(pairs["returnUrl"])
                this.setCookie("returnUrl", encodeURIComponent(pairs["returnUrl"]), "/mainui");
            url = url.substring(0, index);
        }

	}
	this.statusCode = status || 302;
	this.setHeader('Location', url);
	this.setHeader('Content-Length', '0');
	this.end();
}
