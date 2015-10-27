"use strict";

meta.class("Editor.Module", 
{
	class: function(name, extend, obj) {
		meta.class("module.exports." + name, extend, obj);		
	},

	//
	info: null,
	data: null,
	loading: false,
	includesToLoad: 0
});
