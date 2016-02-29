"use strict";

meta.class("Editor.Plugin.ProjectWindow", "Editor.Plugin",
{
	install: function()
	{
		this.projects = {};

		var inputParser = editor.inputParser;
		inputParser.types.projectList = function(parent, name, data) 
		{
			var browser = new Element.List(parent);
			browser.itemCls = Element.ListItem_Project;
			browser.info = "No projects found";
		};
	},

	onSplashStart: function()
	{
		var contentData = {
			Projects: {
				type: "containerNamed",
				content: {
					BrowserContainer: {
						type: "container",
						content: {
							Browser: "@projectList"
						}
					},
					Create: "@button"
				}
			}				
		};

		this.wnd = new Element.Window(editor.overlay);
		this.wnd.content.ctrl = this;
		editor.inputParser.parse(this.wnd.content, contentData);

		this.browser = this.wnd.query("content/container/container/list");

		editor.fileSystem.readDir("", this.handleReadDir.bind(this));
	},

	onSplashEnd: function() {
		this.wnd.active = false;
	},

	handleReadDir: function(dirs)
	{
		var dir;
		var num = dirs.length;
		for(var n = num - 1; n >= 0; n--) 
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
		else if(id === "content/container/container/list/item")
		{
			if(event === "click") {
				this.selectItem(element);			
			}
			else if(event === "dbClick") {
				this.openProject(element.name.value);
			}
		}
		else if(id === "content/container/container/list/item/name")
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

	selectItem: function(element)
	{
		if(element === this.selectedItem) { return; }
		
		element.select = true;

		if(!this.selectedItem) {
			this.selectedItem = element;
		}
		else {
			this.selectedItem.select = false;
			this.selectedItem = element;
		}			
	},

	createProject: function(name)
	{
		if(this.selectedItem) {
			this.selectedItem.select = false;
		}

		var name = this.getUniqueProjectName();
		var item = this.browser.createItem(name);
		item.focus();
		item.select = true;
		this.selectedItem = item;

		this.projects[name] = {};

		editor.fileSystem.createDir(name);
	},

	openProject: function(name)
	{
		if(!this.projects[name]) {
			console.error("(Plugin.ProjectWindow.openProject) No such project found: " + name);
			return;
		}

		editor.loadProject(name);
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
	wnd: null,
	browser: null,
	projects: null,
	selectedItem: null
});
