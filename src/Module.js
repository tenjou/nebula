"use strict";

meta.class("Editor.Module", 
{
	class: function(name, extend, obj) {
		meta.class("module.exports." + name, extend, obj);		
	},

	//
	data: null,
	includesToLoad: 0
});
