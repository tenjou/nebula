"use strict";

meta.class("Plugin.ProjectWindow", 
{
	init: function()
	{
		var inputParser = editor.inputParser;
		inputParser.types.projectBrowser = function(parent, name, data) 
		{
			var browser = new Element.Browser(parent);
			browser.itemCls = Element.Browser_ProjectItem;
			browser.info = "No projects found";
		};

		var contentData = {
			Projects: {
				type: "containerNamed",
				content: {
					BrowserContainer: {
						type: "container",
						content: {
							Browser: "@projectBrowser"
						}
					},
					Create: "@button"
				}
			}				
		};

		var wnd = new Element.Window(editor.overlay);
		wnd.content.ctrl = this;
		editor.inputParser.parse(wnd.content, contentData);

		this.browser = wnd.query("content/container/container/browser");
	},

	handleEvent: function(id, event, element)
	{
		if(event === "click")
		{
			if(id === "content/container/button")
			{
				var item = this.browser.createItem("Untitled");
				item.focus();
			}
		}
	},

	//
	browser: null
});
