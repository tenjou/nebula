"use strict";

meta.class("Element.ContextMenuCategory", "Element.Basic",
{
	onCreate: function() 
	{
		this._icon = new Element.Icon(this);

		this._name = document.createElement("name");
		this.domElement.appendChild(this._name);	
	},

	set value(value) {
		this._name.innerHTML = value;
	},

	get value() {
		return this._name.innerHTML;
	},

	set icon(value) {
		this._icon.type = value;
	},

	//
	elementTag: "category",
	_icon: null,
	_name: null
});
