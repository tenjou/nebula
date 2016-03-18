"use strict";

meta.class("Editor", 
{
	init: function()
	{		
		this.ctrls = {};

		this.inputParser = new Editor.InputParser();
		this.resourceMgr = new Editor.ResourceManager();

		this.contents = {};
		this.contentsCached = [];
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
		document.title = name + " - META Editor";

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
			console.warn("(Editor.addContent) There is already a content with such name: " + name);
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

				content.addCtrl(extendContentInfo.ctrl);
				meta.mergeAppend(contentData, extendContentInfo.data);
			}
		}

		content.addCtrl(contentInfo.ctrl);
		meta.mergeAppend(contentData, contentInfo.data);

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
