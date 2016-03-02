"use strict";

meta.class("Editor.Plugin.AssetsBrowser", "Editor.Plugin",
{
	install: function()
	{
		var inputParserTypes = editor.inputParser.types;
		inputParserTypes.assetList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.itemCls = Element.ListItem_Asset;
			list.info = "No assets found";
			return list;
		};
	},

	onStart: function()
	{		
		this.content = new Element.Content_Asset();

		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Assets");
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

	renameSelectedItem: function(value) 
	{
		this.content.list.selectedItem.name = value;
		if(this.content.list.selectedItem.name !== value) {
			return false;
		}
		return true;
	},

	//
	db: null,
	content: null
});
