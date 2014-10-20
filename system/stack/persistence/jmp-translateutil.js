var SqlTranslator = require("./jmp-sqltranslator");
var SqlUnit = require("./jmp-sqlunit");
var ormUtil = require("../orm/jmp-orm-util");
var translatorUtil = {
    schemaCache: {},
    translate: function(sqlPath, criterial, callback) {
        var translatedUnit = this.schemaCache[sqlPath];
        if(translatedUnit == null){
            try{
                var dynamicSql = ormUtil.getMappingByPath(sqlPath);
                if(dynamicSql == null) {
                    return callback(new Jx.JmpRuntimeError("Can not find dynamic sql by path: " + sqlPath));
                }
                if(dynamicSql.extend && dynamicSql.extend != "") {
                    var pdynamicSql = ormUtil.getMappingByPath(dynamicSql.extend);
                    if(pdynamicSql == null)
                        return callback(new Jx.JmpRuntimeError("Can not find parent dynamic sql by path: " + dynamicSql.extend + ", current sql: " + sqlPath));
                    dynamicSql = extend({}, pdynamicSql, dynamicSql);
                }
                translatedUnit = new SqlUnit(dynamicSql);
                this.schemaCache[sqlPath] = translatedUnit;
            }
            catch(error){
                return callback(error);
            }
        }
        var sqlTrans = new SqlTranslator();
        sqlTrans.translate(translatedUnit, criterial);
        sqlTrans.on("data", function(sqlResult){
            callback(null, {sql: sqlResult.sql, chain: sqlResult.chain, sqlUnit: translatedUnit});
        });
    }
};
module.exports = translatorUtil;