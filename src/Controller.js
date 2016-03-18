"use strict";

Editor.ControllerMap = {};

Editor.controller = function(clsName, extendName, obj) 
{
	if(typeof(extendName) === "object") {
		meta.class("Editor.Controller." + clsName, "Editor.Controller", extendName);
	}
	else {
		meta.class("Editor.Controller." + clsName, "Editor.Controller." + extendName, obj);
	}

	var scope = Editor.Controller;
	var buffer = clsName.split(".");
	var num = buffer.length;
	for(var n = 0; n < num; n++) 
	{
		scope = scope[buffer[n]];
		if(!scope) {
			console.warn("(Editor.controller) Invalid class: Editor.Controller." + clsName);
			break;
		}
	}

	Editor.ControllerMap[clsName] = scope;
};

meta.class("Editor.Controller",
{
	init: function(content) 
	{
		this.content = content;
		if(this.onCreate) {
			this.onCreate();
		}
	},

	onCreate: null,

	load: function()
	{
		if(this.onLoad) {
			this.onLoad();
		}
	},

	onLoad: null,

	bindData: function(data) 
	{
		this.data = data;
		if(this.onBindData) {
			this.onBindData();
		}
	},

	onBindData: null,

	//
	content: null,
	data: null
});
