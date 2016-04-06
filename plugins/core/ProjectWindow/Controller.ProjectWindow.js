"use strict";

Editor.controller("ProjectWindow", 
{
	onLoad: function()
	{
		editor.plugins.ContextMenu.add({
			name: "ProjectWindow",
			content: [
				{
					name: "Actions", 
					type: "category",
					content: [
						{
							name: "Delete", 
							icon: "fa-trash",
							func: this.menu_Delete.bind(this)
						}
					]
				}
			]
		});

		this.list = this.content.get("Projects.Browser.List");
		this.list.on("menu", "item", this.openMenu.bind(this));

		this.content.on("click", "Projects.Create", this.createProject.bind(this));
		this.content.on("click", "Projects.Open", this.chooseProject.bind(this));
		this.content.on("dbClick", "Projects.List.item", this.openProject.bind(this));
		this.content.on("update", "Projects.List.item.name", this.renameProject.bind(this));				
	},

	onBindData: function()
	{
		for(var name in this.data) {
			this.list.createItem(name);
		}
	},

	openMenu: function(event)
	{
		event.element.select = true;

		editor.plugins.ContextMenu.show("ProjectWindow", event.x, event.y);
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

	chooseProject: function(event)
	{
		var dialog = require("electron").remote.dialog;
		dialog.showOpenDialog({ properties: [ "openDirectory" ]}, 
			function(fileNames) 
			{
				if(fileNames && fileNames.length > 0)
				editor.loadProject(fileNames[0]);
			}); 
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
		delete this.data[item.name];
	},

	menu_Delete: function()
	{
		this.deleteProject(this.list.cache.menuItem);
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
