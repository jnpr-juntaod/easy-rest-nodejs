function Page(records, totalRecord){
	if(arguments.length != 2){
		throw new JmpRuntimeError("illegal arguments, must be 2 parameters. They are: records, totalRecords");
	}
	this._records = records;
	this._totalRecords = totalRecord;
}

Page.prototype.records = function() {
    if(arguments.length == 0)
        return this._records;
    this._records = arguments[0];
};

Page.prototype.totalRecords = function() {
    if(arguments.length == 0)
        return this._totalRecords;
    this._totalRecords = arguments[0];
}

Page.prototype.toJSON = function(){
	return {records: this._records, totalRecords: this._totalRecords};
};

module.exports = Page;
