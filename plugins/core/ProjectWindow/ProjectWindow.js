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
