"use strict";

meta.class("Plugin.ProjectWindow", 
{
	init: function()
	{
		this.projects = {};

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

		editor.fileSystem.readDir("", this.handleReadDir.bind(this));
	},

	handleReadDir: function(dirs)
	{
		var dir;
		var num = dirs.length;
		for(var n = 0; n < num; n++) 
		{
			dir = dirs[n];
			this.projects[dir.name] = {};
			this.browser.createItem(dir.name);
		}
	},

	handleEvent: function(id, event, element)
	{
		var sslf = this;

		if(id === "content/container/button")
		{
			if(event === "click") {	
				this.createProject();
			}
		}
		else if(id === "content/container/container/browser/item")
		{
			if(event === "click")
			{
				if(element === this.activeItem) { return; }
				
				element.active = true;

				if(!this.activeItem) {
					this.activeItem = element;
				}
				else {
					this.activeItem.active = false;
					this.activeItem = element;
				}				
			}
		}
		else if(id === "content/container/container/browser/item/name")
		{
			if(event === "update")
			{
				if(this.projects[element.value]) {
					element.revert();
				}
				else {
					this.projects[element.value] = this.projects[element.prevValue];
					delete this.projects[element.prevValue];
					editor.fileSystem.moveToDir(element.prevValue, element.value);
				}
			}
		}
	},

	createProject: function(name)
	{
		if(this.activeItem) {
			this.activeItem.active = false;
		}

		var name = this.getUniqueProjectName();
		var item = this.browser.createItem(name);
		item.focus();
		item.active = true;
		this.activeItem = item;

		this.projects[name] = {};

		editor.fileSystem.createDir(name);
	},

	getUniqueProjectName: function()
	{
		var key;
		var name = "Untitled";
		var index = 2;

		main_loop:
		for(;;)
		{
			for(key in this.projects) 
			{
				if(name === key) {
					name = "Untitled" + index;
					index++;
					continue main_loop;
				}
			}

			return name;
		}

		return null;
	},

	//
	browser: null,
	projects: null,
	activeItem: null
});
