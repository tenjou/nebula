"use strict";

meta.class("Editor.Plugin.AssetBrowser", "Editor.Plugin",
{
	install: function()
	{
		var self = this;

		var inputParserTypes = editor.inputParser.types;
		inputParserTypes.resourceList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.onItemRemove = self.removeItem.bind(self);
			list.itemCls = Element.ListItem_Asset;
			list.folderCls = Element.ListFolder_Asset;
			list.info = "No resources found";
			return list;
		};
		inputParserTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.onItemRemove = self.removeItem.bind(self);
			list.itemCls = Element.ListItem_Asset;
			list.folderCls = Element.ListFolder_Asset;
			list.info = "No defs found";
			return list;
		};
	},

	onStart: function()
	{		
		this.content = new Element.Content_Asset();

		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Project");
		tab.content = this.content;
	},

	onDbLoad: function(db)
	{
		if(!db.assets) {
			this.db = {};
			db.assets = this.db;
			editor.needSave = true;
		}
		else {
			this.db = db.assets;
		}
		
		this.content.fill(this.db);
	},

	removeItem: function(element) 
	{
		var info = element.info;
		var fileName = info.name + "." + info.ext;
		editor.fileSystem.remove(fileName);

		delete this.db[info.type][info.ext][info.name];
		editor.saveCfg();

		if(element.select) {
			editor.plugins.Inspect.show("default");
		}
	},

	renameSelectedItem: function(value) 
	{
		this.content.list.cache.selectedItem.name = value;
		if(this.content.list.cache.selectedItem.name !== value) {
			return false;
		}
		return true;
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
	content: null
});
