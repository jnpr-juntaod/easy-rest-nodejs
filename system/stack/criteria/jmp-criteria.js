/** 
 * @module jmp-criteria
 * @copyright (C) Copyright 2014, Juniper Networks. Inc
 * @classdesc
 * The select, filter, sorter, paging clause object.
 * @version 1.0
 * @author Juntao
 * 
 */


/**
 * @class Criteria
 */
function Criteria(pageable, filterable, sortable, selectable){
	this._pageable = pageable;
	this._filterable = filterable;
	this._sortable = sortable;
	this._selectable = selectable;
}

/**
 * @memberof Criteria
 */
Criteria.prototype.pageable = function() {
	if(arguments.length == 0)
		return this._pageable;
	else
		this._pageable = arguments[0];
};

/**
 * @memberof Criteria
 */
Criteria.prototype.filterable = function() {
	if(arguments.length == 0)
		return this._filterable;
	else
		this._filterable = arguments[0];
};

Criteria.prototype.sortable = function() {
	if(arguments.length == 0)
		return this._sortable;
	else
		this._sortable = arguments[0];
};

Criteria.prototype.selectable = function() {
	if(arguments.length == 0)
		return this._selectable;
	else
		this._selectable = arguments[0];
};

Criteria.prototype.query = function() {
    return {
        paging: this._pageable.paging() || '',
        filter: this._filterable.filter() || '',
        sortby: this._sortable.sortby() || '',
        select: this._selectable.select() || ''
    }
};

module.exports = Criteria;