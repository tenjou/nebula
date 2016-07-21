"use strict";

editor.connection.offline =
{
	init: function()
	{
		editor.fs.read("db.json", function(result) 
		{
			if(!result) 
			{
				editor.connection.offline.db = {
					projects: [],
					lastProjectId: 0,
					lastResourceId: 0
				};

				editor.fs.write("db.json", JSON.stringify(editor.connection.offline.db), function() {
					editor.handleServerReady();
				});
			}
			else 
			{
				editor.connection.offline.db = JSON.parse(result);
				editor.handleServerReady();
			}
		});		

		editor.on("update", this.handleUpdate, this);
	},

	emit: function(data)
	{
		switch(data.type)
		{
			case "data":
			{
				var editorData = editor.data.get(data.id);
				if(data.id.indexOf("private.projects") > -1) {
					this.processProjects(editorData, data);
				}
				else {
					editor.connection.handleServerData(data);
					this.saveData();
				}
			} break;

			case "openProject":
				this.openProject(data);
				break;

			case "installPlugins":
				this.installPlugins(data);
				break;
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
			type: "data",
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

		editor.connection.handleServerData(output);
	},

	createProject: function(editorData, data)
	{
		var projectData = {
			value: "Untitled",
			data: {
				plugins: {}
			}
		};

		var projectId = this.db.lastProjectId++;
		var projectPath = "projects/" + projectId;
		this.db.projects[projectId] = projectData;

		editor.fs.write("db.json", JSON.stringify(this.db));

		editor.fs.createDir(projectPath, function(dir) {
			editor.fs.write(projectPath + "/db.json", JSON.stringify(projectData.data), function(path) { console.log("created", path); });
		});
		
		editorData.performAddKey(projectId, projectData);
	},

	renameProject: function(editorData, data)
	{
		var project = this.db.projects[editorData.id];
		if(!project) {
			console.warn("(editor.connection.offline.renameProject) Project does not exist: " + editorData.id);
			return;
		}

		project.value = data.value;
		editor.fs.write("db.json", JSON.stringify(this.db));

		editorData.performSetKey("value", data.value);
	},

	removeProject: function()
	{
		console.log("todo");
	},

	openProject: function(data)
	{
		var projectId = data.value.id;
		var project = this.db.projects[projectId];
		if(!project) {
			console.warn("(editor.connection.offline.openProject) Project does not exist: " + projectId);
			return;
		}

		var projectPath = "projects/" + projectId;
		project.path = projectPath;

		editor.fs.checkDir(projectPath, function(path) 
		{
			if(!path) {
				console.warn("(editor.connection.offline.openProject) Project directory does not exist: " + projectPath);
				return;
			}

			editor.fs.read(projectPath + "/db.json", function(content) 
			{
				editor.connection.offline.project = project;

				if(!content) 
				{
					var db = {
						version: editor.version
					};

					editor.fs.write(projectPath + "/db.json", JSON.parse(project.db), function() {
						editor.openProject(db);
					});
				}
				else
				{
					var db = JSON.parse(content);

					editor.openProject({
						value: project.value,
						data: db,
						id: projectId,
						path: projectPath + "/",
						fullPath: "filesystem:" + editor.config.httpUrl + "/persistent/" + projectPath + "/"
					});
				}
			});
		});		
	},

	removeProjects: function()
	{
		editor.fs.remove("db.json");

		editor.fs.removeDir("projects", function(dir) {
			console.log("Offline projects removed");
		});
	},

	installPlugins: function(data)
	{
		editor.fs.write("db.json", JSON.stringify(editor.dataPublic), function() {
			editor.onInstallPlugins(data);
		});
	},

	saveData: function()
	{
		editor.fs.write("db.json", JSON.stringify(editor.dataPublic));
	},

	handleUpdate: function()
	{
		if(this.needSave) {
			this.needSave = false;
			this.fs.write("../../db.json", JSON.stringify(this.db));
		}
	},

	generateHash: function()
	{
		var id = this.db.lastResourceId++;
		this.needSave = true;
		return btoa(id);
	},

	//
	project: null,
	db: null,
	needSave: false
};
