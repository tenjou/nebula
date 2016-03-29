"use strict";

meta.class("Element.IFrame", "Element.Basic",
{
	onCreate: function() {
		this.domElement.onload = this.handleLoad.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
	},

	handleLoad: function(domEvent) 
	{
		this.contentWindow = this.domElement.contentWindow;
		this.contentWindow.addEventListener("click", this.handleClick.bind(this));

		var contentDocument = this.domElement.contentWindow.document;
		contentDocument.oncontextmenu = this.handleContextMenu.bind(this);

		this.emit("load");
	},

	handleClick: function(domEvent)
	{
		editor.emit("click", domEvent);
	},

	handleContextMenu: function(domEvent) 
	{
		domEvent.preventDefault();
		this.emit("menu", domEvent);
	},

	set value(value) {
		this.domElement.src = value;
	},

	get value() {
		return this.domElement.src;
	},

	//
	elementTag: "iframe",
	contentWindow: null
});
