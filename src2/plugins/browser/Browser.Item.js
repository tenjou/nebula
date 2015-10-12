"use strict";

meta.class("Browser.Item",
{
	init: function() 
	{
		var template = document.getElementById("template-browser-item");
		this.element = template.children[0].cloneNode(true);
		console.log(this.element)
	},

	set name(name) {
		this.element.querySelector("span.name").innerHTML = name;
	},

	set img(img) {
		this.element.querySelector("img").src = img;
	},

	//
	element: null
});