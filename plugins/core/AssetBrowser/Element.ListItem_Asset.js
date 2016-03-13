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
		var menu = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder" 
					}
				]
			},
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Upload", 
						icon: "fa-upload"
					},
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}
		];

		editor.plugins.ContextMenu.show(menu, event.x, event.y, this.handleMenuChoice.bind(this));
		
		return true;
	},

	handleMenuChoice: function(buffer) 
	{
		var plugin = editor.plugins.AssetBrowser;

		var value = buffer[0];
		switch(value) 
		{
			case "Delete":
				this.parent.removeItem(this.parent.cache.selectedItem);
				break;

			case "Folder":
				plugin.createFolder("Folder", this);
				break;
		}
	},

	set tag(name) {
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_tag: null,
	info: null
});
