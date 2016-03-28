"use strict";

Editor.controller("AssetHierarchy", "AssetBrowser",
{
	onLoad: function()
	{
		var ctxMenu = editor.plugins.ContextMenu;

		ctxMenu.add({
			name: "Hierarchy",
			content: []
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
							name: "Delete", 
							icon: "fa-trash",
							func: this.menu_Delete.bind(this)
						}
					]
				}
			]
		});	

		this.list = this.content.get("Hierarchy.Browser");
		this.list.on("select", this.handleInspectItem.bind(this));
		this.list.on("menu", this.openMenu.bind(this));
	},

	//
	name: "Hierarchy"
});
