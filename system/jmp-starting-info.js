/**
 * @module jmp-starting-info
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Print friendly information to console and log files.
 * @version 1.0
 * @author Juntao
 *
 */

/**
 * Dump information to system logger
 * @param options
 * @param config
 */
module.exports.dump = function(options, config) {
	logger.system("  + System information");
	logger.system('    - Server Version: ' + process.version);
	logger.system('    - Process id: ' + process.pid);
	logger.system('    - Target platform: ' + process.platform);
	logger.system('    - Root directory: ' + rootpath);

	dumpInfo(options, config);
};

/**
 * dump the configuration information to console with friendly format
 * @private
 * @param config
 */
function dumpInfo(options, config) {
	logger.system("  + Server Configurations");
	logger.system("    - Product: " + config.name + " V" + config.version);
	logger.system("    - Vendor: " + config.vendor);
	logger.system("    - Dev Mode: " + options.devmode);
	logger.system("    - Port: " + options.port);
	logger.system("    - Workspace: " + options.workspace);
	logger.system("    - Delegator: " + config.serverdelegator);
}