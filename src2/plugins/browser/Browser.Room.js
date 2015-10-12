"use strict";

meta.class("Browser.Room", "Room", 
{
	onInit: function() 
	{
		this.holder = new Browser.Holder();
		this.element.appendChild(this.holder.element);
	},

	onLoad: function() {
		console.log("resource");
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
	name: "browser"
});
