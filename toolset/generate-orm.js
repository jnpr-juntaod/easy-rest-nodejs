var dbhost = process.env["DB_HOST"] || "127.0.0.1";
var dbuser = process.env["DB_USER"] || "root";
var dbpswd = process.env["DB_PSWD"] || "";
var dbport = process.env["DB_PORT"] || "1366";
var dbname = process.env["DB_NAME"] || "build_db";
var table = null;
for(var i = 2; i < process.argv.length; i ++) {
    var arg = process.argv[i];
    if(arg.indexOf("--table=") == 0)
        table = arg.substring("--table=".length);
}

if(table == null) {
    console.error("Table name can not be null, please use --table=tablename to set it");
    return;
}

var mysql = require("mysql");
var connection = mysql.createConnection({
    host: dbhost,
    user: dbuser,
    password : dbpswd,
    port: dbport,
    database: "information_schema",
    insecureAuth: true,
    multipleStatements: true
});

var columnUsageSql = "select table_name, column_name, referenced_table_name, referenced_column_name from key_column_usage where table_schema='" + dbname + "' and referenced_table_name is not null and table_name='" + table + "';";
var columnSql = "select * from columns where table_name='" + table + "' and table_schema='" + dbname + "'";
connection.connect(function(err){
    if (err) {
        console.error(err);
    }
    else{
        connection.query(columnSql, function(err, result) {
            if(err)
                console.log(err);
            else {
                generateOrmFile(result);
            }
            connection.end();
        });
    }
});

function generateOrmFile(result) {
    var orm = {
        table: table,
        namespace: "net.juniper.space.orm." + table.toLowerCase()
    };

    var columns = [];
    for(var i = 0; i < result.length; i ++) {
        var colInfo = result[i];
        var column = {id: colInfo["COLUMN_NAME"], field: colInfo["COLUMN_NAME"], nullable: colInfo["IS_NULLABLE"] == "YES"};
        var type = colInfo["DATA_TYPE"];
        if(type == "varchar" || type == "char")
            type = "string";
        column.type = type;

        var defaultValue = colInfo["COLUMN_DEFAULT"];
        var primaryKey = colInfo["COLUMN_KEY"] == "PRI";
        if(defaultValue)
            column.default = defaultValue;
        if(primaryKey)
            column.primaryKey = primaryKey;
        columns.push(column);
    }
    orm.columns = columns;
    var str = "var OrmObject = Jx.ormUtil.createOrmObject(" + JSON.stringify(orm, null, "\t") + ");\n";

    str += "OrmObject.prototype.fromYang = function(yangObject) {\n";
    str += "\tvar ormObj = new OrmObject(function(key){\n";
    str += "\t\treturn this[key]();\n";
    str += "\t});\n";
    str += "};\n";

    str += "OrmObject.prototype.toYang = function() {\n";
    str += "\t//Please Replace the Yang Class with the real one.\n";
    str += "\tvar yangObject = new YangObject(function(key){\n";
    str += "\t\treturn this[key]();\n";
    str += "\t});\n";
    str += "};\n";

    var allBasicCols = [];
    var basicCols = [];
    var basicOpes = [];
    var basicLobCols = [];
    var objCols = [];
    var prefix = table[0].toLowerCase();
    for(var i = 0; i < columns.length; i ++) {
        var col = columns[i];
        if(col.type == "inner join" || col.type == "left join" || col.type == "right join")
            objCols.push(col);
        else{
            allBasicCols.push(prefix + "." + col.field + " AS " + col.field);
            if(col.type == "blob")
                basicLobCols.push(col);
            else if(col.type == "clob")
                basicLobCols.push(col);
            else {
                if(col.type == "int" || col.type == "bigint")
                    basicOpes.push("=");
                else
                    basicOpes.push("like");
                basicCols.push(prefix + "." + col.field + " AS " + col.field);
            }
        }

    }
    str += "OrmObject.defaultDynamicSelectSql = function() {\n";
    str += "\tSELECT_OPTIONAL(" + JSON.stringify(allBasicCols) + ",\n\t                " + JSON.stringify(basicCols) + ");\n";
    str += "\tFROM(\"" + table + " as " + prefix + "\");\n";
    for(var i = 0; i < basicCols.length; i ++)
        str += "\tWHERE_OPTIONAL(\"" + basicCols[i] + " " + basicOpes[i] + " ?\");\n";
    for(var i = 0; i < objCols.length; i ++) {
        if(objCols[i].type == "inner join") {
            str += "USE(\"" + objCols[i].namespace + "\");\n";
            str += "INNER_JOIN(\"" + objCols[i].namespace + "\");\n";
        }
    }
    str += "};\n";

    str += "module.exports = OrmObject;";

    var fs = require("fs");
    var filename = "orm-" + table.toLowerCase() + ".js";
    var dir = process.env["HOME"] + "/tmp/orm";
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir);

    var fullPath = dir + "/" + filename;
    fs.writeFileSync(fullPath, str);

    console.log("The orm file was generated to :" + fullPath);
}