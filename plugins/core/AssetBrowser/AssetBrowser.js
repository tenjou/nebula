"use strict";

meta.class("Editor.Plugin.AssetBrowser", "Editor.Plugin",
{
	install: function()
	{
		var self = this;

		var inputTypes = editor.inputParser.types;
		inputTypes.resourceList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.onItemRemove = self.removeItem.bind(self);
			list.itemCls = Element.ListItem_Asset;
			list.info = "No resources found";
			return list;
		};
		inputTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.onItemRemove = self.removeItem.bind(self);
			list.itemCls = Element.ListItem_Asset;
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
		if(!db.assets)
		{
			db.assets = {
				resources: [],
				defs: []
			};

			editor.needSave = true;
		}

		this.db = db.assets;
		this.dbResources = this.db.resources;
		this.dbDefs = this.db.defs;

		this.content.fill(this.content.listRes, this.dbResources);
		this.content.fill(this.content.listDefs, this.dbDefs);		
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
		this.content.resList.cache.selectedItem.name = value;
		if(this.content.list.cache.selectedItem.name !== value) {
			return false;
		}
		return true;
	},

	//
	db: null,
	dbResources: null,
	dbDefs: null,
	content: null
});
