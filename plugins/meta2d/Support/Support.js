"use strict";

Editor.plugin("Support", 
{
	onInstall: function(db)
	{
		var info = {
			name: "master",
			type: "view",
			folder: true,
			dateModified: Date.now(),
			content: []
		};

		db.assets.hierarchy.push(info);
	},

	onLoad: function()
	{
		editor.resources.addType("view", 
			{
				icon: "fa-picture-o"
			});

		editor.addContent("Meta2D.Scene", 
			{
				ctrl: "Meta2D.Scene",
				data: {
					Scene: {
						type: "iframe",
						value: "plugins/meta2d/Support/index.html"
					}
				}
			});
	},

	onStart: function()
	{
		var roomToolbar = editor.inner.roomToolbar;
		var tab = roomToolbar.createTab("Scene");

		this.content = editor.createContent("Meta2D.Scene");
		tab.addContent(this.content);
	},

	//
	content: null
});
