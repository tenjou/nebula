"use strict";

meta.class("Element.Content_Inspect_Image", "Element.Content",
{
	onCreate: function()
	{
		this.assetsPlugin = editor.plugins.AssetsBrowser;

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

		this.on("update", "*", this.updateName.bind(this));
	},

	fill: function(data)
	{
		this.get("General.Name").value = data.name;
		this.get("Image.Image").value = editor.fileSystem.fullPath + data.name + "." + data.ext;
	},

	updateName: function(element)
	{
		if(!this.assetsPlugin.renameSelectedItem(element.value)) {
			element.revert();
		}
	},

	//
	assetsPlugin: null
});
