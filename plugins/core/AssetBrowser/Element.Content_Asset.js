"use strict";

meta.class("Element.Content_Asset", "Element.Content",
{
	onCreate: function()
	{
		this.data = {
			Container: {
				type: "container",
				content: {
					Browser: {
						type: "assetList"
					}
				}
			}		
		};

		this.list = this.get("Container.Browser");

		this.on("click", "Container.Browser.item", this.inspectItem.bind(this));
		this.on("update", "Container.Browser.item.name", this.renameItem.bind(this));
		this.on("menu", "*", this.showContextMenu.bind(this));
		this.on("create-folder", "*", this.createFolder.bind(this));
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
		var info = this.list.selectedItem.info;
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
		this.makeNameUnique(info);

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
		var item = this.list.createItem(info.name);
		item.tag = info.ext;
		item.icon = editor.resourceMgr.getIconFromExt(info.ext);
		item.info = info;
	},

	createFolder: function(event)
	{
		var parentList = event.element.parent;
		var item = parentList.createFolder("testsss");
	},

	showContextMenu: function()
	{
		var contextMenu = editor.plugins.ContextMenu;
		contextMenu.show([ "Create Folder" ], event.x, event.y, this.handleMenuChoice.bind(this));
	},

	handleMenuChoice: function(buffer)
	{

	},

	makeNameUnique: function(info, ext)
	{
		info.type = editor.resourceMgr.getTypeFromExt(info.ext);

		var baseDict = this.db[info.type];
		var extDict, dbDict;
		if(!baseDict) 
		{
			baseDict = {};
			baseDict[info.ext] = {};
			this.db[info.type] = baseDict;

			editor.needSave = true;
			return info.name;
		}

		extDict = baseDict[info.ext];
		if(!extDict) {
			extDict = {};
			baseDict[ext] = extDict;
			this.db[info.type][ext] = extDict;
		}

		var index = 2;
		var newName = info.name;

		main_loop:
		for(;;)
		{
			for(var fileName in extDict) 
			{
				if(fileName === newName) {
					newName = info.name + "_" + index;
					index++;
					continue main_loop;
				}
			}

			info.name = newName;
			return newName;
		}

		return name;
	},	

	//
	db: null,
	list: null
});
