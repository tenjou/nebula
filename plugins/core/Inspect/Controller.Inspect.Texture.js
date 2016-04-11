"use strict";

Editor.controller("Inspect.Texture",
{
	onBindData: function()
	{
		this.content.get("Image.Holder").value = editor.fileSystem.fullPath + this.data.get("id") + "." + this.data.get("_ext");
	}
});
