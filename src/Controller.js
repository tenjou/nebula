"use strict";

Editor.controller = function(clsName, extendName, obj) 
{
	if(typeof(extendName) === "object") {
		meta.class("Editor.Controller." + clsName, "Editor.Controller", extendName);
	}
	else {
		meta.class("Editor.Controller." + clsName, "Editor.Controller." + extendName, obj);
	}
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
