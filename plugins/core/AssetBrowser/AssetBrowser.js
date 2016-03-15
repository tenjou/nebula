"use strict";

meta.class("Editor.Plugin.AssetBrowser", "Editor.Plugin",
{
	install: function()
	{
		var inputTypes = editor.inputParser.types;
		inputTypes.resourceList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.itemCls = Element.ListItem_Asset;
			list.info = "No resources found";

			return list;
		};
		inputTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.itemCls = Element.ListItem_Asset;
			list.info = "No defs found";

			return list;
		};
	},

	onStart: function()
	{	
		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Project");

		this.contentResources = new Element.Content();
		this.contentResources.load(Controller.AssetResources);
		tab.addContent(this.contentResources);

		this.contentDefs = new Element.Content();
		this.contentDefs.load(Controller.AssetDefs);
		tab.addContent(this.contentDefs);
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

		this.contentResources.ctrl.loadFromDb(this.db.resources);
		this.contentDefs.ctrl.loadFromDb(this.db.defs);	
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
	contentResources: null,
	contentDefs: null
});
