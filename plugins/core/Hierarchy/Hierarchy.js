"use strict";

Editor.plugin("Hierarchy", 
{
	onStart: function()
	{
		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Hierarchy");
	}
});
