"use strict";

Editor.controller("AssetHierarchy", "AssetBrowser",
{
	onLoad: function()
	{
		this.list = this.content.get("Hierarchy.Browser");
		this.list.on("select", this.handleInspectItem.bind(this));
	}
});
