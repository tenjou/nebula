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
					projects: {},
					lastProjectId: 0
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

		editor.fs.createDir("projects");

		editor.on("update", this.handleUpdate, this);
	},

	emit: function(data)
	{
		switch(data.type)
		{
			case "data":
			{
				if(data.id.indexOf("private.projects") > -1) {
					this.processProjects(editor.data.get(data.id), data);
				}
				else 
				{
					if(data.key === "@") {
						data.key = this.generateHash();
					}
					
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

			case "remove":
				this.deleteProject(editorData, data);
				break;

			case "set":
				this.renameProject(editorData, data);
				break;
		}
	},

	readProjects: function()
	{
		var data = {};
		var output = {
			id: "private.projects",
			type: "data",
			action: "set",
			value: data
		};

		var projects = this.db.projects;
		for(var key in projects)
		{
			var project = projects[key];
			data[key] = {
				value: project.value
			};
		}

		editor.connection.handleServerData(output);
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

	createProjectData: function()
	{
		var data = {
			name: "Untitled",
			version: editor.config.version,
			plugins: {},
			assets: {},
			lastResourceId: 0
		};

		return data;
	},

	createProject: function(editorData, data)
	{
		var projectId = this.db.lastProjectId++;

		var projectData = this.createProjectData();
		var projectInfo = {
			value: projectData.name,
			path: "projects/" + projectId
		};

		this.db.projects[projectId] = projectInfo;

		editor.fs.write("db.json", JSON.stringify(this.db));

		editor.fs.createDir(projectInfo.path, function(dir) {
			editor.fs.write(projectInfo.path + "/db.json", JSON.stringify(projectData));
		});
		
		editorData.performAddKey(projectId, { value: projectData.name });
	},

	deleteProject: function(editorData, data)
	{
		var projectId = parseInt(data.key.id);
		if(isNaN(projectId)) {
			console.warn("(editor.connection.offline.deleteProject) Invalid project id: " + data.key.id);
			return;
		}

		var project = this.db.projects[projectId];
		if(!project) {
			console.warn("(editor.connection.offline.deleteProject) Project not found with id: " + projectId);
			return;
		}

		var self = this;
		editor.fs.removeDir(project.path, function(dir) {
			if(dir) 
			{
				delete self.db.projects[projectId];
				self.saveDb();

				editorData.performRemove(projectId);
			}
		});
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

		var self = this;
		this.readProjectDb(project.path, function(db) {
			db.name = data.value;
			editor.fs.write(project.path + "/db.json", JSON.stringify(db));
		});

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

		this.readProjectDb(projectPath, function(db) 
		{
			editor.connection.offline.project = project;
			editor.connection.offline.projectDb = db;
			editor.openProject({
				value: project.value,
				data: db,
				id: projectId,
				path: projectPath + "/",
				fullPath: "filesystem:" + editor.config.httpUrl + "/persistent/" + projectPath + "/"
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

	readProjectDb: function(projectPath, callback)
	{
		if(!callback) {
			console.warn("(editor.connection.offline.readProjectDb) Callback not specified for projectPath: " + projectPath);
			return;
		}

		editor.fs.checkDir(projectPath, function(path) 
		{
			if(!path) {
				console.warn("(editor.connection.offline.readProjectDb) Project directory does not exist: " + projectPath);
				return;
			}

			editor.fs.read(projectPath + "/db.json", function(content) 
			{
				if(!content) 
				{
					var db = editor.connection.offline.createProjectData();

					editor.fs.write(projectPath + "/db.json", JSON.parse(db), function() {
						callback(db);
					});
				}
				else
				{
					var db = JSON.parse(content);
					callback(db);
				}
			});
		});
	},

	saveData: function()
	{
		this.needSave = false;
		editor.fs.write("db.json", JSON.stringify(editor.dataPublic));
	},

	saveDb: function()
	{
		this.needSaveDb = false;
		editor.fs.write("db.json", JSON.stringify(this.db));		
	},

	handleUpdate: function()
	{
		if(this.needSaveDb) {
			this.saveDb();
		}
		if(this.needSave) {
			this.saveData();
		}
	},

	generateHash: function()
	{
		var id = editor.dataPublic.get("lastResourceId");
		editor.dataPublic.performSetKey("lastResourceId", id + 1);
		
		this.needSave = true;
		return btoa(id);
	},

	//
	project: null,
	projectDb: null,
	db: null,
	needSave: false,
	needSaveDb: false
};
