"use strict";

Editor.plugin = function(clsName, obj) {
	meta.class("Editor.Plugin." + clsName, "Editor.Plugin", obj);
};

meta.class("Editor.Plugin", 
{
	install: null,

	uninstall: null,

	onSplashStart: null,

	onSplashEnd: null,

	onStart: null,

	onDbLoad: null
});