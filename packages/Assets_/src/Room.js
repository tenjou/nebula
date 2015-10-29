"use strict";

module.class("Room", "Editor.Room", 
{
	onInit: function() {
		this.createHolder();
	},

	createHolder: function()
	{
		this.holder = new module.exports.Holder(module.data.files);
		this.element.appendChild(this.holder.element);
	},

	//
	name: "assets",
	holder: null
});
