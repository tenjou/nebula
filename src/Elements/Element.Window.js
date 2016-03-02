"use strict";

meta.class("Element.Window", "Element.Basic",
{
	init: function(parent, id)
	{
		this._init(parent, id);
		
		this.content = new Element.Content(this);
		
		if(this.onCreate) {
			this.onCreate();
		}
	},

	//
	elementTag: "window",

	content: null
});