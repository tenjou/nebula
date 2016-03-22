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
		this.hierarchy = editor.plugins.AssetBrowser.contentHierarchy;

		this.$ = this.scene.contentWindow;
		this.$.meta.camera.draggable = true;
		this.$.meta.loadCfg(this.data);

		this.loadResources(this.data.assets.resources);
	},

	loadResources: function(data)
	{
		var mgr = this.$.meta.resources;
		var fullPath = editor.fileSystem.fullPath;

		var item;
		var num = data.length;
		for(var n = 0; n < num; n++) 
		{
			item = data[n];
			switch(item.type)
			{
				case "texture":
					mgr.loadTexture(fullPath + item.path + item.name + "." + item.ext);
					break;
			}
		}
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
		var entity = new this.$.Entity.Geometry(buffer[1]);
		entity.position(this.clickedX, this.clickedY);
		this.$.meta.view.attach(entity);

		this.hierarchy.ctrls[0]._addItem(this.hierarchy.ctrls[0].list, {
			name: "stuff",
			type: "sprite",
			dateModified: Date.now()
		});
	},

	//
	hierarchy: null,

	$: null,

	clickedX: 0,
	clickedY: 0
});
