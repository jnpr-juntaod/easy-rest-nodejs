var restUtil = {
	apiContext: function() {
		var args = arguments.callee.caller.arguments;
		return args[args.length - 2];
	},
	
	callback: function() {
		var args = arguments.callee.caller.arguments;
		return args[args.length - 1];
	}
};

module.exports = restUtil;