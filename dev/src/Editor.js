"use strict";

meta.class("Editor", 
{
	init: function()
	{
		this.inputParser = new Editor.InputParser();
	},

	loadLayout: function(layout)
	{
		this.layout = layout;

		this.wrapper = new Editor.Element.Wrapper();

		this.createTop();
		this.createInner();
		this.createBottom();
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

	//
	layout: "",
	
	inputParser: null,

	wrapper: null,
	top: null,
	inner: null,
	bottom: null
});
