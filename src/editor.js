"use strict";

var editor = 
{
	prepare: function()
	{
		this.data = new wabi.data({
			public: {},
			private: {}
		});
		this.dataPublic = this.data.get("public");
		this.dataPrivate = this.data.get("private");
		wabi.globalData = this.dataPublic;

		if(window.process && window.process.versions["electron"]) {
			this.electron = true;
		}

		this.server.on("openProject", this.openProject, this);

		if(this.electron) {
			this.fs = editor.fileSystemLocal;
		}
		else {
			this.fs = editor.fileSystem;
		}
		this.fs.init();
	},

	handleFsReady: function(data, event)
	{
		this.prepareUI();
		this.createPlugins();

		this.loadProjectInfo();
	},

	onSplashStart: function()
	{
		var plugin;
		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onSplashStart) {
				plugin.onSplashStart();
			}
		}
	},

	onSplashEnd: function()
	{
		var plugin;
		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onSplashEnd) {
				plugin.onSplashEnd();
			}
		}
	},	

	onStart: function()
	{
		var plugin;
		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onStart) {
				plugin.onStart();
			}
		}
	},	

	prepareUI: function()
	{
		this.wrapperElement = wabi.createElement("wrapped", document.body, "wrapper");
		this.overlayElement = wabi.createElement("wrapped", document.body, "overlay");

		this.info = wabi.createElement("text", this.overlayElement);
		this.info.value = "Initializing";
	},	

	createPlugins: function()
	{
		this.plugins = {};

		this.loadPlugin("resources");
		this.loadPlugin("contextmenu");
		this.loadPlugin("login");
		// this.loadPlugin("menubar");
		this.loadPlugin("projects");
	},

	loadPlugin: function(name)
	{
		if(this.plugins[name]) {
			console.error("(editor.installPlugin) There is already installed plugin - '" + name + "'");
			return;
		}

		var pluginCls = this.plugin[name];
		if(!pluginCls) {
			console.error("(editor.installPlugin) No such plugin registered - '" + name + "'");
			return;
		}

		var plugin = new pluginCls();
		this.plugins[name] = plugin;
	},

	// installPlugins: function()
	// {
	// 	for(var key in Editor.Plugin) 
	// 	{
	// 		if(!this.db.plugins[key]) {
	// 			this.installPlugin(key);
	// 		}
	// 	}
	// },

	// installPlugin: function(name) 
	// {
	// 	if(this.db.plugins[name]) {
	// 		console.warn("(Editor.installPlugin) Plugin is already installed: " + name);
	// 		return;
	// 	}

	// 	var plugin = this.plugins[name];
	// 	if(!plugin) {
	// 		console.warn("(Editor.installPlugin) There is no such plugin available: " + name);
	// 	}

	// 	if(plugin.install) {
	// 		plugin.install(this.db);
	// 	}

	// 	this.db.plugins[name] = {};
	// },

	loadPlugins: function()
	{
		for(var key in this.plugins) {
			this.plugins[key].load(this.db);
		}
	},

	startPlugins: function()
	{
		for(var key in this.plugins) {
			this.plugins[key].start();
		}
	},

	loadProjectInfo: function()
	{
		if(this.electron) {
			this.handleLoadedProjectInfo({});
		}
		else {
			editor.fileSystem.readDir("", this.handleLoadedProjectInfo.bind(this));
		}
	},

	handleLoadedProjectInfo: function(dirs)
	{
		var num = dirs.length;
		var buffer = new Array(num);
		for(var n = 0; n < num; n++) {
			buffer[n] = dirs[n].name;
		}

		this.datasets.projects = new wabi.data({ projects: buffer });

		this.info.enable = false;
		this.plugins.login.show();
	},		

	login: function() {
		this.plugins.login.hide();
		this.onSplashStart();
	},

	loadProject: function(data)
	{
		this.onSplashEnd();

		this.loadPlugin("layout");
		this.loadPlugin("browser");
		this.loadPlugin("inspect");
		this.loadPlugin("meta2d");

		this.info.value = "Loading project";
		this.info.enable = true;

		this.server.emit({
			type: "openProject",
			value: data
		});

		//this.server
		// if(this.electron) 
		// {
		// 	var index = name.lastIndexOf("\\");
		// 	this.projectName = name.slice(index + 1);

		// 	if(name[name.length - 1] !== "\\") {
		// 		name += "\\";
		// 	}
		// 	editor.fileSystem.rootDir = name;
		// 	editor.fileSystem.fullPath = name;
		// }
		// else
		// {
		// 	this.projectName = name;
		// 	this.fileSystem.rootDir = name + "/";
		// 	this.fileSystem.fullPath = "filesystem:http://" + window.location.hostname + "/persistent/" + editor.fileSystem.rootDir;			
		// }

		// this.fileSystem.read("db.json", this._handleReadDb.bind(this));	
		
		
		// this.onStart();

		// this.info.enable = true;
		// this.info.value = "Loading Project";
	},

	openProject: function(serverData)
	{
		this.server.applyData(serverData.data);

		this.project = serverData.value;
		this.projectPath = this.config.httpUrl + "/" + this.project.name + "/";

		this.info.state.enable = false;

		document.title = serverData.value.value + " - " + this.config.titlePrefix;

		this.onStart();
	},

	createProject: function(name)
	{
		//var name = this.getUniqueProjectName(name);

		editor.datasets.projects.add("projects", name);	
	},	

	_handleReadDb: function(data)
	{
		if(!data) {
			this.fileSystem.create("db.json", this._handleCreateDb.bind(this));
		}
		else {
			this._handleLoadDb(data);
		}
	},	

	_handleCreateDb: function()
	{
		this.db = {
			name: this.projectName,
			version: this.version,
			mode: "editor",
			plugins: {}
		};

		this.installPlugins();

		this.needSave = false;
		this.fileSystem.write("db.json", JSON.stringify(this.db), this._handleLoadDb.bind(this));
	},	

	_handleLoadDb: function(json)
	{
		this.db = JSON.parse(json);
		this.projectName = this.db.name;

		this.info.enable = false;

		//this.top = new Element.Top(this.wrapper);
		this.inner = new Element.Inner(this.wrapper);
		//this.bottom = new Element.Bottom(this.wrapper);

		this.installPlugins();
		this.loadPlugins();
		this.startPlugins();

		if(this.needSave) {
			this.saveCfg();
		}
	},

	saveCfg: function() 
	{
		this.fileSystem.write("db.json", JSON.stringify(this.db), this._handleSavedDb.bind(this));
		this.needSave = false;
	},	

	_handleSavedDb: function(json)
	{
		console.log("db-saved");
	},

	getContentInfo: function(name)
	{
		var buffer = name.split(".");
		return this.getContentInfoFromBuffer(buffer);
	},

	getContentProps: function(buffer)
	{
		var obj = this.contents;
		var num = buffer.length;
		for(var n = 0; n < num; n++)
		{
			obj = obj[buffer[n]];
			if(!obj) {
				return null;
			}
			
			obj = obj.content;
		}

		return obj.info;
	},

	registerDataset: function(name, buffer, type)
	{
		if(this.datasets[name]) {
			console.warn("(Editor.addDataset) There is already dataset with such name: " + name);
			return;
		}

		this.datasets[name] = {
			buffer: buffer,
			type: type ? type : "array"
		};
	},

	getDataset: function(name) 
	{
		if(!name) { return null; }

		var dataset = this.datasets[name];
		if(!dataset) {
			console.warn("Editor.getDataset) No such dataset registered: " + name);
			return null;
		}

		return dataset;
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	handleContextMenu: function(domEvent) {
		domEvent.preventDefault();
	},

	on: function(event, cb) 
	{
		var buffer = this.eventBuffer[event];
		if(!buffer) {
			this.eventBuffer[event] = [ cb ];
		}
		else {
			buffer.push(cb);
		}
	},

	off: function(event, cb)
	{
		var buffer = this.eventBuffer[event];
		if(buffer) {
			var index = buffer.indexOf(cb);
			buffer = buffer.splice(index, 1);
		}
	},

	emit: function(event, domEvent)
	{
		var buffer = this.eventBuffer[event];
		if(!buffer) { return; }

		for(var n = 0; n < buffer.length; n++) {
			buffer[n](domEvent);
		}
	},

	plugin: function(name, props) 
	{
		function plugin() {
			editor.plugin.basic.call(this);
		};

		plugin.prototype = Object.create(this.plugin.basic.prototype);
		plugin.prototype.constructor = plugin;
		plugin.prototype.$name = name;

		var proto = plugin.prototype;
		var fnTest = /\b_super\b/;

		// Copy properties:
		for(var key in props)
		{
			var p = Object.getOwnPropertyDescriptor(props, key);
			if(p.get || p.set) {
				Object.defineProperty(proto, key, p);
				continue;
			}

			if(typeof(props[key]) == "function"
				&& fnTest.test(props[key]))
			{
				proto[key] = (function(key, fn)
				{
					return function(a, b, c, d, e, f)
					{
						var tmp = this._super;
						this._super = extendProto[key];
						this._fn = fn;
						var ret = this._fn(a, b, c, d, e, f);

						this._super = tmp;

						return ret;
					};
				})(key, props[key]);
				continue;
			}

			proto[key] = props[key];
		}

		this.plugin[name] = plugin;
	},	

	//
	db: null,
	version: "0.1",
	offline: false,
	electron: false,
	
	data: null,
	dataPublic: null,
	dataPrivate: null,

	eventBuffer: {},

	fileSystem: null,
	inputParser: null,
	resourceMgr: null,
	resources: null,

	project: null,
	projectPath: null,

	plugins: null,
	ctrls: {},
	datasets: {},

	wrapperElement: null,
	overlayElement: null,
	top: null,
	inner: null,
	bottom: null
};