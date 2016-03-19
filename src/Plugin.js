"use strict";

Editor.plugin = function(clsName, obj) {
	meta.class("Editor.Plugin." + clsName, "Editor.Plugin", obj);
};

meta.class("Editor.Plugin", 
{
	init: function() 
	{
		if(this.onCreate) {
			this.onCreate();
		}
	},

	onCreate: null,

	install: function(db) 
	{
		if(this.onInstall) {
			this.onInstall(db);
		}

		editor.needSave = true;
	},

	onInstall: null,

	uninstall: function()
	{
		if(this.onUninstall) {
			this.onUninstall();
		}
	},

	onUninstall: null,

	onSplashStart: null,

	onSplashEnd: null,

	load: function(db) 
	{
		if(this.onLoad) {
			this.onLoad(db);
		}
	},

	onLoad: null,

	start: function()
	{
		if(this.onStart) {
			this.onStart();
		}
	},

	onStart: null,

	//
	db: null
});