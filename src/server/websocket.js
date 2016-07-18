"use strict";

editor.server.websocket =
{
	init: function()
	{
		editor.server.on("data", this.handleServerData, this);
	},

	connect: function(callback)
	{
		this.$callback = callback;

		this.connection = new WebSocket(editor.config.wsUrl, [ "soap", "xmpp" ]);
		this.connection.onopen = this.handleOpen.bind(this);
		this.connection.onclose = this.handleClose.bind(this);
		this.connection.onerror = this.handleClose.bind(this);
		this.connection.onmessage = this.handleMsg.bind(this);
	},

	handleOpen: function()
	{
		this.open = true;
		wabi.dataProxy = this.emit.bind(this);

		if(this.$callback) {
			this.$callback();
		}
	},

	handleClose: function()
	{
		this.open = false;
		wabi.dataProxy = null;

		var buffer = editor.server.callbacks.close;
		if(!buffer) {
			return;
		}

		var watcher;
		for(var n = 0; n < buffer.length; n++) {
			watcher = buffer[n];
			watcher.func.call(watcher.owner);
		}
	},

	handleMsg: function(msg)
	{
		var data = JSON.parse(msg.data);
		if(!data.type) {
			return;
		}

		var buffer = editor.server.callbacks[data.type];
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
			console.warn("(editor.server.websocket) Connection is closed");
			return;
		}

		console.log("sent:", data);

		this.connection.send(JSON.stringify(data));
	},

	get: function(id, func, owner, privateData)
	{
		privateData = privateData || false;

		var data = editor.data.get(id);
		if(!data)
		{
			data = new wabi.data(null, id);
			if(func) {
				data.watch(func, owner);
			}

			data.sync();

			editor.data.performSetKey(id, data);

			this.emit({
				id: id,
				type: "data",
				action: "get"
			});
		}
		else
		{
			if(func) {
				data.watch(func, owner);
			}
		}

		return data;
	},

	//
	connection: null,
	open: false,
	$callback: null
};

editor.server.websocket.init();
