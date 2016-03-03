"use strict";

meta.class("Editor", 
{
	init: function()
	{		
		this.inputParser = new Editor.InputParser();
		this.resourceMgr = new Editor.ResourceManager();
	},

	prepare: function()
	{
		this.fileSystem = new Editor.FileSystem();
		this.fileSystem.onReady.add(this.handleFileSystemReady, this);
	},

	prepareUI: function()
	{
		this.wrapper = new Element.Wrapper(document.body);

		this.overlay = new Element.WrappedElement("overlay", document.body);		
		this.info = new Element.Info(this.overlay);
		this.info.value = "Initializing";

		this.loadPlugins();

		this.info.enable = false;
	},

	handleFileSystemReady: function(data, event)
	{
		this.prepareUI();
		this.onSplashStart();
	},

	loadPlugins: function()
	{
		this.plugins = {};

		for(var key in Editor.Plugin) {
			this.installPlugin(key);
		}
	},

	installPlugin: function(name)
	{
		if(this.plugins[name]) {
			console.error("(Editor.installPlugin) There is already installed plugin '" + name + "'");
			return;
		}

		var plugin = new Editor.Plugin[name]();

		if(plugin.install) {
			plugin.install();
		}
		
		this.plugins[name] = plugin;
	},

	loadProject: function(name)
	{
		this.onSplashEnd();

		this.info.enable = true;
		this.info.value = "Loading Project";

		this.projectName = name;
		this.fileSystem.rootDir = name + "/";
		this.fileSystem.fullPath = "filesystem:http://" + window.location.hostname + "/persistent/" + editor.fileSystem.rootDir;
		this.fileSystem.read("db.json", this._handleReadDb.bind(this));	
	},

	saveCfg: function() {
		this.fileSystem.write("db.json", JSON.stringify(this.db), this._handleSavedDb.bind(this));
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

	onDbLoad: function()
	{
		var plugin;
		for(var key in this.plugins) 
		{
			plugin = this.plugins[key];
			if(plugin.onDbLoad) {
				plugin.onDbLoad(this.db);
			}
		}
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
		var db = {
			name: this.projectName,
			version: this.version
		};
		this.fileSystem.write("db.json", JSON.stringify(db), this._handleLoadDb.bind(this));
	},

	_handleLoadDb: function(json)
	{
		this.db = JSON.parse(json);
		this.projectName = this.db.name;

		this.info.enable = false;

		//this.top = new Element.Top(this.wrapper);
		this.inner = new Element.Inner(this.wrapper);
		//this.bottom = new Element.Bottom(this.wrapper);

		this.onStart();
		this.onDbLoad();

		if(this.needSave) {
			this.saveDb();
		}
	},

	saveDb: function() {
		this.fileSystem.write("db.json", JSON.stringify(this.db), this._handleSavedDb.bind(this));
		this.needSave = false;
	},

	_handleSavedDb: function(json)
	{
		console.log("db-saved");
	},

	//
	db: null,
	version: "0.1",
	
	fileSystem: null,
	inputParser: null,
	resourceMgr: null,

	plugins: null,

	wrapper: null,
	top: null,
	inner: null,
	bottom: null,
	overlay: null
});
