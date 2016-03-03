"use strict";

meta.class("Element.Wrapper", "Element.Basic", 
{
	onCreate: function() {
		document.body.oncontextmenu = this.handleContextMenu.bind(this);
	},

	handleContextMenu: function(event) {
		event.preventDefault();
	},

	//
	elementTag: "wrapper"
})