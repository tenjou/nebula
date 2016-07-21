"use strict";

if(!window.wabi) {
	window.wabi = {};
}

wabi.data = function(raw, id, parent) 
{
	this.raw = raw ? raw : {};

	if(id !== undefined) {
		this.id = id;
	}
	else {
		this.id = "";
	}

	if(parent) {
		this.parent = parent;
	}
};

wabi.data.prototype = 
{
	set: function(key, value)
	{
		if(value === void(0)) 
		{
			if(wabi.dataProxy) 
			{
				wabi.dataProxy({ 
					id: this.genId(),
					type: "data",
					action: "set",
					value: key
				});
			} 
			else {
				this.performSet(key);
			}
		}
		else 
		{
			if(wabi.dataProxy) 
			{
				wabi.dataProxy({ 
					id: this.genId(),
					type: "data",
					action: "set",
					key: key,
					value: value
				});
			}
			else {
				this.performSetKey(key, value);
			}
		}
	},

	performSet: function(value) 
	{
		this.raw = value;

		if(this.watchers) 
		{
			var info;
			for(var n = 0; n < this.watchers.length; n++) {
				info = this.watchers[n];
				info.func.call(info.owner, "set", null, value, 0, this);
			}
		}
	},

	performSetKey: function(key, value) 
	{
		var index = key.indexOf(".");
		if(index === -1) 
		{
			if(value instanceof Object && !(value instanceof wabi.data)) {
				value = new wabi.data(value, key, this);
			}

			this.raw[key] = value;
		}
		else
		{
			var id;
			var data = this;
			var buffer = key.split(".");
			for(var n = 0; n < buffer.length - 1; n++) 
			{
				id = buffer[n];

				var currData = data.get(id);
				if(!currData) {
					currData = new wabi.data({}, id, data);
					data[id] = currData;
				}

				data = currData;
			}

			id = buffer[n];

			if(value instanceof Object && !(value instanceof wabi.data)) {
				value = new wabi.data(value, id, data);
			}

			data.raw[id] = value;
		}

		if(this.watchers) 
		{
			var info;
			for(var n = 0; n < this.watchers.length; n++) {
				info = this.watchers[n];
				info.func.call(info.owner, "set", key, value, 0, this);
			}
		}

		return value;
	},

	setKeys: function(value)
	{
		if(wabi.dataProxy) 
		{
			wabi.dataProxy({ 
				id: this.genId(),
				type: "data",
				action: "setkeys",
				value: value
			});
		}
		else {
			this.performSetKeys(value);
		}
	},	

	performSetKeys: function(value)
	{
		for(var key in value) {
			this.performSetKey(key, value[key]);
		}
	},

	add: function(key, value)
	{
		if(value === void(0)) 
		{
			if(wabi.dataProxy) 
			{
				wabi.dataProxy({ 
					id: this.genId(),
					type: "data",
					action: "add",
					value: key
				});
			}
			else {
				this.performAdd(value);
			}
		}
		else
		{
			if(wabi.dataProxy) 
			{
				wabi.dataProxy({ 
					id: this.genId(),
					type: "data",
					action: "add",
					key: key,
					value: value
				});
			}
			else {
				this.performAddKey(key, value);
			}
		}
	},

	performAdd: function(value)
	{
		if(this.raw instanceof Array) 
		{
			if(value instanceof Object && !(value instanceof wabi.data)) {
				value = new wabi.data(value, this.raw.length + "", this);
			}

			this.raw.push(value);
		}
		else 
		{
			console.warn("(wabi.data.performAdd) Can peform add only to Array");
			return;
		}

		if(this.watchers) 
		{
			var info;
			for(var n = 0; n < this.watchers.length; n++) {
				info = this.watchers[n];
				info.func.call(info.owner, "add", null, value, -1, this);
			}
		}	
	},

	performAddKey: function(key, value)
	{
		if(this.raw instanceof Object) 
		{
			if(value instanceof Object && !(value instanceof wabi.data)) {
				value = new wabi.data(value, key, this);
			}

			this.raw[key] = value;
		}
		else 
		{
			console.warn("(wabi.data.performAddKey) Can peform add only to Object");
			return;
		}		

		if(this.watchers) 
		{
			var info;
			for(var n = 0; n < this.watchers.length; n++) {
				info = this.watchers[n];
				info.func.call(info.owner, "add", key, value, -1, this);
			}
		}
	},

	remove: function(key, id)
	{
		// Remove self?
		if(key === void(0)) 
		{
			// this.parent.removeItem();
		}
		else
		{
			delete this.raw[key];

			if(this.watchers) 
			{
				var info;
				for(var n = 0; n < this.watchers.length; n++) {
					info = this.watchers[n];
					info.func.call(info.owner, "remove", key, id, 0, this);
				}
			}	
		}
	},

	removeItem: function(key, id)
	{
		var item = this.raw[key];
		if(typeof(item) !== "object") {
			return;
		}

		if(item instanceof Array) {
			item.splice(id, 1);
		}
		else {
			delete item[id];
		}

		if(this.watchers) 
		{
			var info;
			for(var n = 0; n < this.watchers.length; n++) {
				info = this.watchers[n];
				info.func.call(info.owner, "removeItem", key, null, id, this);
			}
		}
	},

	get: function(index) 
	{
		if(index === "*") {
			return this.raw;
		}
		else if(index === "@") {
			return this.id;
		}

		var data;
		if(!isNaN(index)) 
		{
			data = this.raw[parseInt(index)];

			if(typeof(data) === "object" && !(data instanceof wabi.data)) {
				data = new wabi.data(data, index + "", this);
				this.raw[index] = data;
			}
		}
		else 
		{
			var buffer = index.split(".");
			data = this;
			for(var n = 0; n < buffer.length; n++)
			{
				data = data.getItem(buffer[n]);
			}
		}

		return data;
	},

	getItem: function(id)
	{
		if(id === "*") {
			return this.raw;
		}

		var data;
		if(!isNaN(id)) {
			data = this.raw[parseInt(id)];
		}
		else 
		{
			data = this.raw[id];

			if(!data) {
				if(this.raw.content) {
					data = this.raw.content[id];
				}
			}
		}

		if(typeof(data) === "object" && !(data instanceof wabi.data)) {
			data = new wabi.data(data, id + "", this);
			this.raw[id] = data;
		}

		return data;
	},

	getFromKeys: function(keys)
	{
		var data = this;
		for(var n = 0; n < keys.length; n++) 
		{
			data = data.get(keys[n]);
			if(!data) {
				return null;
			}
		}

		return data;
	},

	genId: function()
	{
		if(!this.parent) { return this.id; }

		var id = this.id;
		var parent = this.parent;
		do 
		{
			if(!parent.id) { return id; }
			
			id = parent.id + "." + id;
			parent = parent.parent;
		} while(parent);

		return id;
	},

	watch: function(func, owner) 
	{
		if(!func) {
			console.warn("(wabi.data.watch) Invalid callback function passed");
			return;
		}
		if(!owner) {
			console.warn("(wabi.data.watch) Invalid owner passed");
			return;
		}

		if(this.watchers) {
			this.watchers.push(new this.Watcher(owner, func));
		}
		else {
			this.watchers = [ new this.Watcher(owner, func) ];
		}
	},

	unwatch: function(func, owner)
	{
		if(!this.watchers) { return; }

		var num = this.watchers.length;
		for(var n = 0; n < num; n++) 
		{
			var info = this.watchers[n];
			if(info.owner === owner && info.func === func) {
				this.watchers[n] = this.watchers[num - 1];
				this.watchers.pop();
				return;
			}
		}
	},

	sync: function() 
	{
		if(this.watchers) 
		{
			for(var n = 0; n < this.watchers.length; n++) {
				var info = this.watchers[n];
				info.func.call(info.owner, "sync", null, null, 0, this);
			}
		}	
	},

	__syncAsArray: function(data)
	{
		this.raw = data;

		if(this.watchers) 
		{
			for(var n = 0; n < this.watchers.length; n++) {
				var info = this.watchers[n];
				info.func.call(info.owner, "set", null, data, 0, this);
			}
		}	
	},

	__syncAsObject: function(data)
	{
		this.raw = {};

		for(var key in data)
		{
			var srcValue = this.raw[key];
			var targetValue = data[key];

			if(srcValue === void(0)) {
				this.raw[key] = targetValue;
			}
			else if(srcValue === targetValue) {
				srcValue = targetValue;
			}

			if(this.watchers) 
			{
				for(var n = 0; n < this.watchers.length; n++) {
					var info = this.watchers[n];
					info.func.call(info.owner, "set", key, targetValue, 0, this);
				}
			}
		}
	},

	toJSON: function() {
		return this.raw;
	},

	Watcher: function(owner, func) 
	{
		this.owner = owner ? owner : null,
		this.func = func;
	},

	//
	watchers: null,
	parent: null
};
