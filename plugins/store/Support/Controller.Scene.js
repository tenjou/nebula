"use strict";

Editor.controller("Scene",
{
	onLoad: function()
	{
		this.scene = this.content.get("Scene");
		this.scene.on("menu", this.showContextMenu.bind(this));
	},

	showContextMenu: function(event)
	{
		this.clickedX = event.domEvent.clientX;
		this.clickedY = event.domEvent.clientY;

		var buffer = [];
		
		this._collectTextures(buffer, editor.db.assets.resources);

		buffer.sort(this.sortFunc_byName);

		var menu = [
			{ 
				name: "Create", 
				type: "category", 
				content: [
					{ 
						name: "Mesh", 
						icon: "fa-cube",
						content: [
							{

								name: "Textures",
								type: "category",
								icon: "fa-delicious",
								content: buffer
							}
						]					
					},
					{
						name: "Cubemap", 
						icon: "fa-map-o"						
					}
				] 
			}
		];

		editor.plugins.ContextMenu.show(menu, event.x, event.y, this.handleMenuChoice.bind(this));
	},

	_collectTextures: function(buffer, data)
	{
		var item;
		for(var key in data)
		{
			item = data[key];
			if(item.type === "folder") {
				this._collectTextures(buffer, item.content);
			}
			else if(item.type === "texture") {
				buffer.push(item);
			}
		}
	},

	handleMenuChoice: function(buffer)
	{

	}
});
