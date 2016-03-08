"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	onCreate: function()
	{
		this._super();

		this._tag = new Element.Tag(this);

		this.on("menu", "*", this.openMenu.bind(this));
	},

	openMenu: function(event)
	{
		var contextMenu = editor.plugins.ContextMenu;
		contextMenu.show([ "Create Folder", "Delete" ], event.x, event.y, this.handleMenuChoice.bind(this));
		return true;
	},

	handleMenuChoice: function(buffer) 
	{
		var value = buffer[0];
		switch(value) 
		{
			case "Delete":
				this.parent.removeItem(this.parent.selectedItem);
				break;

			case "Create Folder":
				this.emit("create-folder");
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

	set tag(name) {
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_caret: false,
	_tag: null,
	info: null
});
