"use strict";

Editor.controller("AssetDefs", "AssetBrowser",
{
	onLoad: function()
	{
		var ctxMenu = editor.plugins.ContextMenu;

		ctxMenu.add({
			name: "Defs",
			content: [
				{
					name: "Create", 
					type: "category",
					content: [
						{ 
							name: "Folder", 
							icon: "fa-folder",
							type: "folder",
							func: this.menu_Folder.bind(this)
						}
					]
				}
			]
		});

		ctxMenu.add({
			name: "DefsItem",
			extend: [ "Defs" ],
			content: [
				{
					name: "Actions", 
					type: "category",
					content: [
						{
							name: "Delete", 
							icon: "fa-trash",
							func: this.menu_Delete.bind(this)
						}
					]
				}
			]
		});

		this.list = this.content.get("Defs.Browser");
		this.list.on("select", this.handleSelect.bind(this));
		this.list.on("update", this.handleRenameItem.bind(this));
		this.list.on("move", this.handleMoveItem.bind(this));
		this.list.on("menu", this.openMenu.bind(this));	
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
	name: "Defs",
	list: null,

	db: null,
	dbLookup: null	
});
