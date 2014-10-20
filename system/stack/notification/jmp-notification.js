/**********************************************************************************
 * (C) Copyright 2014, Juniper Networks. Inc
 * All rights reserved
 * 
 * @classdesc A bridge class between jboss node and nodejs server. It will receive notifications
 * from jboss via stomp protocol and then send them to client view socket.io.
 * 
 * @version 2.0
 * @author juntao
 * 
 **********************************************************************************/
var notification = {
	startNotification: function(server){
        var notificationLogger = logger.getLogger("notification");
		var io = require("socket.io")();
        io.serveClient(false);
        io.listen(server.serverInstance);
		
		//listening for every connection
		io.sockets.on("connection", function(socket){
            notificationLogger.debug("A new client connected");
			socket.on("jmp-client-event", function(data){
				var event = data.event;
				if(event == "register"){
                    notificationLogger.debug("Client register : Session id is '" + data.sessionId + "', Browser is '" + data.browser + "', Browser Id is '" + data.browserId + "'");
					socketMapping.registerSocketInfo(socket, data);
				}
				else if(event == "category"){
					var category = data.category;
					if(category instanceof Array){
						for(var i = 0; i < category.length; i ++){
                            notificationLogger.debug("Adding category: " + category[i]);
							socketMapping.registerCategory(category[i], socket);
						}
					}
					else{
                        notificationLogger.debug("Adding category: " + category);
						socketMapping.registerCategory(category, socket);
					}
				}
			});
			
			//listening for client disconnecting event.Clear server datas.
			socket.on("disconnect", function() {
				var content = socketMapping.getSocketInfo(socket);
				if(content == null)
                    notificationLogger.debug("Client disconnected");
				else{
					socketMapping.removeSocket(socket);
                    notificationLogger.debug("Client disconnected: Session id '" + content.sessionId + "', Client Ip '" + content.clientIp + "', Browser Id '" + content.browserId + "'");
				}
			});
		});
		
		logger.system("  - Notification was started");
	},
	sendNotification: function (category, data) {
		var sockets = socketMapping.getMatchSockets(category);
		if(sockets != null){
			for(var i = 0; i < sockets.length; i ++)
				sockets[i].emit("jmp-notification", data);
		}
	}
};

module.exports = notification;

var socketMapping = {
	categorySocketMap: {},
	socketInfoMap: {},
	removeSocket: function(socket) {
		for(var i in this.categorySocketMap){
			var sockets = this.categorySocketMap[i];
			for(var j = sockets.length - 1; j >= 0; j --){
				if(sockets[j] == socket){
					sockets.splice(j, 1);
				}
			}
		}
		delete this.socketInfoMap[socket];
	},
	
	registerSocketInfo: function(socket, content){
		this.socketInfoMap[socket] = content;
	},
	
	getSocketInfo: function(socket){
		return this.socketInfoMap[socket];
	},
	
	registerCategory: function(category, socket){
		var sockets = this.categorySocketMap[category];
		if(sockets == null){
			sockets = [];
			this.categorySocketMap[category] = sockets;
		}
		sockets.push(socket);
	},
	
	getMatchSockets: function(category) {
		return this.categorySocketMap[category];
	}
};

function socketInfo(socket, browserId, sessionId, clientIp){
	this.socket = socket;
	this.browserId = browserId;
	this.sessionId = sessionId;
	this.clientIp = clientIp;
};

