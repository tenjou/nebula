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

	onSplashStart: null,

	onSplashEnd: null
};
