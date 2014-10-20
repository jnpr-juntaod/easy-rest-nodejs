var events = require('events');
var util = require('util');
function SqlTranslator() {
    events.EventEmitter.call(this);
}
util.inherits(SqlTranslator, events.EventEmitter);
SqlTranslator.prototype.translate = function(sqlUnit, apiCtx){
    var me = this;
    process.nextTick(function(){
        var criteria = apiCtx.criteria()
        var selectable = criteria.selectable();
        var filterable = criteria.filterable();
        var sortable = criteria.sortable();
        var sqlArr = [];
        var fields = processSelectable(sqlUnit, selectable, filterable, sortable);
        sqlArr.push("SELECT " + fields.join(", "));
        sqlArr.push("FROM");
        var froms = processFrom(fields, sqlUnit, selectable, filterable, sortable);
        for(var i = 0; i < froms.length; i ++) {
            var from = froms[i];
            if(sqlUnit.isJoin(from)) {
                if( i == 0)
                    throw new Jx.JmpRuntimeError("The first table is join, please check your dynamic sql");
                sqlArr.push(from.table);
            }
            else{
                if(i != 0)
                    sqlArr.push(",");
                sqlArr.push(from.table);
            }
        }

        var whereAdded = false;
        for(var i = 0; i < froms.length; i ++) {
            var clause = froms[i].clause;
            if(clause == null || clause == "")
                continue;
            if(!whereAdded) {
                whereAdded = true;
                sqlArr.push("WHERE");
            }
            sqlArr.push(clause);
        }
        var whereStr = processWhere(sqlUnit, selectable, filterable, sortable);
        if(whereStr != null) {
            if(!whereAdded) {
                whereAdded = true;
                sqlArr.push("WHERE");
            }
            sqlArr.push(whereStr);
        }

        var fullSql = sqlArr.join(" ");
        var chainArr = processChain(sqlUnit, selectable, filterable, sortable);
        logger.debug("translated sql:" + fullSql);

        var result = {sql: fullSql, chain: chainArr};
    	me.emit('data', result);
    });
};

function processSelectable(sqlUnit, selectable, filterable, sortable) {
    var fields = null;
    if(selectable == null || selectable.fields().length == 0) {
        fields = sqlUnit.defaultFields();
    }
    else{
        var sf = selectable.fields();
        var allFields = sqlUnit.allFields();
        fields = _.intersection(sf, allFields);
    }

    if(fields.length == 0)
        throw new Jx.RuntimeError("No Select Fields");
    return fields;
}

function processChain(sqlUnit, selectable, filterable, sortable) {
    var fields = null;
    if(selectable == null || selectable.fields().length == 0) {
        fields = sqlUnit.defaultChainFields();
    }
    else{
        var sf = selectable.fields();
        var allFields = sqlUnit.allChainFields();
        fields = _.intersection(sf, allFields);
    }
    return fields;
}

function processFrom(fields, sqlUnit, selectable, filterable, sortable) {
    var ids = [];
    for(var i = 0; i < fields.length; i ++) {
        var field = sqlUnit.field(fields[i]);
        var from = field.from || [0];
        for(var j = 0; j < from.length; j ++){
            if(ids.indexOf(from[j]) == -1)
                ids.push(from[j]);
        }
    }
    if(ids.length == 0)
        throw new Jx.JmpRuntimeError("No from was selected");
    var froms = sqlUnit.from(ids);

    return froms;
}

function processWhere(sqlUnit, selectable, filterable, sortable) {
    var where = sqlUnit.where();
    if(where != null) {
        if(where.indexOf("$FILTER") != -1) {
            //get filter
            var filterStr = "";
            //replace
            where = where.replace("$FILTER", filterStr);
        }
        if(where.indexOf("$DOMAINFILTER") != -1) {
            var filterStr = "";
            where = where.replace("$DOMAINFILTER", filterStr);
        }
        where = where.replaceAll("\\$PARAM", "?");
        where = where.trim();
    }
    return where == "" ? null : where;
}

module.exports = SqlTranslator;