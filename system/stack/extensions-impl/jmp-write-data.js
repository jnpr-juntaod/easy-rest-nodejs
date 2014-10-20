var yangUtil = require("easy-rest").yangUtil;
var writeDataExtension = {
    doPlugin: function(options, callback) {
        var data = options.data;
        if(data == null)
            callback();
        else{
            var accepts = options.req.headers.accept.split(",");
            var resFormat = null;
            //Get the best response format.
            for(var i = 0; i < accepts.length; i ++) {
                var accept = accepts[i];
                resFormat = this.isSupportedFormat(options.metadata, accept);
                if(resFormat != null)
                    break;
            }
            if(resFormat == null) {
                throw new Jx.JmpRuntimeError("Unsupported accept format, " + accepts);
            }

            if(resFormat != "DEPEND ON CONTENT")
                options.res.setHeader('content-type', resFormat);

            var md = options.metadata;
            var validatorStr = md.validator;
            if(validatorStr != null && validatorStr != "") {
                if(validatorStr.startWith("yang:")) {
                    validatorStr = validatorStr.substring("yang:".length);
                    var validator = null;
                    var slashIndex = validatorStr.indexOf("/");
                    if(slashIndex != -1)
                        validator = Jx.yang.models[validatorStr.substring(0, slashIndex)];
                    else
                        validator = Jx.yang.models[validatorStr];
                    if(validator == null)
                        throw new Jx.JmpRuntimeError("Can not find validator by path: " + validator);
                    validator.schema(validatorStr).validate(data);
                }
                else{
                    throw new Jx.JmpRuntimeError("Not implemented yet");
                }
            }
            callback();
        }
    },
    isSupportedFormat: function(metadata, format) {
        if(metadata.produces.length == 0)
            return "DEPEND ON CONTENT";
        var index = format.indexOf(";");
        if(index != -1)
            format = format.substring(0, index);
        if(format == "*/*")
            return metadata.produces[0];
        else{
            for (var i = 0; i < metadata.produces.length; i++) {
                if (metadata.produces[i] == format)
                    return format;
            }
        }
        return null;
    },
    toString: function() {
        return "jmp-write-data";
    }
};

module.exports = writeDataExtension;