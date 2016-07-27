"use strict";

meta.loader = 
{
	register: function(data)
	{
		this.registerFuncs();

		this.registerResources(data.get("resources"));
		this.registerDefs(data.get("defs"));
		this.registerHierarchy(data.get("hierarchy"));
	},

	registerFuncs: function()
	{
		this.typeClasses = {
			texture: meta.Texture
		};
	},

	registerResources: function(data)
	{
		var resources = meta.resources;

		var raw = data.raw;
		for(var key in raw)
		{
			var itemData = data.get(key);
			var type = itemData.get("type");
			var cls = this.typeClasses[type];
			if(!cls) {
				console.warn("(meta.loader.registerResources) Type is unsupported: " + type);
				continue;
			}

			var item = meta.new(cls);
			item.data = itemData;
			resources.add(type, item);
		}
	},

	registerDefs: function(data)
	{

	},

	registerHierarchy: function(data)
	{

	},	

	//
	data: null,
	typeClasses: null
};
