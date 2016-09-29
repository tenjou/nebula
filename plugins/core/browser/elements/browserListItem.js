"use strict";

wabi.element("browserListItem", "listItem",
{
	elements: 
	{
		caret: {
			type: null,
			watch_value: "handleCaretChange"
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
		this.attrib("draggable", "true");
	},

	set_folder: function(value) {
		this.element("caret", value ? "caret" : null);
	},

	set_open: function(value)
	{

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

	handleCaretChange: function(value)
	{
		console.log("caret", value)
	},

	handle_dblclick: function(event)
	{
		if(!this.elements.caret) { return; }

		this.elements.caret.$value = !this.elements.caret.$value;
	},

	handle_dragstart: function(event) 
	{
		this.setCls("dragging", true);
		this.cache.dragging = this;

		event.domEvent.dataTransfer.effectAllowed = "move";
	},

	handle_dragend: function(event) 
	{
		this.setCls("dragging", false)
	},

	handle_dragenter: function(event) {
		this.setCls("dragover", true);
	},

	handle_dragleave: function(event) {
		this.setCls("dragover", false);
	},

	handle_dragover: function(event)
	{
		event.stop();
		event.domEvent.dataTransfer.dropEffect = "move";
	},

	handle_drop: function(event) 
	{
		if(this === this.cache.dragging) { return; }

		this.setCls("dragover", false);
		this.folder = true;

		var cacheData = this.cache.dragging.data;
		this.data.push("content", cacheData);

		event.stop();
	},
});
