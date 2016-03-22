"use strict";

Editor.plugin("AssetBrowser", 
{
	onCreate: function()
	{
		// MENU RESOURCES
		this.menuResources = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder" 
					}
				]
			},
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Upload", 
						icon: "fa-upload"
					}
				]
			}];
		this.menuItemResources = [
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}];

		// MENU DEFS
		this.menuDefs = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder",
						type: "folder"
					}
				]
			}];
		this.menuItemDefs = [
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}];		
	},

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

			return list;
		};
		inputTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.info = "No defs found";

			return list;
		};
		inputTypes.hierarchyList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.info = "Hierarchy is empty";

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

	// menu defs:
	menuHierarchy: null,
	menuItemHierarchy: null,

	menuResources: null,
	menuItemResources: null,

	menuDefs: null,
	menuItemDefs: null
});
