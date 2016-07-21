"use strict";

editor.plugin("resources",
{
	create: function()
	{
		this.types =
		{
			texture: {
				ext: [ "png", "jpg", "bmp", "gif" ],
				icon: "fa-delicious"
			},
			sound: {
				ext: [ "mp3", "m4a", "ogg", "wav" ],
				icon: "fa-music"
			},
			video: {
				ext: [ "m4v" ],
				icon: "fa-video-camera"
			},
			text: {
				ext: [ "txt", "json" ],
				icon: "fa-file-text-o"
			},
			folder: {
				ext: [],
				icon: "fa-folder",
				iconOpen: "fa-folder-open",
				content: true
			},
			unknown: {
				ext: [],
				icon: "fa-question"
			}
		};
	},

	addType: function(name, props)
	{
		var type = this.types[name];
		if(type)
		{
			// TODO: Add type safeties!
			console.warn("(plugin.resources.addType) There is already such type added " + type);
		}
		else {
			this.types[name] = props;
		}
	},

	getIconFromExt: function(ext)
	{
		if(!ext) {
			return "fa-question";
		}

		for(var typeName in this.types)
		{
			var type = this.types[typeName];
			var exts = type.ext;
			if(!exts) { continue; }

			for(var n = 0; n < exts.length; n++)
			{
				if(ext === exts[n]) {
					return type.icon ? type.icon : "fa-question";
				}
			}
		}

		return "fa-question";
	},

	getIconFromType: function(name)
	{
		if(!name) {
			return "fa-question";
		}

		var type = this.types[name];

		if(type && type.icon) {
			return type.icon;
		}

		return "fa-question";
	},

	getTypeFromExt: function(extName)
	{
		if(!extName) {
			return null;
		}

		for(var typeName in this.types)
		{
			var type = this.types[typeName];
			var exts = type.ext;
			if(!exts) { continue; }

			for(var n = 0; n < exts.length; n++)
			{
				if(extName === exts[n]) {
					return typeName;
				}
			}
		}

		return null;
	},

	//
	types: null
});
