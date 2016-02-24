"use strict";

meta.class("Plugin.ProjectWindow", 
{
	init: function()
	{
		var contentData = {
			Container: {
				type: "container",
				content: {
					Projects: "@section"
				}
			}
		};

		var wnd = new Element.Window(editor.overlay);
		editor.inputParser.parse(wnd.content, contentData);
	}
});
