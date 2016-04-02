"use strict";

Editor.controller("Inspect.Texture",
{
	onBindData: function()
	{
		this.content.get("Image.Holder").value = editor.fileSystem.fullPath + this.data.get("_path") + this.data.get("name") + "." + this.data.get("_ext");
	}
});
