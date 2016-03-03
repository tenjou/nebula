"use strict";

meta.class("Element.IFrame", "Element.Basic",
{
	onCreate: function() {
		this.domElement.onload = this.handleLoad.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
	},

	handleLoad: function(domEvent) 
	{
		var contentDocument = this.domElement.contentWindow.document;
		contentDocument.oncontextmenu = this.handleContextMenu.bind(this);
		contentDocument.onclick = this.handleClick.bind(this);
	},

	handleContextMenu: function(domEvent) 
	{
		domEvent.preventDefault();
		this.emit("menu", domEvent);
	},

	handleClick: function(domEvent) {
		console.log("click");
	},

	set value(value) {
		this.domElement.src = value;
	},

	get value() {
		return this.domElement.src;
	},

	//
	elementTag: "iframe"
});
