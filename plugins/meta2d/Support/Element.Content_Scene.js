"use strict";

meta.class("Element.Content_Scene", "Element.Content",
{
	onCreate: function() 
	{
		this.domElement.onclick = this.handleClick.bind(this);
		this.on("menu", "iframe", this.showContextMenu.bind(this));
	},

	handleClick: function(domEvent) {

	},

	showContextMenu: function(event) 
	{
		editor.plugins.ContextMenu.show(
			{ Create: [ 
				{ icon: "fa-cube", name: "Sprite" },
				{ icon: "fa-font", name: "Text" },
				"Test"
			] }, event.x, event.y);
	},
});
