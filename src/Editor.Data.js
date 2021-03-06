"use strict";

Editor.Data = function(data) 
{
	this.data = data ? data : {};
	this.watchers = [];
};

Editor.Data.prototype = 
{
	remove: function() {
		this.emit("remove");
	},

	set: function(key, value)
	{
		var prevValue = this.data[key];
		if(prevValue === value) { return; }
		
		this.data[key] = value;

		editor.saveCfg();
		this.emit("update", key, prevValue);
	},

	get: function(key, value)
	{
		var value = this.data[key];
		if(value !== void(0)) {
			return value;
		}

		return null;
	},

	watch: function(cb) {
		this.watchers.push(cb);
	},

	unwatch: function(cb) 
	{
		var index = this.watchers.indexOf(cb);
		if(index > -1) {
			this.watchers[index] = this.watchers[this.watchers.length - 1];
			this.watchers.pop();
		}
	},

	emit: function(event, key, prevValue) 
	{
		for(var n = 0; n < this.watchers.length; n++) {
			this.watchers[n](this, key, prevValue);
		}
	},

	//
	element: null
};
