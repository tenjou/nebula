"use strict";

meta.class("Editor.Plugin.AssetsBrowser", "Editor.Plugin",
{
	install: function()
	{
		var self = this;
		var inputParserTypes = editor.inputParser.types;
		inputParserTypes.assetBrowser = function(parent, name, data) 
		{
			var browser = new Element.List_Asset(parent);
			browser.itemCls = Element.ListItem_Asset;
			browser.ctrl = self;
			browser.info = "No assets found"
		};
		inputParserTypes.searchBar = function(parent, name, data) {
			console.log("create search bar");
		};
	},

	onDbLoad: function(db)
	{
		if(!db.assets) {
			this.db = {};
			db.assets = this.db;
			editor.needSave = true;
			return;
		}

		this.db = db.assets;
		this.assets = {};
		for(var category in this.db) {
			this._loadFromCategory(category, this.db[category]);
		}
	},

	_loadFromCategory: function(category, data)
	{
		var categoryDict = {};
		this.assets[category] = categoryDict;

		for(var ext in data) {
			this._loadFromExt(ext, data[ext], categoryDict);
		}
	},

	_loadFromExt: function(ext, data, categoryDict)
	{
		var assetsDict = {};
		categoryDict[ext] = assetsDict;

		var item;
		for(var name in data)
		{
			item = data[name];
			assetsDict[name] = item;
			this._addItem(item);
		}
	},

	onStart: function()
	{
		var leftToolbar = editor.inner.leftToolbar;
		var tabInputData = {
			Browser: {
				type: "container",
				content: {
					SearchBar: {
						type: "searchBar"
					},
					Browser: {
						type: "assetBrowser"
					}
				}
			}		
		};
		var tab = leftToolbar.createTab("Assets", tabInputData);

		this.list = tab.content.query("container/list");		
	},

	handleEvent: function(id, event, element)
	{
		if(event === "click")
		{
			if(id === "list/item") 
			{
				if(element === this.selectedItem) { return; }
				
				element.select = true;

				if(!this.selectedItem) {
					this.selectedItem = element;
				}
				else {
					this.selectedItem.select = false;
					this.selectedItem = element;
				}

				console.log(element.info);
			}
		}
		else if(event === "update") {
			this.renameItem(element);
		}
	},

	renameItem: function(element)
	{
		var info = element.parent.info;
		if(this.db[info.type][info.ext][element.value]) {
			element.revert();
		}
		else 
		{
			editor.fileSystem.moveTo(
				info.name + "." + info.ext, 
				element.value + "." + info.ext);
			info.name = element.value;
		}

		editor.saveCfg();
	},

	addItem: function(info)
	{
		this.makeNameUnique(info);

		this.db[info.type][info.ext][info.name] = info;

		this._addItem(info);
	},

	_addItem: function(info)
	{
		var item = this.list.createItem(info.name);
		item.tag = info.ext;
		item.icon = editor.resourceMgr.getIconFromExt(info.ext);
		item.info = info;
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
	list: null,
	selectedItem: null,

	db: null
});
