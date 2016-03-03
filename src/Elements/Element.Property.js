"use strict";

meta.class("Element.Property", "Element.Basic",
{
	addTag: function(name) 
	{
		var nameElement = document.createElement("span");
		nameElement.innerHTML = name;
		this.domElement.appendChild(nameElement);
	},

	addInput: function(data)
	{
		var input = document.createElement("input");
		input.setAttribute("type", "text");

		if(typeof(data) === "object") {
			input.value = data.value;
		}
		else {
			input.value = data;
		}

		this.domElement.appendChild(input);
	},	

	//
	elementTag: "prop"
});