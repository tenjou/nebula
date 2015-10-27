"use strict";

module.exports =
{
	createData: function()
	{
		var data = {
			files: []
		};

		return data;
	},

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
	},

	//
	room: null
};
