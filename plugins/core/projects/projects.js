"use strict";

editor.plugin("projects",
{
	create: function()
	{
		wabi.addTemplate("projects", {
			type: "panel",
			width: 300,
			$header: "Projects",
			$value: [
				{
					type: "content",
					height: 400,
					$value: {
						id: "projects-list",
						type: "list",
						bind: "*",
						itemCls: "editableListItem",
						placeholder: "No projects found",
					}
				},
				{
					id: "create",
					type: "button",
					$value: "Create"
				},
				{
					id: "loader",
					type: "loader",
					hidden: false
				}
			]
		});

		editor.plugins.contextmenu.add("projectItem", {
			Actions: {
				content: {
					Delete: {
						icon: "fa-trash",
						func: this.deleteProject.bind(this)
					}
				}
			}
		});
	},

	onSplashStart: function()
	{
		this.template = wabi.createTemplate("projects");
		this.template.on("click", "#create", this.createProject, this);
		this.template.on("dblclick", "*", this.openProject, this);
		this.template.on("contextmenu", "*", function(event) {
			event.element.select = true;
			editor.plugins.contextmenu.show("projectItem", event.x, event.y);
		});

		editor.offline = true;

		this.data = editor.connection.get("private.projects", this.handleData, this);
		this.template.data = this.data;
		this.template.appendTo(editor.overlayElement);
	},

	onSplashEnd: function() {
		this.template.remove();
	},

	createProject: function(event) {
		this.data.add("Untitled");
	},

	openProject: function(event)
	{
		var data = this.template.get("#projects-list").select.data;
		editor.loadProject(data);
	},

	deleteProject: function(event) 
	{
		var selectedItem = this.template.get("#projects-list").cache.selected;
		if(!selectedItem) { return; }
		
		this.data.remove(selectedItem.data);
	},

	handleData: function(action, key, value, data)
	{
		var loader = this.template.get("#loader");

		if(action === "sync") {
			loader.hidden = true;
		}
		else {
			loader.hidden = true;
		}
	},

	//
	template: null,
	data: null
});
