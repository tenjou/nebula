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
		this.list.on("select", this.inspectItem.bind(this));
		this.list.on("update", this.renameItem.bind(this));
		this.list.on("move", this.moveItem.bind(this));	
	},

	createListMenu: function(element)
	{
		var menu = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder" 
					},
					{ 
						name: "Sprite", 
						icon: "fa-cube" 
					}					
				]
			}
		];

		this.currItem = element;
		this.currList = element;		

		return menu;
	},

	createItemMenu: function(element)
	{
		var menu = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder" 
					},
					{ 
						name: "Sprite", 
						icon: "fa-cube" 
					}					
				]
			},
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}			
		];

		this.currItem = element;
		this.currList = element.parent;		

		return menu;
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
