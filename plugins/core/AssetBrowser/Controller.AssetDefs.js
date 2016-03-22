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

	createListMenu: function(element)
	{
		var pluginAssetBrowser = editor.plugins.AssetBrowser;
		return pluginAssetBrowser.menuDefs;
	},

	createItemMenu: function(element)
	{
		var pluginAssetBrowser = editor.plugins.AssetBrowser;
		return editor.plugins.ContextMenu.mergeMenus(
			pluginAssetBrowser.menuDefs, 
			pluginAssetBrowser.menuItemDefs);
	},		

	handleContextMenu: function(buffer)
	{
		var category = buffer[0];
		var item = buffer[1];

		if(category.name === "Create")
		{
			switch(item.type)
			{
				case "folder":
					this.addFolder(this.currList);
					break;

				default:
					this.createPrefab(this.currList, item.type);
					break;
			}
		}
		else if(category.name === "Actions")
		{
			if(item.name === "Delete") {
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
