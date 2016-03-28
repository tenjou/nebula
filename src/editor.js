"use strict";

meta.class("Editor", 
{
	init: function()
	{		
		this.ctrls = {};

		this.inputParser = new Editor.InputParser();
		this.resourceMgr = new Editor.ResourceManager();
		this.resources = this.resourceMgr;

		this.contents = {};
		this.contentsCached = [];
	},

	prepare: function()
	{
		this.fileSystem = new Editor.FileSystem();
		this.fileSystem.onReady.add(this.handleFileSystemReady, this);
	},

	handleFileSystemReady: function(data, event)
	{
		this.prepareUI();
		this.createPlugins();

		this.info.enable = false;

		this.onSplashStart();
	},

	prepareUI: function()
	{
		this.wrapper = new Element.Wrapper(document.body);

		this.overlay = new Element.WrappedElement("overlay", document.body);		
		this.info = new Element.Info(this.overlay);
		this.info.value = "Initializing";
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

	createPlugins: function()
	{
		this.plugins = {};

		for(var key in Editor.Plugin) {
			this.createPlugin(key);
		}
	},

	createPlugin: function(name)
	{
		if(this.plugins[name]) {
			console.error("(Editor.createPlugin) There is already installed plugin '" + name + "'");
			return;
		}

		var plugin = new Editor.Plugin[name]();
		
		this.plugins[name] = plugin;
	},

	installPlugins: function()
	{
		for(var key in Editor.Plugin) 
		{
			if(!this.db.plugins[key]) {
				this.installPlugin(key);
			}
		}
	},

	installPlugin: function(name) 
	{
		if(this.db.plugins[name]) {
			console.warn("(Editor.installPlugin) Plugin is already installed: " + name);
			return;
		}

		var plugin = this.plugins[name];
		if(!plugin) {
			console.warn("(Editor.installPlugin) There is no such plugin available: " + name);
		}

		if(plugin.install) {
			plugin.install(this.db);
		}

		this.db.plugins[name] = {};
	},

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

	loadProject: function(name)
	{
		document.title = name + " - META Editor";

		this.onSplashEnd();

		this.info.enable = true;
		this.info.value = "Loading Project";

		this.projectName = name;
		this.fileSystem.rootDir = name + "/";
		this.fileSystem.fullPath = "filesystem:http://" + window.location.hostname + "/persistent/" + editor.fileSystem.rootDir;
		this.fileSystem.read("db.json", this._handleReadDb.bind(this));	
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

	// CONTENT:
	addContent: function(name, info)
	{
		var buffer = name.split(".");
		var contentInfo = editor.getContentInfoFromBuffer(buffer);
		if(contentInfo) {
			console.warn("(Editor.addContent) There is already a content with such name: " + name);
			return null;
		}

		info.__index = this.currContentIndex++;

		var item;
		var scope = this.contents;
		var num = buffer.length;
		for(var n = 0; n < num; n++) 
		{
			item = scope[buffer[n]];
			if(!item) 
			{
				item = {
					info: null,
					content: {}
				};
				scope[buffer[n]] = item;
			}
				
			scope = item.content;
		}

		scope.info = info;
	},

	createContent: function(name)
	{
		var contentInfo = this.getContentInfo(name);
		if(!contentInfo) {
			console.warn("(Editor.addContent) No content info found for: " + name);
			return null;			
		}

		var content = this.contentsCached[contentInfo.index];
		if(content) {
			return content;
		}

		content = new Element.Content();

		var contentData = {};
		var extendBuffer = contentInfo.extend;
		if(extendBuffer && extendBuffer.length > 0) 
		{
			var extendContentInfo;
			for(var n = 0; n < extendBuffer.length; n++) 
			{
				extendContentInfo = this.getContentInfo(extendBuffer[n]);
				if(!extendContentInfo) { continue; }

				if(extendContentInfo.ctrl) {
					content.addCtrl(extendContentInfo.ctrl);
				}
				
				meta.appendObject(contentData, extendContentInfo.data);
			}
		}

		if(contentInfo.ctrl) {
			content.addCtrl(contentInfo.ctrl);
		}
		
		meta.appendObject(contentData, contentInfo.data);

		content.data = contentData;

		return content;
	},

	getContentInfo: function(name)
	{
		var buffer = name.split(".");
		return this.getContentInfoFromBuffer(buffer);
	},

	getContentInfoFromBuffer: function(buffer)
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

	//
	db: null,
	version: "0.1",
	
	fileSystem: null,
	inputParser: null,
	resourceMgr: null,
	resources: null,

	plugins: null,
	ctrls: null,

	wrapper: null,
	top: null,
	inner: null,
	bottom: null,
	overlay: null,

	contentsCached: null,
	contents: null,
	currContentIndex: 0
});
