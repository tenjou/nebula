"use strict";

Editor.controller("AssetDefs", "AssetBrowser",
{
	onCreate: function() 
	{
		this.content.on("menu", this.openMenu.bind(this));
	},

	onLoad: function()
	{
		this.list = this.content.get("Defs.Browser");
		this.list.on("select", this.handleInspectItem.bind(this));
		this.list.on("update", this.handleRenameItem.bind(this));
		this.list.on("move", this.handleMoveItem.bind(this));	
	},

	handleContextMenu: function(buffer)
	{
		var category = buffer[0];
		var type = buffer[1];

		if(category === "Create")
		{
			switch(type)
			{
				case "Folder":
					this.addFolder(this.currList);
					break;

				case "Sprite":
					this.createPrefab(this.currList, "sprite");
					break;
			}
		}
		else if(category === "Actions")
		{
			if(type === "Delete") {
				this.removeItem(this.currList, this.currItem);
			}
		}
	},

	createPrefab: function(list, type)
	{
		var info = {
			name: type,
			path: list.path,
			type: type,
			lastModified: Date.now()
		};

		this.addItem(list, info);
	},

	//
	list: null,

	db: null,
	dbLookup: null	
});
