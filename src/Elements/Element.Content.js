"use strict";

meta.class("Element.Content", "Element.Basic",
{
	get: function(id)
	{
		var node = this.tree;
		var buffer = id.split(".");
		var num = buffer.length;
		for(var n = 0; n < num; n++) 
		{
			if(!node.children) {
				return null;
			}

			node = node.children[buffer[n]];
			if(!node) {
				return null;
			}
		}

		return node.element;
	},

	fill: function(data) {},

	set data(data) {
		this.tree = editor.inputParser.parse(this, data);
	},

	set hidden(value) 
	{
		if(value) {
			this.element.setAttribute("class", "hidden");
		}
		else {
			this.element.setAttribute("class", "");
		}
	},

	get hidden() 
	{
		var cls = this.element.getAttribute("class");
		if(cls === "hidden") {
			return true;
		}

		return false;
	},

	//
	elementTag: "content",
	tree: null
});