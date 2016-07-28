"use strict";

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
	},

	registerFuncs: function()
	{
		this.typeClasses = {
			texture: meta.Texture
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

	//
	typeClasses: null
};
