var sessionPool = {};
var sessionManager = {
	sessionFilter: function(req, res, next){
		var jsessionid = req.getCookie("jsessionid");
		if(jsessionid != null){
            var session = sessionPool[jsessionid];
            if(session != null){
                session.lastAccessTime = new Date().getTime();
                req.session = session;
                req.user = session.user;
            }
        }
        next();
	},
	createSession: function(sesId) {
		var session = {sessionId: sesId, lastAccessTime: new Date().getTime()};
		sessionPool[sesId] = session;
		return session;
	}
};

//default five minutes
var validateTime = 1000 * 60 * 5;
function checkValidate() {
    var currTime = new Date().getTime();
    var sesPool = sessionPool;
    for(var i in sesPool) {
        var ses = sesPool[i];
        if(currTime - ses.lastAccessTime > validateTime)
            delete sesPool[i];
    }
}


//every 1 minute
setInterval(checkValidate, 60000);

module.exports = sessionManager;