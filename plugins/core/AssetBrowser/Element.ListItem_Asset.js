"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	set tag(name) 
	{
		if(!name) { return; }

		if(!this._tag) {
			this._tag = new Element.Tag(this._inner);
		}
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_tag: null,
	info: null
});
