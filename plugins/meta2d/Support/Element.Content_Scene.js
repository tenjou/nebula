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
	},

	handleMenuChoice: function(buffer)
	{
		console.log(buffer);
	},

	sortFunc_byName: function(a, b) {
		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		return 0;
	}
});
