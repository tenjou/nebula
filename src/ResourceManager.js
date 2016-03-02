"use strict";

meta.class("Editor.ResourceManager",
{
	getTypeFromExt: function(ext)
	{
		var extInfo = this.ext[ext];
		if(!extInfo) {
			console.warn("(Editor.ResourceManager.getTypeFromExt): Extension not defined: " + ext);
			return null;
		}

		var typeInfo = this.types[extInfo];
		if(!typeInfo) {
			console.warn("(Editor.ResourceManager.getTypeFromExt): Type not defined for extension: " + ext);
			return null;
		}

		return extInfo;
	},

	getIconFromExt: function(ext)
	{
		var extInfo = this.ext[ext];
		if(!extInfo) {
			console.warn("(Editor.ResourceManager.getIconFromExt): Extension not defined: " + ext);
			return "fa-question";
		}

		var typeInfo = this.types[extInfo];
		if(!typeInfo) {
			console.warn("(Editor.ResourceManager.getIconFromExt): Type not defined for extension: " + ext);
			return "fa-question";
		}

		return typeInfo.icon ? typeInfo.icon : "fa-question";
    },

	//
	ext: {
		png: "image",
		jpg: "image",
		mp3: "sound",
		m4a: "sound",
		ogg: "sound",
		wav: "sound",
		txt: "text",
		json: "text"
	},

	types: {
		image: {
			icon: "fa-delicious"
		},
		sound: {
			icon: "fa-music"
		},
		text: {
			icon: "fa-file-text-o"
		}
	}
});