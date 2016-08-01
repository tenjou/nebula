"use strict";

var texture;

meta.on("preload", function() 
{
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
		};
	},

	registerItems: function(type, data)
	{
		var cls = this.typeClasses[type];
		if(!cls) {
			console.warn("(meta.loader.registerItems) Type is unsupported: " + type);
			return;
		}

		var resources = meta.resources;

		var raw = data.raw;
		for(var key in raw)
		{
			var itemData = data.get(key);

			var item = meta.new(cls);
			item.data = itemData;
			resources.add(type, item);
		}
	},

	load: function(data)
	{
		var raw = data.raw;
		for(var key in raw) 
		{
			var itemData = data.get(key);
			var type = itemData.raw.type;

			var cls = this.typeClasses[type];
			if(!cls) {
				console.warn("(meta.loader.load) Type is unsupported: " + type);
				return;
			}

			var item = meta.new(cls);
			item.data = itemData;
			item.texture = texture;
			meta.view.add(item);
		}
	},

	//
	typeClasses: null
};
