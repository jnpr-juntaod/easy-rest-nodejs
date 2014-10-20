var messageBridge = {
	start: function(clientNotification) {
		var OBJ_TYPE = "managed_object";
		/**
		 * Subscribe topic from jboss
		 */
		var stomp = require("./jmp-stomp");
		stomp.start();
		stomp.subscribe("jms.topic.clustered.CMPDatabaseChange", function(message){
			try{
                if(message.body == null || message.body == "")
                    throw new Jx.JmpRuntimeError("Got illegal message, message body is null");
				var body = JSON.parse(message.body);
				var objType = body.objectType;
				clientNotification.sendNotification(objType , body);
			}
			catch(error){
				logger.error(error);
			}
		});
	}	
};

module.exports = messageBridge;

