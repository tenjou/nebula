"use strict";

Editor.plugin("AssetBrowser", 
{
	onInstall: function(db)
	{
		db.assets = {
			resources: [],
			defs: [],
			hierarchy: []
		};
	},

	onLoad: function(db)
	{
		this.db = db.assets;

		var inputTypes = editor.inputParser.types;
		inputTypes.resourceList = function(parent, name, data) 
		{
			var list = new Element.List_Asset(parent, name);
			list.itemCls = Element.ListItem_Asset;
			list.info = "No resources found";
			list.selectable = true;

			return list;
		};
		inputTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.info = "No defs found";
			list.selectable = true;

			return list;
		};
		inputTypes.hierarchyList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.info = "Hierarchy is empty";
			list.selectable = true;

			return list;
		};		

		editor.addContent("AssetBrowser.Hierarchy", 
			{
				ctrl: "AssetHierarchy",
				data: {
					Hierarchy: {
						type: "containerNamed",
						content: {
							Browser: {
								type: "hierarchyList"
							}
						}
					}
				}
			});		

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

		this.contentHierarchy = editor.createContent("AssetBrowser.Hierarchy");
		this.contentHierarchy.bindData(this.db.hierarchy);
		tab.addContent(this.contentHierarchy);

		this.contentResources = editor.createContent("AssetBrowser.Resources");
		this.contentResources.bindData(this.db.resources);
		tab.addContent(this.contentResources);

		this.contentDefs = editor.createContent("AssetBrowser.Defs");
		this.contentDefs.bindData(this.db.defs);
		tab.addContent(this.contentDefs);
	},

	//
	contentHierarchy: null,
	contentResources: null,
	contentDefs: null,

	selectedItem: null
});
