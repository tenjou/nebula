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
		
		var assets = editor.plugins.AssetBrowser.db;
		var extBuffer, num, name;
		for(var ext in assets)
		{
			extBuffer = assets[ext];
			for(name in extBuffer) {
				buffer.push(extBuffer[name]);
			}
		}

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
	}
});
