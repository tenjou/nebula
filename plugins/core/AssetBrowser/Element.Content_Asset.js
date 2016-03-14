"use strict";

meta.class("Element.Content_Asset", "Element.Content",
{
	onCreate: function()
	{
		this.data = {
			Resources: {
				type: "containerNamed",
				content: {
					Browser: {
						type: "resourceList"
					}
				}
			},
			Defs: {
				type: "containerNamed",
				content: {
					Browser: {
						type: "defList"
					}
				}
			}	
		};

		this.listRes = this.get("Resources.Browser");
		this.listDefs = this.get("Defs.Browser");

		this.listRes.on("select", "*", this.inspectItem.bind(this));
		//this.on("update", "Container.Browser.item.name", this.renameItem.bind(this));
		//this.on("update", "Container.Browser.folder.name", this.renameItem.bind(this));
		this.listRes.on("menu", "*", this.showResContextMenu.bind(this));
		this.listDefs.on("menu", "*", this.showDefContextMenu.bind(this));
	},

	inspectItem: function(event) {
		var element = event.element;
		editor.plugins.Inspect.show(element.info.type, element.info);		
	},

	renameItem: function(event)
	{
		var element = event.element;
		var info = element.parent.info;
		
		if(this.db[info.type][info.ext][element.value]) {
			element.revert();
			return;
		}
		else 
		{
			editor.fileSystem.moveTo(
				info.name + "." + info.ext, 
				element.value + "." + info.ext, this.updateInspect.bind(this));

			delete this.db[info.type][info.ext][info.name];
			info.name = element.value;
			this.db[info.type][info.ext][element.value] = info;
		}

		editor.saveCfg();
	},

	updateInspect: function()
	{
		var info = this.list.cache.selectedItem.info;
		editor.plugins.Inspect.show(info.type, info);
	},

	fill: function(list, db) 
	{
		list.db = db;
		list.dbLookup = {};

		this._loadFolder(db, list);

		list.sort();	
	},	

	_loadFolder: function(db, list)
	{
		var item, folder;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			item = db[n];
			if(item.type === "folder") {
				folder = list._addFolder(item);
				this._loadFolder(item.content, folder.list);
			}
			else {
				list._addItem(item);
			}
		}	
	},

	showResContextMenu: function()
	{
		var contextMenu = editor.plugins.ContextMenu;
		contextMenu.show([ "Create Folder", "Upload" ], event.x, event.y, this.handleMenuChoice.bind(this));
	},

	showDefContextMenu: function()
	{
		var contextMenu = editor.plugins.ContextMenu;
		contextMenu.show([ "Create Folder2", "Upload" ], event.x, event.y, this.handleMenuChoice.bind(this));
	},	

	handleMenuChoice: function(buffer)
	{
		var category = buffer[0];
		if(category === "Create") 
		{
			
		}
	},

	//
	listRes: null,
	listDefs: null
});
