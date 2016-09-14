"use strict";

meta.on("load", function() 
{
	meta.camera.draggable = true;
	meta.renderer.bgColor = "0x333333";
});

meta.loader = 
{
	register: function(editor)
	{
		meta.resources.rootPath = editor.projectPath + "/";

		this.registerFuncs();

		var data = editor.dataPublic;
		var assets = data.get("assets");
		var assetsRaw = assets.raw;
		for(var key in assetsRaw) {
			this.registerItems(key, assets.get(key));
		}

		this.loadGrid();

		this.load(data.get("hierarchy"));
	},

	registerFuncs: function()
	{
		this.typeClasses = {
			texture: meta.Texture,
			sprite: meta.Sprite,
			view: meta.View,
		};
	},

	registerItems: function(type, data)
	{
		var cls = this.typeClasses[type];
		if(!cls) {
			console.warn("(meta.loader.registerItems) Type is unsupported: " + type);
			return;
		}

		data.watch(this.watchAssetType, this);

		var raw = data.raw;
		for(var key in raw)
		{
			var itemData = data.get(key);

			this.registerItem(itemData, cls);
		}
	},

	registerItem: function(data, cls)
	{
		var item = meta.new(cls, null, data.id);
		item.data = data;		
	},

	watchAssetType: function(action, key, value, index, data)
	{
		switch(action)
		{
			case "add":
			{
				var cls = this.typeClasses[value.raw.type];
				if(!cls) {
					console.warn("(meta.loader.watchAssetType) Type is unsupported: " + type);
					break;
				}

				this.registerItem(value, cls);
			} break;

			case "remove":
				meta.resources.remove(value.raw.type, value.id);
				break;
		}
	},

	load: function(data)
	{
		data.watch(this.watchHierarchyData, this);

		var raw = data.raw;
		for(var key in raw) 
		{
			var itemData = data.get(key);
			this.loadItem(itemData);
		}
	},

	loadItem: function(data)
	{
		var type = data.raw.type;

		var cls = this.typeClasses[type];
		if(!cls) {
			console.warn("(meta.loader.loadItem) Type is unsupported: " + type);
			return;
		}

		var item = meta.new(cls);
		item.data = data;
		
		switch(type)
		{
			case "sprite":
				meta.layer.add(item);
				break;

			case "view":
				break;
		}		
	},

	watchHierarchyData: function(action, key, value, index, data)
	{
		switch(action)
		{
			case "add":
				this.loadItem(value);
				break;

			case "remove":
			{
				var type = value.get("type");
				switch(type)
				{
					case "sprite":
						meta.layer.remove(value.id);
						break;
				}
			} break;
		}
	},

	loadGrid: function()
	{
		var gridCanvas = document.createElement("canvas");
		gridCanvas.width = 128;
		gridCanvas.height = 96;

		var gridCtx = gridCanvas.getContext("2d");

		gridCtx.beginPath();
		gridCtx.lineWidth = 2;
		gridCtx.strokeStyle = "#222";
		gridCtx.moveTo(0, -0);
		gridCtx.lineTo(0, 128);
		gridCtx.moveTo(0, 0);
		gridCtx.lineTo(128, 0);	
		gridCtx.stroke();

		var texture = meta.new(meta.Texture, gridCanvas);
		texture.anisotropy = false;

		var entity = meta.new(meta.Tiling, texture);
		entity.autoResize = true;
		entity.z = 10000;

		var gridLayer = meta.createLayer("grid");
		gridLayer.fixed = true;
		gridLayer.z = 10000000000;
		gridLayer.add(entity);
	},

	//
	typeClasses: null
};
