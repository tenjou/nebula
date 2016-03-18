"use strict";

Editor.plugin("ProjectWindow",
{
	install: function()
	{
		this.projects = {};
		
		editor.inputParser.types.projectList = function(parent, name, data) 
		{
			var list = new Element.List(parent);
			list.info = "No projects found";
			return list;
		};

		editor.fileSystem.readDir("", this.loadProjects.bind(this));
	},

	onSplashStart: function() {
		this.wnd = new Element.ProjectWindow(editor.overlay);
		this.wnd.loadProjects();
	},

	onSplashEnd: function() {
		this.wnd.enable = false;
	},

	loadProjects: function(dirs)
	{
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
