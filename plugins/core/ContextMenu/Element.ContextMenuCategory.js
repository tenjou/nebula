"use strict";

meta.class("Element.ContextMenuCategory", "Element.Basic",
{
	onCreate: function() 
	{
		this._header = new Element.WrappedElement("header", this);
		this._header.pickable = false;

		this._icon = new Element.Icon(this._header);

		this._name = document.createElement("name");
		this._header.append(this._name);	

		//
		this.inner = new Element.WrappedElement("inner", this);
		this.inner.pickable = false;
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

	_header: null,
	_icon: null,
	_name: null,
	inner: null
});
