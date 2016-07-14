"use strict";

editor.server =
{
	init: function()
	{
		this.on("data", this.handleServerData, this);
	},

	connect: function(callback)
	{
		this.__callback = callback;

		this.connection = new WebSocket(editor.config.wsUrl, [ "soap", "xmpp" ]);
		this.connection.onopen = editor.server.handleOpen.bind(this);
		this.connection.onclose = editor.server.handleClose.bind(this);
		this.connection.onerror = editor.server.handleClose.bind(this);
		this.connection.onmessage = editor.server.handleMsg.bind(this);
	},

	handleOpen: function()
	{
		this.open = true;
		wabi.dataProxy = this.emit.bind(this);

		if(this.__callback) {
			this.__callback();
		}
	},

	handleClose: function()
	{
		this.open = false;
		wabi.dataProxy = null;

		var buffer = this.callbacks.close;
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

		var buffer = this.callbacks[data.type];
		if(!buffer) {
			return;
		}

		var watcher;
		for(var n = 0; n < buffer.length; n++) {
			watcher = buffer[n];
			watcher.func.call(watcher.owner, data);
		}
	},

	on: function(type, func, owner)
	{
		var watcher = new wabi.Watcher(owner, func);
		var buffer = this.callbacks[type];
		if(!buffer) {
			buffer = [ watcher ];
			this.callbacks[type] = buffer;
		}
		else {
			buffer.push(watcher);
		}
	},

	off: function(type, func, owner)
	{
		if(typeof(type) === "object")
		{
			owner = type;

			for(var key in this.callbacks)
			{
				var buffer = this.callbacks[key];
				var num = buffer.length;
				for(var n = 0; n < num; n++)
				{
					if(buffer[n].owner !== owner) { continue; }

					buffer[n] = buffer[num - 1];
					buffer.pop();
				}
			}
		}
		else {
			console.log("todo");
		}
	},

	emit: function(data)
	{
		if(!this.open) {
			console.warn("(editor.server) Connection is closed");
			return;
		}

		console.log("sent:", data);

		this.connection.send(JSON.stringify(data));
	},

	get: function(id, func, owner)
	{
		var data = this.data[id];
		if(!data)
		{
			data = new wabi.data(null, id);
			if(func) {
				data.watch(func, owner);
			}

			data.sync();

			this.data.performSetKey(id, data);

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

	handleServerData: function(serverData)
	{
		console.log("recv:", serverData)

		var data = this.data.get(serverData.id);
		if(!data) { return; }

		switch(serverData.action)
		{
			case "set":
			{
				if(serverData.key === void(0)) {
					data.performSet(serverData.value);
				}
				else {
					data.performSetKey(serverData.key, serverData.value);
				}
			} break;

			case "setkeys":
			{
				data.performSetKeys(serverData.value);
			} break;

			case "add":
			{
				if(serverData.key === void(0)) {
					data.performAdd(serverData.value);
				}
				else {
					data.performAddKey(serverData.key, serverData.value);
				}
			} break;

			case "remove":
			{
				console.log("todo")
			} break;
		}
	},

	applyData: function(data)
	{
		// this.applyItem(data.assets, "resources");
		// this.applyItem(data.assets, "defs");
		// this.applyItem(data.assets, "hierarchy");

		// data.resources = data.assets.resources;
		// data.defs = data.assets.defs;
		// data.hierarchy = data.assets.hierarchy;
		// delete data.assets

		// console.log(JSON.stringify(data));

		for(var key in data) {
			this.data.performSetKey(key, data[key]);
		}
	},

	applyItem: function(srcItem, name)
	{
		var items = srcItem[name];
		var content = {};

		for(var n = 0; n < items.length; n++) 
		{
			var item = items[n];
			var id = item.id.split("/");
			content[id.pop()] = item;
			delete item.id;

			if(item.content) {
				this.applyItem(item, "content")
			}
		}

		srcItem[name] = content;
	},

	//
	connection: null,
	open: false,
	callbacks: {},
	__callback: null
};

editor.server.init();
