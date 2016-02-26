"use strict";

meta.class("Editor", 
{
	init: function()
	{
		this.prepareUI();

		this.inputParser = new Editor.InputParser();
		this.resourceMgr = new Editor.ResourceManager();

		this.fileSystem = new Editor.FileSystem();
		this.fileSystem.onReady.add(this.handleFileSystemReady, this);
	},

	prepareUI: function()
	{
		this.wrapper = new Element.WrappedElement("wrapper");

		this.overlay = new Element.WrappedElement("overlay");		
		this.info = new Element.Info(this.overlay);
		this.info.value = "Initializing";
	},

	handleFileSystemReady: function(data, event)
	{
		this.loadLayout();
	},

	loadLayout: function()
	{
		this.info.active = false;

		this.loadPlugins();
	},

	createTop: function()
	{
		this.top = new Element.Top(this.wrapper);
	},

	createInner: function()
	{
		this.inner = new Element.Inner(this.wrapper);
	},

	createBottom: function()
	{
		this.bottom = new Element.Bottom(this.wrapper);
	},

	loadPlugins: function()
	{
		var plugin = new Plugin.ProjectWindow();
	},

	loadProject: function(name)
	{
		this.info.active = true;
		this.info.value = "Loading Project";

		this.projectName = name;
		this.fileSystem.rootDir = name + "/";
		this.fileSystem.read("db.json", this._handleReadDb.bind(this));	
	},

	saveCfg: function() {
		this.fileSystem.write("db.json", JSON.stringify(this.db), this._handleSavedDb.bind(this));
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

		this.info.active = false;

		//this.createTop();
		this.createInner();
		//this.createBottom();	
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

	wrapper: null,
	top: null,
	inner: null,
	bottom: null,
	overlay: null
});
