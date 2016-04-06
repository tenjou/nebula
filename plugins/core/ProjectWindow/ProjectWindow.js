"use strict";

Editor.plugin("ProjectWindow",
{
	onCreate: function()
	{
		this.projects = {};
		
		editor.inputParser.types.projectList = function(parent, name, data) 
		{
			var list = new Element.List(parent, name);
			list.info = "No projects found";
			return list;
		};

		var projectContent = {
			Browser: {
				type: "container",
				content: {
					List: "@projectList"
				}
			}	
		};

		if(editor.electron) {
			projectContent.Open = "@button";
		}
		else {
			projectContent.Create = "@button";
		}

		editor.addContent("ProjectWindow", 
			{
				ctrl: "ProjectWindow",
				data: {
					Projects: {
						type: "containerNamed",
						content: projectContent
					}	
				}
			});		
	},

	onSplashStart: function() 
	{
		if(editor.electron) {
			this.loadProjects({});
		}
		else {
			editor.fileSystem.readDir("", this.loadProjects.bind(this));
		}
	},

	onSplashEnd: function() 
	{
		this.wnd.enable = false;
	},

	loadProjects: function(dirs)
	{
		if(!this.wnd) {
			this.wnd = new Element.Window(editor.overlay);
		}

		var dir;
		var num = dirs.length - 1;
		var projects = {};
		for(var n = num; n >= 0; n--) 
		{
			dir = dirs[n];
			projects[dir.name] = {};
		}	

		var content = editor.createContent("ProjectWindow");
		content.bindData(projects);
		this.wnd.content = content;
		this.wnd.enable = true;
	},

	//
	wnd: null
});
