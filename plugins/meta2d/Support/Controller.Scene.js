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

	sortFunc_byName: function(a, b) {
		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		return 0;
	},	

	handleMenuChoice: function(buffer)
	{
		var category = buffer.shift();
		var item = buffer.shift();

		var func = this["$" + category + "_" + item];
		if(func) {
			func.call(this, buffer);
		}
	},

	$Create_Sprite: function(buffer)
	{
		var scope = this.scene.contentWindow;

		var entity = new scope.Entity.Geometry();
		entity.position(this.clickedX, this.clickedY);
		scope.meta.view.attach(entity);
	},

	//
	clickedX: 0,
	clickedY: 0
});
