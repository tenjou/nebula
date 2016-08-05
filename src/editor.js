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

		this.connection.on("openProject", this.openProject, this);
		this.connection.on("installPlugins", this.onInstallPlugins, this);

		if(this.electron) {
			this.fs = editor.fileSystemLocal;
		}
		else {
			this.fs = editor.fileSystem;
		}
		this.fs.init();
	},

	handleFsReady: function()
	{
		this.connection.init();
	},

	handleServerReady: function() 
	{
		this.prepareUI();
		this.createPlugins();

		this.info.enable = false;
		this.plugins.login.show();
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

	installPlugins: function()
	{
		this.info.value = "Installing plugins";

		var plugins = this.dataPublic.get("plugins");
		var pluginData = {};
		var added = false;

		for(var key in this.plugins) 
		{
			var plugin = this.plugins[key];

			var pluginCfg = plugins.getItem(key);
			if(!pluginCfg) {
				pluginData[key] = {};
				added = true;
			}
		}

		if(!added) {
			this.onStart();
			return;
		}

		editor.connection.emit({
			type: "installPlugins",
			data: pluginData
		});
	},

	onInstallPlugins: function(serverData)
	{
		var data = this.dataPublic.get("plugins");

		var plugin;
		var pluginData = serverData.data;
		for(var key in pluginData) 
		{
			data.performSetKey(key, pluginData[key]);

			plugin = this.plugins[key];
			if(plugin.install) {
				plugin.install();
			}
		}

		this.onStart();
	},

	onStart: function()
	{
		var plugin;
		
		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onPrepare) {
				plugin.onPrepare();
			}
		}

		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onStart) {
				plugin.onStart();
			}
		}

		this.info.enable = false;

		setInterval(this.update.bind(this), 2000);
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
		this.loadPlugin("menubar");
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

	login: function() 
	{
		this.info.enable = false;
		this.plugins.login.hide();
		this.connection.load();

		this.onSplashStart();
	},

	loadProject: function(data)
	{
		this.onSplashEnd();

		this.info.value = "Loading project";
		this.info.enable = true;

		this.loadPlugin("layout");
		this.loadPlugin("browser");
		this.loadPlugin("inspect");
		this.loadPlugin("meta2d");

		this.connection.emit({
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

	},

	openProject: function(serverData)
	{
		this.connection.applyData(serverData.data);

		this.dataAssets = this.dataPublic.get("assets");
		this.project = serverData.value;
		this.projectPath = serverData.fullPath;
		this.fs.rootDir = serverData.path;

		document.title = serverData.value + " - " + this.config.titlePrefix;

		this.installPlugins();
	},

	writeFile: function(file, fileResult, callback)
	{
		var name = encodeURIComponent(file.name);
		var wildcardIndex = name.lastIndexOf(".");
		var idName = name.substr(0, wildcardIndex);
		var ext = name.substr(wildcardIndex + 1).toLowerCase();

		var type = this.plugins.resources.getTypeFromExt(ext) || "etc";

		if(this.offline)
		{
			var hash = this.connection.offline.generateHash();
			var filePath = hash + "." + ext;

			var map = this.dataAssets.get(type);
			if(!map) {
				map = this.dataAssets.performSetKey(type, {});
			}

			var info = {
				value: idName,
				ext: ext,
				type: type,
				path: filePath
			};

			if(this.electron)
			{
				this.fs.writeBase64(filePath, fileResult.target.result, function(path) {
					map.add(hash, info);
					if(callback) {
						callback(hash, type);
					}
				});
			}
			else
			{
				var blob = dataURItoBlob(fileResult.target.result, file.type);
				this.fs.writeBlob(filePath, blob, function(path) {
					map.add(hash, info);
					if(callback) {
						callback(hash, type);
					}
				});
			}
		}
		else 
		{

		}	
	},

	deleteFile: function(data)
	{
		data.remove();

		if(this.offline) 
		{
			var filePath = data.id + "." + data.raw.ext;
			this.fs.remove(filePath);
		}
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

	update: function() {
		this.emit("update", null);
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
	offline: false,
	electron: false,
	
	data: null,
	dataPublic: null,
	dataPrivate: null,
	dataAssets: null,

	eventBuffer: {},

	fileSystem: null,
	inputParser: null,
	resourceMgr: null,
	resources: null,

	project: null,
	projectPath: null,

	plugins: null,

	wrapperElement: null,
	overlayElement: null,
	top: null,
	inner: null,
	bottom: null
};