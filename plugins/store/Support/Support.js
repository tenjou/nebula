"use strict";

Editor.plugin("StoreSupport", 
{
	onLoad: function()
	{
		editor.resources.addType("mesh", 
			{
				ext: [ "obj" ],
				icon: "fa-cube"
			});
		editor.resources.addType("material", 
			{
				icon: "fa-diamond"
			});
		editor.resources.addType("video", 
			{
				ext: [ "m4a" ],
				icon: "fa-video-camera"
			});
		editor.resources.addType("cubemap",
			{
				icon: "fa-map-o"
			});

		editor.addContent("Store.Scene", 
			{
				ctrl: "Scene",
				data: {
					Scene: {
						type: "iframe",
						value: "plugins/store/Support/index/index.html"
					}
				}
			});	

		var pluginCtxMenu = editor.plugins.ContextMenu;
		var pluginAssetBrowser = editor.plugins.AssetBrowser;
		pluginAssetBrowser.menuDefs = pluginCtxMenu.mergeMenus(pluginAssetBrowser.menuDefs, [
				{
					name: "Create", 
					type: "category",
					content: [
						{ 
							name: "Mesh", 
							icon: "fa-cube" 
						}					
					]
				}
			]);
	},

	onStart: function()
	{
		var roomToolbar = editor.inner.roomToolbar;
		var tab = roomToolbar.createTab("Scene");

		this.content = editor.createContent("Store.Scene");
		this.content.bindData(this.db);
		tab.addContent(this.content);
	}
});