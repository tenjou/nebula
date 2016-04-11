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
			list.infoTxt = "No resources found";
			list.selectable = true;

			return list;
		};
		inputTypes.defList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.infoTxt = "No defs found";
			list.selectable = true;

			return list;
		};
		inputTypes.hierarchyList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.infoTxt = "Hierarchy is empty";
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
		this.contentHierarchy.on("keyup", this.handleKeyUp.bind(this));
		tab.addContent(this.contentHierarchy);

		this.contentResources = editor.createContent("AssetBrowser.Resources");
		this.contentResources.bindData(this.db.resources);
		this.contentResources.on("keyup", this.handleKeyUp.bind(this));
		tab.addContent(this.contentResources);

		this.contentDefs = editor.createContent("AssetBrowser.Defs");
		this.contentDefs.bindData(this.db.defs);
		this.contentDefs.on("keyup", this.handleKeyUp.bind(this));
		tab.addContent(this.contentDefs);
	},

	handleKeyUp: function(event)
	{
		if(event.domEvent.keyCode === 46) // DELETE
		{
			if(!this.selectedItem) { return; }

			this.selectedCtrl.removeItem(this.selectedItem.parent, this.selectedItem);
		}
	},

	//
	contentHierarchy: null,
	contentResources: null,
	contentDefs: null,

	selectedItem: null,
	selectedCtrl: null
});
