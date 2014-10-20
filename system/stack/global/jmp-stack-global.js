/**
 * @module jmp-stack-global
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * This module will export frequently-used libraries to global namespace (global or global.Jx).
 * @version 1.0
 * @author Juntao
 *
 */

Jx.ApiContext = require("./jmp-apicontext");
Jx.JmpPersistence = require("../persistence/jmp-persistence");
Jx.Criteria = require("../criteria/jmp-criteria");
Jx.Pageable = require("../criteria/jmp-pageable");
Jx.Sortable = require("../criteria/jmp-sortable");
Jx.Filterable = require("../criteria/jmp-filterable");
Jx.Selectable = require("../criteria/jmp-selectable");
Jx.Sorter = require("../criteria/jmp-sorter");
Jx.Page = require("../criteria/jmp-page");
Jx.Naming = require("./jmp-naming");
Jx.ormUtil = require("../orm/jmp-orm-util");
Jx.extensionUtil = require("../extensions/jmp-extension-util");
Jx.util = require("../../jmp-util");
Jx.restUtil = require("../rest/jmp-rest-util");
Jx.restClient = require("../rest/jmp-rest-client");
global._ = require("underscore");
global.extend = require("node.extend");

var path = require("path");
/**
 * Determine the container name by path. If it's in node_modules directory, substring it by nodehome + "/node_modules", else by "workspace" path
 * @param module
 * @returns {*}
 */
Jx.getContainer = function(module) {
    var filename = module.filename;
    if(filename.indexOf("node_modules") != -1)
        return path.relative(global.nodehome + "/node_modules", filename).split(path.sep)[0];
    return path.relative(global.rootpath, filename).split(path.sep)[0];
};
