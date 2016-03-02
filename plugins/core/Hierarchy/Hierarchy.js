"use strict";

Editor.Plugin("Hierarchy", 
{
	onStart: function()
	{
		var leftToolbar = editor.inner.leftToolbar;
		var tab = leftToolbar.createTab("Hierarchy");
	}
});
