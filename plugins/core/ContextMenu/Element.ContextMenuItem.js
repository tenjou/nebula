"use strict";

meta.class("Element.ContextMenuItem", "Element.Basic",
{
	onCreate: function() 
	{
		this._icon = new Element.Icon(this);

		this.inner = document.createElement("inner");
		this.domElement.appendChild(this.inner);	

		this.domElement.onclick = this.handleClick.bind(this);	
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	set value(value) {
		this.inner.innerHTML = value;
	},

	get value() {
		return this.inner.innerHTML;
	},

	set icon(value) {
		this._icon.type = value;
	},

	//
	elementTag: "item",
	_icon: null,
	inner: null
});
