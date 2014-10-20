/**
 * @class Selectable
 * @param filter
 */
function Selectable(selectableStr){
    this.queryStr = selectableStr;
    this.toYangKey();
};

Selectable.prototype.fields = function() {
	return this.yangKeyStr.split(';');
};

Selectable.prototype.toSqlString = function(columns) {
    if(_.isArray(columns)){
        return columns.join(',');
    }
    return '';
};

Selectable.prototype.toYangKey = function(){
    var regexParenthesis = /\((.+?)\)/g;
    var  matches = [], match;
    while (match = regexParenthesis.exec(this.queryStr)) {
        matches.push(match);
    }
    if(matches && matches.length>0){
        for(var i= 0; matches[i]; i++){
            var matchStr = matches[i][1];
            var matchIndex = matches[i]['index'];
            var rootKey = matches[i]['input'].substring(matches[i]['input'].lastIndexOf(';', matchIndex)+1, matchIndex);
            var keyArray = matchStr.split(';');
            for(var j= 0; keyArray[j]; j++){
                keyArray[j] = rootKey + '/' + keyArray[j];
            }
            var yangKeys = keyArray.join(';');
            this.queryStr.replace(rootKey+matches[i][0], yangKeys);
        }
    }
    this.yangKeyStr = this.queryStr;
};

/**
 * @memberof Selectable
 */
Selectable.prototype.select = function() {
    if(arguments.length === 1){
        this.queryStr = arguments[0];
    } else {
        return this.queryStr;
    }
};

module.exports = Selectable;