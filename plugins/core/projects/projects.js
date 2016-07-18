"use strict";

editor.plugin("projects",
{
	create: function()
	{
		wabi.addTemplate("projects", {
			type: "panel",
			header: "Projects",
			width: 300,
			value: [
				{
					type: "content",
					height: 400,
					value: {
						id: "projects-list",
						type: "list",
						bind: "*",
						placeholder: "No projects found",
					}
				},
				{
					id: "create",
					type: "button",
					value: "Create"
				},
				{
					id: "loader",
					type: "loader",
					hidden: false
				}
			]
		});

		// editor.plugins.contextmenu.add("projectItem", [
		// 	{
		// 		value: "Actions",
		// 		type: "category",
		// 		content: [
		// 			{
		// 				value: "Delete",
		// 				icon: "fa-trash",
		// 				func: this.deleteProject.bind(this)
		// 			}
		// 		]
		// 	}
		// ]);
	},

	onSplashStart: function()
	{
		this.template = wabi.createTemplate("projects");
		this.template.on("click", "#create", this.createProject, this);
		this.template.on("dblclick", "listItem", this.openProject, this);
		this.template.on("contextmenu", "listItem", function(event) {
			event.element.select = true;
			editor.plugins.contextmenu.show("projectItem", event.x, event.y);
		});

		editor.offline = true;

		this.data = editor.server.get("private.projects", this.handleData, this, true);
		this.template.data = this.data;

		this.template.appendTo(editor.overlayElement);
	},

	onSplashEnd: function() {
		wabi.destroyTemplate(this.template);
	},

	createProject: function(event) {
		this.data.add("Untitled");
	},

	openProject: function(event)
	{
		var data = this.template.get("#projects-list").select.data;
		editor.loadProject(data);
	},

	deleteProject: function(event) {
		this.template.get("#projects-list").select.remove();
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
