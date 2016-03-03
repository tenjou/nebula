"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	onCreate: function()
	{
		// var caret = new Element.Caret(this);
		this._icon = new Element.Icon(this);
		
		this._super();

		this._tag = new Element.Tag(this);

		this.on("menu", "*", this.openMenu.bind(this));
	},

	openMenu: function(event)
	{
		var contextMenu = editor.plugins.ContextMenu;
		contextMenu.show([ "Delete" ], event.x, event.y, this.handleMenuChoice.bind(this));
	},

	handleMenuChoice: function(event) 
	{
		var value = event.element.value;
		switch(value) 
		{
			case "Delete":
				this.parent.removeItem(this.parent.selectedItem);
				break;
		}
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
