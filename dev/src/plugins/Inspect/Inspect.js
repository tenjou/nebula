"use strict";

meta.class("Editor.Plugin.Inspect", "Editor.Plugin",
{
	onStart: function()
	{
		var rightToolbar = editor.inner.rightToolbar;
		rightToolbar.createTab("Inspect");
	}
});
