"use strict";

editor.server.offline =
{
	init: function()
	{
		editor.fs.read("db.json", function(result) 
		{
			if(!result) 
			{
				editor.server.offline.db = {
					projects: [],
					lastProjectId: 0
				};

				editor.fs.write("db.json", JSON.stringify(editor.server.offline.db), function() {
					editor.handleServerReady();
				});
			}
			else 
			{
				editor.server.offline.db = JSON.parse(result);
				editor.handleServerReady();
			}
		});		
	},

	emit: function(data)
	{
		var editorData = editor.data.get(data.id);
		if(data.id.indexOf("private.projects") > -1) {
			this.processProjects(editorData, data);
		}
	},

	processProjects: function(editorData, data)
	{
		switch(data.action)
		{
			case "get":
				this.readProjects();
				break;

			case "add": 
				this.createProject(editorData, data);
				break;

			case "set":
				this.renameProject(editorData, data);
				break;
		}
	},

	readProjects: function()
	{
		var self = this;

		editor.fs.checkDir("projects", function(dirExists) 
		{
			if(!dirExists) 
			{
				editor.fs.createDir("projects", function() {
					self.processDirs(self.db.projects);
				});
			}
			else {
				self.processDirs(self.db.projects);
			}
		});
	},

	processDirs: function(dirs)
	{
		var data = {};
		var output = {
			id: "private.projects",
			action: "set",
			value: data
		};

		for(var key in dirs)
		{
			var dir = dirs[key];
			data[key] = {
				value: dir.value
			};
		}

		editor.server.handleServerData(output);
	},

	createProject: function(editorData, data)
	{
		var projectData = {
			value: "Untitled"
		};
		var projectId = this.db.lastProjectId++;
		var projectPath = "projects/" + projectId;
		this.db.projects[projectId] = projectData;

		editor.fs.write("db.json", JSON.stringify(this.db));

		editor.fs.createDir(projectId, function() {
			editor.fs.write(projectPath + "/db.json", JSON.stringify("{}"));
		});
		
		editorData.performAddKey(projectId, projectData);
	},

	renameProject: function(editorData, data)
	{
		var project = this.db.projects[editorData.id];
		if(!project) {
			console.warn("(editor.server.offline.renameProject) Project does not exist: " + editorData.id);
			return;
		}

		project.value = data.value;
		editor.fs.write("db.json", JSON.stringify(this.db));

		editorData.performSetKey("value", data.value);
	},

	removeProjects: function()
	{
		editor.fs.remove("db.json");

		editor.fs.removeDir("projects", function(dir) {
			console.log("Offline projects removed");
		});
	},

	//
	db: null
};
