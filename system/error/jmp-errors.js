/** 
 * @module jmp-error
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Definitions of Jmp common Error. ContainerError is for container error only and RuntimeError
 * is for business logic error.
 * @version 1.0
 * @author Juntao
 * 
 */
var util = require("util");

/**
 * @class JmpContainerError
 */
function JmpContainerError(message) {
	Error.call(this, message);
	this.message = message;
	this.name = "JmpContainerError";
};

util.inherits(JmpContainerError, Error);
JmpContainerError.prototype.toString = function() {
	return this.name + ":" + this.message;
};

/**
 * @global
 */
Jx.JmpContainerError = JmpContainerError;




/**
 * @class JmpRuntimeError
 */
function JmpRuntimeError(message) {
	Error.call(this, message);
	this.message = message;
	this.name = "JmpRuntimeError";
};

util.inherits(JmpRuntimeError, Error);

JmpRuntimeError.prototype.toString = function() {
	return this.name + ":" + this.message;
};

/**
 * @global
 */
Jx.JmpRuntimeError = JmpRuntimeError;