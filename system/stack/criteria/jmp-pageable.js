/**
 * @class Pageable
 * @param index
 * @param pageSize
 */
function Pageable() {
	if(arguments.length == 1){
		if(typeof arguments[0] != "string"){
            throw new Jx.JmpRuntimeError("illegal arguments for Pageable. Parameter must be string type");
		}
        this.queryParam = arguments[0];
		var pair = arguments[0].split(";");
		this.index = parseInt(pair[0]);
		this.pageSize = parseInt(pair[1]);
	}
	else if(arguments.length == 2){
		this.index = arguments[0];
		this.pageSize = arguments[1];
	}
    else {
        throw new Jx.JmpRuntimeError("illegal arguments for Pageable.");
    }
    if(this.pageSize > 0)
	    this.offset = this.index * this.pageSize;
    else
        this.offset = 0;

}

Pageable.prototype.paging = function(){
    if(arguments.length === 1){
        this.queryParam = arguments[0];
    }
    else {
        return this.queryParam;
    }
};

module.exports = Pageable;