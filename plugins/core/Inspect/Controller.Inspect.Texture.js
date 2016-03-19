"use strict";

Editor.controller("Inspect.Texture",
{
	onBindData: function()
	{
		this.content.get("Image.Holder").value = editor.fileSystem.fullPath + this.data.path + this.data.name + "." + this.data.ext;
	}
});
