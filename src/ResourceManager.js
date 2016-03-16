"use strict";

meta.class("Editor.ResourceManager",
{
	getTypeFromExt: function(ext)
	{
		var typeInfo, exts, num;
		for(var typeName in this.types)
		{
			typeInfo = this.types[typeName];
			exts = typeInfo.ext;
			num = exts.length;
			for(var n = 0; n < num; n++) 
			{
				if(ext === exts[n]) {
					return typeName;
				}
			}
		}

		console.warn("(Editor.ResourceManager.getTypeFromExt): Extension not found: " + ext);
		return "unknown";
	},

	getIconFromExt: function(ext)
	{
		var typeInfo, exts, num;
		for(var typeName in this.types)
		{
			typeInfo = this.types[typeName];
			exts = typeInfo.ext;
			num = exts.length;
			for(var n = 0; n < num; n++) 
			{
				if(ext === exts[n]) {
					return typeInfo.icon ? typeInfo.icon : "fa-question";
				}
			}
		}

		console.warn("(Editor.ResourceManager.getIconFromExt): Extension not found: " + ext);

		return "fa-question";
    },

	//
	types: {
		texture: {
			ext: [ "png", "jpg", "bmp" ],
			icon: "fa-delicious"
		},
		sound: {
			ext: [ "mp3", "m4a", "ogg", "wav" ],
			icon: "fa-music"
		},
		text: {
			ext: [ "txt", "json" ],
			icon: "fa-file-text-o"
		},
		folder: {
			ext: [],
			icon: "fa-folder"
		},
		unknown: {
			ext: [],
			icon: "fa-question"
		},
		sprite: {
			icon: "fa-cube"
		}
	}
});