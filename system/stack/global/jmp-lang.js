/**
 * @module jmp-lang
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * This module will enhance some basic type like "String", and add some frequently-used functions to them.
 * @version 1.0
 * @author Juntao
 *
 */

/**
 * @memberof String
 */
String.prototype.endWith = function(s){
	if(s == null || s == "" || this.length == 0 || s.length > this.length)
		return false;
	if(this.substring(this.length - s.length) == s)
		return true;
	else
		return false;
	return true;
};

String.prototype.startWith = function(s){
	if(s == null || s == "" || this.length == 0 || s.length > this.length)
		return false;
	if(this.substr(0,s.length) == s)
		return true;
	else
		return false;
	return true;
};

String.prototype.replaceAll = function(source, replace) {
 	var regExp = new RegExp(source, "g");
 	return this.replace(regExp, replace);
};
String.prototype.trim = function() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
