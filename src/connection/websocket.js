"use strict";

editor.connection.websocket =
{
	init: function()
	{
		editor.connection.on("data", this.handleServerData, this);
	},

	connect: function(callback)
	{
		this.$callback = callback;

		this.connection = new WebSocket(editor.config.wsUrl, [ "soap", "xmpp" ]);
		this.connection.onopen = this.handleOpen.bind(this);
		this.connection.onclose = this.handleClose.bind(this);
		this.connection.onerror = this.handleError.bind(this);
		this.connection.onmessage = this.handleMsg.bind(this);
	},

	handleOpen: function()
	{
		this.open = true;

		if(this.$callback) {
			this.$callback();
		}
	},

	handleClose: function(event)
	{
		this.open = false;
		wabi.dataProxy = null;

		var error = this.getError(event);
		if(error) {
			console.error("(editor.connection.websocket.handleClose) " + error);
		}

		var buffer = editor.connection.callbacks.close;
		if(!buffer) {
			return;
		}

		var watcher;
		for(var n = 0; n < buffer.length; n++) {
			watcher = buffer[n];
			watcher.func.call(watcher.owner);
		}
	},

	handleError: function(error, error2)
	{
		
	},

	handleMsg: function(msg)
	{
		var data = JSON.parse(msg.data);
		if(!data.type) {
			return;
		}

		var buffer = editor.connection.callbacks[data.type];
		if(!buffer) {
			return;
		}

		var watcher;
		for(var n = 0; n < buffer.length; n++) {
			watcher = buffer[n];
			watcher.func.call(watcher.owner, data);
		}
	},

	emit: function(data)
	{
		if(!this.open) {
			console.warn("(editor.connection.websocket) Connection is closed");
			return;
		}

		console.log("sent:", data);

		this.connection.send(JSON.stringify(data));
	},

	getError: function(event)
	{
		switch(event.code)
		{
			case 1000:
				return "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
       		case 1001:
            	return "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            case 1002:
            	return "An endpoint is terminating the connection due to a protocol error";
            case 1003:
            	return "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";		
			case 1004:
				return "Reserved. The specific meaning might be defined in the future.";
			case 1005:
				return "No status code was actually present.";
			case 1006:
				return "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
			case 1007:
				return "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
			case 1008:
				return "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
			case 1009:
				return "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
			case 1010:
				return "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
			case 1011:
				return "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
			case 1015:
				return "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
		}	

		return null;
	},

	//
	connection: null,
	open: false,
	$callback: null
};

editor.connection.websocket.init();
