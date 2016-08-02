"use strict";

var texture;

meta.on("preload", function() 
{
	meta.camera.draggable = true;
	texture = meta.resources.loadTexture("cubetexture.png");
});

meta.loader = 
{
	register: function(data)
	{
		this.registerFuncs();

		var assets = data.get("assets");
		var assetsRaw = assets.raw;
		for(var key in assetsRaw) {
			this.registerItems(key, assets.get(key));
		}

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
		var item = meta.new(cls);
		item.data = data;
		meta.resources.add(data.raw.type, item);		
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
		item.texture = texture;
		
		switch(type)
		{
			case "sprite":
				meta.view.add(item);
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
						meta.view.remove(value.id);
						break;
				}
			} break;
		}
	},

	//
	typeClasses: null
};
