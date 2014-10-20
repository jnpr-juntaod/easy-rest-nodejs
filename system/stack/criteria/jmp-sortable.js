/**
 * @class Sortable
 * @param sorter
 */
function Sortable(sorter){
    var me = this;
    me.queryStr = sorter;
    var sortArray = me.queryStr.split(';');
    me.fieldsArray = [];
    _.each(sortArray, function(element, index){
        var params = element.split(',');
        if(params.length>1){
            me.fieldsArray.push({field:params[0], dir: params[1]});
        }else{
            me.fieldsArray.push({field:params[0], dir: 'AESC'});
        }
    });
}

/**
 * @memberof Sortable
 */
Sortable.prototype.fields = function(){
    return this.fieldsArray;
};

/**
 * @memberof Sortable
 */
Sortable.prototype.remove = function(key) {

};

/**
 * @memberof Sortable
 */
Sortable.prototype.toSqlString = function(columns) {
    var me = this;
	if(_.isArray(columns) && columns.length === me.fieldsArray.length){
        var sorterArray =[];
        _.each(columns, function(element, index){
            sorterArray.push(element + ' ' + me.fieldsArray[index].dir);
        });
        return sorterArray.join(',');
    }
    return '';
};

/**
 * @memberof Sortable
 */
Sortable.prototype.sortby = function() {
    if(arguments.length === 1){
        this.queryStr = arguments[0];
    } else {
        return this.queryStr;
    }
};

module.exports = Sortable;