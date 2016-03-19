"use strict";

Editor.plugin("ProjectWindow",
{
	onCreate: function()
	{
		this.projects = {};
		
		editor.inputParser.types.projectList = function(parent, name, data) 
		{
			var list = new Element.List(parent);
			list.info = "No projects found";
			return list;
		};

		editor.addContent("ProjectWindow", 
			{
				ctrl: "ProjectWindow",
				data: {
					Projects: {
						type: "containerNamed",
						content: {
							Browser: {
								type: "container",
								content: {
									List: "@projectList"
								}
							},
							Create: "@button"
						}
					}	
				}
			});		
	},

	onSplashStart: function() 
	{
		editor.fileSystem.readDir("", this.loadProjects.bind(this));
	},

	onSplashEnd: function() 
	{
		this.wnd.enable = false;
	},

	loadProjects: function(dirs)
	{
		if(!this.wnd) {
			this.wnd = new Element.ProjectWindow(editor.overlay);
		}
		else {
			this.wnd.enable = true;
		}

		var dir;
		var num = dirs.length - 1;
		for(var n = num; n >= 0; n--) 
		{
			dir = dirs[n];
			this.projects[dir.name] = {};
		}	

		if(this.wnd) {
			this.wnd.loadProjects();
		}
	},

	//
	projects: null,

	wnd: null
});
