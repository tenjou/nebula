"use strict";

module.class("Room", "Editor.Room", 
{
	onInit: function() 
	{
		this.holder = new module.exports.Holder();
		this.element.appendChild(this.holder.element);
	},

	onLoad: function() 
	{


		this.holder.data = this.data;
	},

	onUnload: function() {

	},

	onResize: function() 
	{
		var style = this.element.style;
		style.width = editor.screenWidth + "px";
		style.height = editor.screenHeight + "px";
	},

	//
	name: "assets"
});
