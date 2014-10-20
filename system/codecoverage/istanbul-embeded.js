var istanbul = require('istanbul');
var COVERAGE_VARIABLE = "__coverageId";
var istanbulEmbeded = {
    baselineCov: {},
    coverageVariable: COVERAGE_VARIABLE,
    deepClone: function(obj) {
        return obj? JSON.parse(JSON.stringify(obj)) : obj;
    },
    saveBaseline: function(file) {
        var covObj = global[COVERAGE_VARIABLE];
        if (covObj && covObj[file]) {
            var cov = covObj[file];
            if(!this.baselineCov[file]) {
                this.baselineCov[file] = {
                    s: this.deepClone(cov.s),
                    f: this.deepClone(cov.f),
                    b: this.deepClone(cov.b)
                };
            }
        }
    },
    restoreBaseline: function() {
        var covObj = global[COVERAGE_VARIABLE];
        var me = this;
        Object.keys(this.baselineCov).forEach(function(key) {
            var bcov = me.baselineCov[key];
            if (covObj[key]) {
                var cov = covObj[key];
                cov.s = me.deepClone(bcov.s);
                cov.f = me.deepClone(bcov.f);
                cov.b = me.deepClone(bcov.b);
            }
        });
        Object.keys(covObj).forEach(function (key) {
            if (!me.baselineCov[key]) {
                delete covObj[key];
            }
        });
    },
    hookRequire: function(matchFunc, options) {
        options = options || {};
        options.coverageVariable = '__coverageId';
        if (this.instrumenter) {
            return;
        }
        this.instrumenter = new istanbul.Instrumenter(options);
        var transformer = this.instrumenter.instrumentSync.bind(this.instrumenter);
        var me = this;
        var hook = istanbul.hook;
        hook.hookRequire(matchFunc, transformer, {
            verbose: options.verbose,
            postLoadHook: function(file) {
                me.saveBaseline(file);
            }
        });
    },

    getTreeSummary: function(collector, filePath, fileOnly) {
        var summarizer = new istanbul.TreeSummarizer();
        var utils = istanbul.utils;
        collector.files().forEach(function (key) {
            if(filePath == null || key.startWith(filePath)) {
                if(fileOnly) {
                    if(key == filePath)
                        summarizer.addFileCoverageSummary(key, utils.summarizeFileCoverage(collector.fileCoverageFor(key)));
                    else if(key.endWith(".js")) {
                        var lindex = key.lastIndexOf("/");
                        if(key.substring(0, lindex + 1) == filePath)
                            summarizer.addFileCoverageSummary(key, utils.summarizeFileCoverage(collector.fileCoverageFor(key)));
                    }
                }
                else
                    summarizer.addFileCoverageSummary(key, utils.summarizeFileCoverage(collector.fileCoverageFor(key)));
            }
        });
        return summarizer.getTreeSummary();
    },


    render: function(filePath, fileOnly, res, prefix, writer, callback) {
        var utils = istanbul.utils;
        var covObj = global[COVERAGE_VARIABLE];

        if (!(covObj && Object.keys(covObj).length > 0)) {
            res.setHeader('Content-type', 'text/plain');
            return res.end('No coverage information, please make sure that the server is running in instrument mode');
        }
        prefix = prefix || "";

        if (prefix.charAt(prefix.length - 1) !== '/') {
            prefix += '/';
        }
        utils.removeDerivedInfo(covObj);

        var collector = new istanbul.Collector();
        collector.add(covObj);

        var treeSummary = this.getTreeSummary(collector, filePath, fileOnly);

        //if it's a file, use the true path, else use the root path.
        if (!fileOnly)
            filePath = treeSummary.root.fullPath();

        var outputNode = null;
        if(filePath == treeSummary.root.fullPath())
            outputNode = treeSummary.root;
        else
            outputNode = treeSummary.map[filePath.substring(treeSummary.root.fullPath().length)];

        if (!outputNode) {
            res.statusCode = 404;
            return res.end('No coverage for file path [' + filePath + ']');
        }

        if(writer) {
            var report = istanbul.Report.create('html', {writer: writer, dir: rootpath + '/lcov-report'});
            writer.writeFile('coverage.json', function (w) {
                w.write(JSON.stringify(covObj, undefined, 4));
            });
            report.writeReport(collector, true);
            writer.done();
            callback();
        }
        else {
            var linkMapper = {
                hrefFor: function (node) {
                    var url = prefix + 'show/p=' + node.fullPath();
                    return url;
                },
                fromParent: function (node) {
                    return this.hrefFor(node);
                },
                ancestor: function (node, num) {
                    var i;
                    for (i = 0; i < num; i += 1) {
                        node = node.parent;
                    }
                    return this.hrefFor(node) + ",1";
                },
                asset: function (node, name) {
                    return prefix + 'asset/' + name;
                }
            };
            var report = istanbul.Report.create('html', {linkMapper: linkMapper });
            if (outputNode.kind === 'dir') {
                report.writeIndexPage(res, outputNode);
            }
            else {
                var cov = covObj[outputNode.fullPath()];
                utils.addDerivedInfoForFile(cov);
                report.writeDetailPage(res, outputNode, cov);
            }
            res.end();
            callback();
        }
    }
};

module.exports = istanbulEmbeded;