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
			[ 
				{ name: "Create", type: "category" },
				{ 
					name: "Sprite", icon: "fa-cube", 
					content: [
						{ name: "Textures", type: "category", icon: "fa-delicious" },
						"Tex1", "Tex2"
					] 
				}
			], event.x, event.y, this.handleMenuChoice.bind(this));
	},

	handleMenuChoice: function(buffer)
	{

	}
});
