"use strict";

module.exports =
{
	install: function()
	{
		this.load();
	},

	uninstall: function()
	{

	},

	load: function() 
	{
		this.room = new this.Room();
		editor.registerRoom(this.room);

		this.loadAssets();
	},

	loadAssets: function()
	{
		console.log("load-assets");
	},

	//
	room: null
};
