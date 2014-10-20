var apictxIntercepter = {
	doPlugin: function(options, callback) {
		var req = options.req;
		var res = options.res;
		//constructor apiContext according to http request.
		formApiContext(req, res, function(err, apiCtx){
			req.apiCtx = apiCtx;
			var dataSource = options.container.restObj.dataSource;
			dataSource = dataSource || "MySqlDS";
			apiCtx.dataSource(dataSource);
			callback();
		});
	},
    toString: function() {
        return "apicontext-intercepter";
    }
};

/**
 * This method will form api context according to information of request.
 * @param req
 * @param res
 * @param callback
 * @returns ApiContext
 */
function formApiContext(req, res, callback) {
	var apiCtx = new Jx.ApiContext(req, res);
	
	apiCtx.principal(req.user);
	fillQueryCriterias(apiCtx, req, res);
	callback(null, apiCtx);
};

function fillQueryCriterias(apiCtx, req, res){
    var sSelect = req.params["select"];
    var selectable = null;
    if(sSelect){
        selectable = new Jx.Selectable(sSelect);
    }
	var sPage = req.params["paging"];
	var pageable = null;
	if(sPage){
		pageable = new Jx.Pageable(sPage);
	}
	var sFilter = req.params["where"];
	var filterable = null;
	if(sFilter){
		filterable = new Jx.Filterable(sFilter);
	}
	var sSorter = req.params["orderBy"];
	var sortable = null;
	if(sSorter){
		sortable = new Jx.Sortable(sSorter);
	}
	var criteria = new Jx.Criteria(pageable, filterable, sortable, selectable);
	apiCtx.criteria(criteria);
};

module.exports = apictxIntercepter;