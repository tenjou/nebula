"use strict";

meta.class("Element.Content_Inspect_Default", "Element.Content",
{
	onCreate: function()
	{
		this.assetsPlugin = editor.plugins.AssetBrowser;

		this.data = 
		{
			General: {
				type: "section",
				content: {
					Name: "@string",
				}
			},
			Image: {
				type: "section",
				content: {
					Image: "@image"
				}
			}
		};

		this.on("update", "General.Name", this.updateName.bind(this));
	},

	fill: function(data)
	{
		this.get("General.Name").value = data.name;
		this.get("Image.Image").value = editor.fileSystem.fullPath + data.name + "." + data.ext;
	},

	updateName: function(event)
	{
		if(!this.assetsPlugin.renameSelectedItem(event.element.value)) {
			element.revert();
		}
	},

	//
	assetsPlugin: null
});
