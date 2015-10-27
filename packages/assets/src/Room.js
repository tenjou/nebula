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

	onResize: function() 
	{
		var style = this.element.style;
		style.width = editor.screenWidth + "px";
		style.height = editor.screenHeight + "px";
	},

	//
	name: "assets",
	holder: null
});
