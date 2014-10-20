/**
 * @module index
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * Exports easy-rest's functions to other modules. Use it like this: require("easy-rest").restClient
 * @version 1.0
 * @author Juntao
 *
 */

require("./system/jmp-common");
var Server = require("./bootstrap/jmp-bootstrap").Server;
var SessionManager = require("./system/jmp-session");
var VersionCache = require("./system/stack/cache/jmp-version-cache");
var util = require("./system/jmp-util");
var testUtil = require("./system/testsupport/jmp-testutil");
var restClient = require("./system/stack/rest/jmp-rest-client");
var notification = require("./system/stack/notification/jmp-notification");
var redisHelper = require("./system/stack/redis/jmp-redis-helper");
var serviceBundle = {
    /**
     * The Core Server Bootstrap
     */
	Server: Server,
    /**
     * Session Manager of Js Rest Server
     */
	SessionManager: SessionManager,
    /**
     * Base class of Version Cache
     */
    VersionCache: VersionCache,
    /**
     * Common Utilities of Js Rest Server
     */
	util: util,
    /**
     * Test Util of Js Rest Server
     */
	testUtil: testUtil,
    /**
     * Rest Client Util of Js Rest Server
     */
    restClient: restClient,

    /**
     * Notification Util of Js Rest Server
     */
    notification: notification,

    /**
     * Redis Util of Js Rest Server
     */
    redisUtil: redisHelper,

    /**
     * Common functionality for test cases. All TestUnits should invoke it.
     */
    testEntry: function() {
        require("./system/testsupport/jmp-test-entry");
    }
};

module.exports = serviceBundle;