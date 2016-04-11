"use strict";

Editor.controller("AssetHierarchy", "AssetBrowser",
{
	onLoad: function()
	{
		var ctxMenu = editor.plugins.ContextMenu;

		ctxMenu.add({
			name: "Hierarchy",
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
			name: "HierarchyItem",
			extend: [ "Hierarchy" ],
			content: [
				{
					name: "Actions", 
					type: "category",
					content: [
						{
							name: "Clone", 
							icon: "fa-clone",
							func: this.menu_Clone.bind(this)
						},
						{
							name: "Delete", 
							icon: "fa-trash",
							func: this.menu_Delete.bind(this)
						}
					]
				}
			]
		});	

		this.list = this.content.get("Hierarchy.Browser");
		this.list.on("select", this.handleSelect.bind(this));
		this.list.on("menu", this.openMenu.bind(this));
		this.list.on("move", this.handleMoveItem.bind(this));
		this.list.on("update", this.handleRenameItem.bind(this));
	},

	updateItemDeps: function(newId, prevId) {},

	menu_Clone: function() 
	{
		var data = this.currItem.info.data;
		var cloned = {};
		for(var key in data) {
			cloned[key] = data[key];
		}

		var item = this.addItem(this.currList, cloned);
		item.select = true;
	},

	//
	name: "Hierarchy"
});
