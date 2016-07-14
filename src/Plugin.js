"use strict";

editor.plugin.basic = function()
{
	if(this.create) {
		this.create();
	}
};

editor.plugin.basic.prototype =
{
	create: null,

	install: function()
	{

	},

	onSplashStart: null,

	onSplashEnd: null
};
