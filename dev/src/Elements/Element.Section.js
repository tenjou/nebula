"use strict";

meta.class("Editor.Element.Section", "Editor.Element",
{
	onCreate: function()
	{
		this.props = {};

		this._name = document.createElement("h2");
		this.element.appendChild(this._name);
	},

	addProperty: function(name)
	{
		var property = document.createElement("control");

		var nameElement = document.createElement("span");
		nameElement.innerHTML = name;
		property.appendChild(nameElement);

		var input = document.createElement("input");
		input.setAttribute("type", "text");
		property.appendChild(input);

		this.element.appendChild(property);
	},

	set name(name) {
		this._name.innerHTML = name;
	},

	get name() {
		return this._name.innerHTML;
	},

	//
	elementTag: "section",
	props: null
});