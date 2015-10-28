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
		this.room = new this.Room();
		editor.registerRoom(this.room);
	},

	uninstall: function()
	{

	},

	//
	room: null
};
