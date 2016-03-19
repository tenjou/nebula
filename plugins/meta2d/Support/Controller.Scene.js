"use strict";

Editor.controller("Meta2D.Scene",
{
	onLoad: function()
	{
		this.scene = this.content.get("Scene");
		this.scene.on("load", this.handleIFrameLoad.bind(this));
		this.scene.on("menu", this.showContextMenu.bind(this));
	},

	handleIFrameLoad: function(event)
	{
		console.log("iframe-load");
	},

	showContextMenu: function(event)
	{
		var buffer = [];
		
		this._collectTextures(buffer, editor.db.assets.resources);

		buffer.sort(this.sortFunc_byName);

		var menu = [
			{ 
				name: "Create", 
				type: "category", 
				content: [
					{ 
						name: "Sprite", 
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
						name: "ParticleEmitter", 
						icon: "fa-certificate"						
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

	},

	sortFunc_byName: function(a, b) {
		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		return 0;
	}	
});
