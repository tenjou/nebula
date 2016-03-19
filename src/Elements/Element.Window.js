"use strict";

meta.class("Element.Window", "Element.Basic",
{
	set content(content) 
	{
		if(this._content) {
			this.remove(this._content);
		}

		this._content = content;
		this.append(this._content);
	},

	get content() {
		return this._content;
	},

	//
	elementTag: "window",

	content: null
});