"use strict";

meta.class("Room", 
{
	init: function() 
	{
		this.widgets = [];

		this.element = document.createElement("div");
		this.element.setAttribute("id", "room-" + this.name);

		if(this.onInit) {
			this.onInit();
		}

		this.data = {};
	},

	load: function(data) 
	{
		this.data = data;

		editor.screen.appendChild(this.element);

		if(this.onLoad) {
			this.onLoad();
		}
	},

	unload: function() 
	{
		editor.screen.removeChild(this.element);

		if(this.onUnload) {
			this.onUnload();
		}
	},

	handleResize: function() 
	{
		if(this.onResize) {
			this.onResize();
		}

		var numWidgets = this.widgets.length;
		for(var n = 0; n < numWidgets; n++) {
			this.widgets[n].onResize();
		}
	},

	//
	widgets: null,
	element: null,
	data: null,
	name: "unknown"
});