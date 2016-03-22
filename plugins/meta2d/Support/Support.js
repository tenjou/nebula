"use strict";

Editor.plugin("Support", 
{
	onInstall: function(db)
	{
		var info = {
			name: "master",
			type: "view",
			dateModified: Date.now(),
			content: []
		};

		db.assets.hierarchy.push(info);
	},

	onLoad: function(db)
	{
		this.db = db;

		editor.resources.addType("sprite", 
			{
				icon: "fa-cube"
			});

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
		this.content.bindData(this.db);
		tab.addContent(this.content);
	},

	//
	content: null
});
