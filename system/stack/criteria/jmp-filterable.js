/**
 * @class Filterable
 * @param filter
 */
function Filterable(filter){
    var me = this;
    me.queryStr = filter;
    me.paramArray = require('./lexer-where').tokenize(this.queryStr);
    me.fieldsArray = [];
    _.each(me.paramArray, function(element, index){
        if(element[0]==='LITERAL'){
            me.fieldsArray.push({field: element[1], paramArrayIndex: index});
        }
    });
}

Filterable.prototype.filterByStr = function() {
	var str = "";
	for(var i = 0; i < this.filterObj.length; i ++){
		var filter = this.filterObj[i];
		//TODO tag should not be here.
		if(filter.type == "field" || filter.type == "tag"){
			return filter.field + "='" + filter.value + "'";
		}
	}
	return "";
};

Filterable.prototype.fields = function() {
    return _.pluck(this.fieldsArray, 'field');
};

Filterable.prototype.toSqlString = function(columns){
    var me = this;
    if(_.isArray(columns) && columns.length === me.fieldsArray.length){
        _.each(columns, function(column, index){
            var paramArrayIndex = me.fieldsArray[index].paramArrayIndex;
            me.paramArray[paramArrayIndex][1] = column;
        });
        return _.map(me.paramArray, function(element){
            if(element[0] === 'STRING'){
                return "'"+element[1]+"'";
            }
            return element[1];
        }).join(' ');
    }
    return '';
};

Filterable.prototype.filter = function() {
    if(arguments.length === 1){
        this.queryStr = arguments[0];
    } else {
        return this.queryStr;
    }
};

module.exports = Filterable;