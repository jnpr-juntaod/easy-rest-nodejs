/** 
 * @module jmp-common
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc 
 * Initialize common libraries or extensions
 * @version 1.0
 * @author Juntao
 * 
 */

/**
 * Global Jx Namespace Definition
 */
var Jx = {};
global.Jx = Jx;

require("./stack/global/jmp-lang");
/**
 * initialize error definitions
 */
require("./error/jmp-errors");

/**
 * initiale global stack
 */
require("./stack/global/jmp-stack-global");
