"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		caret: {
			type: null,
			link: "open"
		},
		icon: {
			type: "type",
			link: "type",
			bind: "type"
		},
		name: {
			type: "word",
			link: "value",
			bind: "value"
		},
		tag: {
			type: null,
			bind: "ext"
		}
	},

	setup: function() {
		// this.attrib("draggable", "true");
	},

	set_folder: function(value) {
		this.element("caret", value ? "caret" : null);
	},

	set_tag: function(value) 
	{
		if(value)
		{
			this.element("tag", "tag");
			this.elements.tag.$value = value;
		}
		else
		{
			this.element("tag", null);
		}
	},

	handle_dblclick: function(event)
	{
		if(!this.elements.caret) { return; }

		this.elements.caret.$value = !this.elements.caret.$value;
	},

	handle_dragenter: function(event) 
	{
		// if(event.element === this) { return; }

		this.setCls("dragover", true);
	},

	handle_dragleave: function(event) 
	{
		// if(event.element === this) { return; }

		this.setCls("dragover", false);
	},

	// handle_dragstart: function(event) 
	// {
	// 	this.setCls("dragging", true);
	// 	this.cache.dragging = this;

	// 	event.domEvent.dataTransfer.effectAllowed = "move";
	// },

	// handle_dragend: function(event) 
	// {
	// 	this.setCls("dragging", false)
	// },

	// handle_dragenter: function(event) 
	// {
	// 	if(event.element === this) { return; }

	// 	this.setCls("dragover", true);
	// },

	// handle_dragleave: function(event) 
	// {
	// 	if(event.element === this) { return; }

	// 	this.setCls("dragover", false);
	// },

	// handle_dragover: function(event)
	// {
	// 	if(event.element === this) { return; }

	// 	var bounds = this.domElement.getBoundingClientRect();
	// 	// console.log(bounds);
	// 	// console.log("cursor", event.x, event.y)

	// 	if((bounds.top + 5) <= event.y) {
	// 		console.log("drag-top");
	// 		return;
	// 	}
	// 	else if((bounds.bottom - 5) >= event.y) {
	// 		console.log("drag-bottom")
	// 		return;
	// 	}

	// 	event.stop();
	// 	event.domEvent.dataTransfer.dropEffect = "move";
	// },

	// handle_drop: function(event) 
	// {
	// 	if(event.element === this) { return; }

	// 	this.setCls("dragover", false);
	// 	this.folder = true;

	// 	var cacheData = this.cache.dragging.data;
	// 	this.data.push("content", cacheData);

	// 	event.stop();
	// },
});
