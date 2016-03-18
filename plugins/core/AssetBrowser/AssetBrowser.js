"use strict";

Editor.plugin("AssetBrowser", 
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
			var list = new Element.List(parent, name);
			list.info = "No defs found";

			return list;
		};

		editor.addContent("AssetBrowser.Resources", 
			{
				ctrl: "AssetResources",
				data: {
					Resources: {
						type: "containerNamed",
						content: {
							Browser: {
								type: "resourceList"
							}
						}
					},
					upload: "@upload"
				}
			});

		editor.addContent("AssetBrowser.Defs", 
			{
				ctrl: "AssetDefs",
				data: {
					Defs: {
						type: "containerNamed",
						content: {
							Browser: {
								type: "defList"
							}
						}
					}
				}
			});		
	},

	onStart: function()
	{	
		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Project");

		this.contentResources = editor.createContent("AssetBrowser.Resources");
		tab.addContent(this.contentResources);

		this.contentDefs = editor.createContent("AssetBrowser.Defs");
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

		this.contentResources.bindData(this.db.resources);
		this.contentDefs.bindData(this.db.defs);	
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
