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
		this.wrapper = new Element.Wrapper();

		this.overlay = new Element.Overlay();		
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
		this.top = new Editor.Element.Top(this.wrapper);
	},

	createInner: function()
	{
		this.inner = new Editor.Element.Inner(this.wrapper);
	},

	createBottom: function()
	{
		this.bottom = new Editor.Element.Bottom(this.wrapper);
	},

	loadPlugins: function()
	{
		var plugin = new Plugin.ProjectWindow();
	},

	loadProject: function(name)
	{
		this.info.active = true;
		this.info.value = "Loading Project";

		//this.createTop();
		this.createInner();
		//this.createBottom();		
	},

	//
	layout: "",
	
	fileSystem: null,
	inputParser: null,
	resourceMgr: null,

	wrapper: null,
	top: null,
	inner: null,
	bottom: null,
	overlay: null
});
