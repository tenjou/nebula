"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	onCreate: function()
	{
		// var caret = new Element.Caret(this);
		this._icon = new Element.Icon(this);
		
		this._super();

		this._tag = new Element.Tag(this);
	},

	set caret(value) 
	{
		if(this._caret === value) { return; }
		this._caret = value;
	},

	get caret() {
		return this._caret;
	},	

	set icon(type) {
		this._icon.type = type;
	},

	get icon() {
		return this._icon.type;
	},

	set tag(name) {
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_caret: false,
	_icon: null,
	_tag: null,
	info: null
});
