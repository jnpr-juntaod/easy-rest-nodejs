/**
 * It's a pre-translated object for dynamic sql.
 * @param dynamicSql
 * @constructor
 */
function SqlUnit(dynamicSql) {
    this._dynamicSql = dynamicSql;
    this._defaultFields = [];
    this._allFields = [];
    this._defaultChainFields = [];
    this._allChainFields = [];
    this._fieldsMap = {};
    this.init();
}

SqlUnit.prototype = {
    fieldsMap: function() {
        return this._fieldsMap;
    },
    field: function(key) {
        return this._dynamicSql.select[key];
    },
    init: function() {
        var select = this._dynamicSql.select;
        if(select == null)
            throw new Jx.JmpRuntimeError("Illegal dynamic sql, attribute 'select' can not be null");
        for(var i in select) {
            if(select[i].ormId == null && (select[i].select == null || select[i].select == "default")) {
                this._defaultFields.push(i);
            }
            else if(select[i].ormId != null) {
                if(select[i].select == null || select[i].select == "default")
                    this._defaultChainFields.push(i);
                this._allChainFields.push(i);
            }
            this._allFields.push(i);
            var index = i.toLowerCase().indexOf(" as ");
            var queryName = null;
            if(index != -1) {
                queryName = i.substring(index + 4).trim();
            }
            else{
                queryName = i.substring(i.indexOf(".") + 1).trim();
            }
            var mapping = select[i].mapping || i;
            if(mapping instanceof Function)
                this._fieldsMap[queryName] = {field: i, func: mapping};
            else
                this._fieldsMap[queryName] = {field: i, path: mapping.split("/")};
        }

        var mapping = this._dynamicSql.mapping;
        if(mapping == null || mapping == "")
            mapping = null;
        this._mapping = mapping;

        if(this._defaultFields.length == 0)
           throw new Jx.JmpRuntimeError("Illegal dynamic sql, there are not any select='default' fields");

        var from = this._dynamicSql.from;
        if(from == null || from == "")
            throw new Jx.JmpRuntimeError("Illegal dynamic sql, attribute 'from' can not be null");
        for(var i = 0; i < from.length; i ++)
            from[i].table = from[i].table.trim();

        var where = this._dynamicSql.where;
        if(where == "")
            where = null;
        this._where = where;

        var preConvert = this._dynamicSql.preConvert;
        if(preConvert == null || preConvert == "")
            preConvert = null;
        else if(!preConvert instanceof Function)
            throw new Jx.JmpRuntimeError("Attribute preConvert should be a Function");
        this._preConvert = preConvert;

        var postProcess = this._dynamicSql.postProcess;
        if(postProcess == null || postProcess == "")
            postProcess = null;
        else if(!postProcess instanceof Function)
            throw new Jx.JmpRuntimeError("Attribute postProcess should be a Function");
        this._postProcess = postProcess;
    },
    defaultFields: function() {
        return this._defaultFields;
    },
    allFields: function() {
        return this._allFields;
    },
    defaultChainFields: function() {
        return this._defaultChainFields;
    },
    allChainFields: function() {
        return this._allChainFields;
    },
    from: function(ids) {
        var from = this._dynamicSql.from;
        var froms = [];
        for(var i = 0; i < ids.length; i ++) {
            var f = from[ids[i]];
            if(f == null)
                throw new Jx.JmpRuntimeError("Can not find the from by id: " + ids[i]);
            froms.push(f);
        }
        var me = this;
        froms.sort(function(a, b){
            var aJoin = me.isJoin(a);
            var bJoin = me.isJoin(b);
            if((aJoin && bJoin) || (!aJoin && !bJoin))
                return 0;
            if(aJoin && !bJoin)
                return 1;
            if(!aJoin && bJoin)
                return -1;
        });
        return froms;
    },
    isJoin: function(from) {
        var as = from.table.toLowerCase();
        return as.startWith("left join") || as.startWith("right join") || as.startWith("inner join") || as.startWith("join");
    },
    where: function() {
        return this._where;
    },
    postProcess: function() {
        return this._postProcess;
    },
    preConvert: function() {
        return this._preConvert;
    },
//    validator: function() {
//        return this._validator;
//    },
    mapping: function() {
        return this._mapping;
    }
};

module.exports = SqlUnit;