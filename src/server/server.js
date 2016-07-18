"use strict";

editor.server =
{
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
		if(editor.offline) {
			this.offline.emit(data);
		}
		else {
			this.websocket.emit(data);
		}
	},

	get: function(id, func, owner, privateData)
	{
		if(editor.offline) {
			return this.offline.get(id, func, owner, privateData);
		}
		else {
			return this.websocket.get(id, func, owner, privateData);
		}
	},

	handleServerData: function(serverData)
	{
		console.log("recv:", serverData)

		var data = editor.data.get(serverData.id);
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
		var data = editor.data;

		for(var key in data) {
			data.performSetKey(key, data[key]);
		}
	},

	//
	callbacks: {},
	
	offline: null,
	websocket: null
};
