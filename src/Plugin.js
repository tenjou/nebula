"use strict";

Editor.Plugin = function(clsName, obj) {
	meta.class("Editor.Plugin." + clsName, "Editor.PluginCore", obj);
};

meta.class("Editor.PluginCore", 
{
	install: null,

	uninstall: null,

	onSplashStart: null,

	onSplashEnd: null,

	onStart: null,

	onDbLoad: null
});