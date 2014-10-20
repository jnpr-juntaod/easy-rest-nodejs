var istanbul = require("../system/codecoverage/istanbul-embeded");
var archiver = require("archiver");
var ZipWriter = require("../system/codecoverage/zip-writer");
var fs = require("fs");
var codeCovRest = {
    resetReport: function(apiCtx, callback) {
        istanbul.restoreBaseline();
        callback(null, {});
    },

    renderReport: function(apiCtx, callback) {
        istanbul.render(null, false, apiCtx.response(), "/restconf/data/test-management:codecoverage/", null, callback);
    },

    renderReportModule: function(serviceBundleName, apiCtx, callback) {
        istanbul.render(rootpath + "/" + serviceBundleName + "/", false, apiCtx.response(), "/restconf/data/test-management:codecoverage/", null, callback);
    },

    renderReportUrl: function(paths, apiCtx, callback) {
        var path = paths[0];
        var fileOnly = paths[1] != "1";
        istanbul.render(path, fileOnly, apiCtx.response(), "/restconf/data/test-management:codecoverage/", null, callback);
    },

    download: function(apiCtx, callback) {
        var stream = archiver.createZip();
        var writer = new ZipWriter(stream, process.cwd());
        var res = apiCtx.response();
        res.setHeader('Content-Disposition', 'attachment; filename=coverage.zip');
        stream.pipe(res);
        istanbul.render(null, false, res, "/restconf/data/test-management:codecoverage/", writer, callback);
    },

    downloadModule: function(serviceBundleName, apiCtx, callback) {
        callback(null, "not implemented");
    },

    assetjs: function(apiCtx, callback) {
        fs.readFile(__dirname + "/../system/codecoverage/asset/prettify.js", function(err, file){
            if(err){
                callback(err);
            }
            else{
                callback(null, file);
            }
        });
    },

    assetcss: function(apiCtx, callback) {
        fs.readFile(__dirname + "/../system/codecoverage/asset/prettify.css", function(err, file){
            if(err){
                callback(err);
            }
            else{
                callback(null, file);
            }
        });
    }
};

module.exports = codeCovRest;