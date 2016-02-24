"use strict";

meta.class("Editor", 
{
	init: function()
	{
		this.inputParser = new Editor.InputParser();
		this.resourceMgr = new Editor.ResourceManager();
	},

	loadLayout: function(layout)
	{
		this.layout = layout;

		this.wrapper = new Editor.Element.Wrapper();

		//this.createTop();
		this.createInner();
		//this.createBottom();
		this.createOverlay();

		//this.loadPlugins();
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

	createOverlay: function()
	{
		this.overlay = new Element.Overlay();
	},

	loadPlugins: function()
	{
		var plugin = new Plugin.ProjectWindow();
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
