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

		this.resList = this.get("Resources.Browser");
		this.defList = this.get("Defs.Browser");

		this.on("click", "Container.Browser.item", this.inspectItem.bind(this));
		this.on("click", "Container.Browser.folder", this.inspectItem.bind(this));
		this.on("update", "Container.Browser.item.name", this.renameItem.bind(this));
		//this.on("update", "Container.Browser.folder.name", this.renameItem.bind(this));
		this.resList.on("menu", "*", this.showResContextMenu.bind(this));
		this.defList.on("menu", "*", this.showDefContextMenu.bind(this));
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

	fill: function(data) 
	{
		this.db = data;

		for(var category in this.db) {
			this._loadFromCategory(category, this.db[category]);
		}		
	},	

	_loadFromCategory: function(category, data)
	{
		for(var ext in data) {
			this._loadFromExt(ext, data[ext]);
		}
	},

	_loadFromExt: function(ext, data)
	{
		var item;
		for(var name in data)
		{
			item = data[name];
			this._addItem(item);
		}
	},	

	addItem: function(info)
	{
		editor.plugins.AssetBrowser.makeNameUnique(info);

		var dict;
		var typeDict = this.db[info.type];
		if(!typeDict) {
			dict = {};
			this.db[info.type] = dict;
			typeDict = dict;
		}

		var extDict = typeDict[info.ext];
		if(!extDict) {
			dict = {};
			typeDict[info.ext] = dict;
			extDict = dict;
		}		

		extDict[info.name] = info;

		this._addItem(info);
	},

	_addItem: function(info)
	{
		var item = this.resList.createItem(info.name);
		item.tag = info.ext;
		item.icon = editor.resourceMgr.getIconFromExt(info.ext);
		item.info = info;
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

	},

	//
	db: null,
	resList: null,
	defList: null
});
