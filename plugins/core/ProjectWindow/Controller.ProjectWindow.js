"use strict";

Editor.controller("ProjectWindow", 
{
	onLoad: function()
	{
		this.list = this.content.get("Projects.Browser.List");
		this.list.on("menu", "item", this.openMenu.bind(this));

		this.content.on("click", "Projects.Create", this.createProject.bind(this));
		this.content.on("dbClick", "Projects.Browser.list.item", this.openProject.bind(this));
		this.content.on("update", "Projects.Browser.list.item.name", this.renameProject.bind(this));		
	},

	onBindData: function()
	{
		for(var name in this.data) {
			this.list.createItem(name);
		}
	},

	openMenu: function(event)
	{
		var menu = [
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}
		];

		event.element.select = true;

		editor.plugins.ContextMenu.show(menu, event.x, event.y, this.handleContextMenu.bind(this));
	},

	handleContextMenu: function(buffer)
	{
		var category = buffer[0];
		var type = buffer[1];
		
		switch(category) 
		{
			case "Actions":
			{
				if(type === "Delete") {
					this.deleteProject(this.list.cache.selectedItem);
				}
			} break;
		}
	},

	createProject: function(event)
	{
		if(this.selectedItem) {
			this.selectedItem.select = false;
		}

		var name = this.getUniqueProjectName();
		var item = this.list.createItem(name);
		item.focus();
		item.select = true;

		this.data[name] = {};

		editor.fileSystem.createDir(name);
	},

	openProject: function(event)
	{
		var name = event.element.name;

		if(!this.data[name]) {
			console.error("(Element.ProjectWindow.openProject) No such project found: " + name);
			return;
		}

		editor.loadProject(name);
	},

	renameProject: function(event)
	{		
		var element = event.element;
		var newName = element.value;
		var prevName = element.prevValue;

		if(this.data[newName]) {
			element.revert();
		}
		else 
		{
			this.data[newName] = this.data[prevName];
			delete this.data[prevName];
			editor.fileSystem.moveToDir(prevName, newName);
		}		
	},

	deleteProject: function(item)
	{
		var name = item.name;

		editor.fileSystem.removeDir(name);

		this.list.removeItem(item);
	},

	getUniqueProjectName: function()
	{
		var key;
		var name = "Untitled";
		var index = 2;

		main_loop:
		for(;;)
		{
			for(key in this.data) 
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
	list: null
});
