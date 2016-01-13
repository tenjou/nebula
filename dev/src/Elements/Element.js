"use strict";

meta.class("Editor.Element",
{
	init: function(parent)
	{
		this.element = document.createElement(this.elementTag);

		if(parent) {
			parent.append(this.element);
			this.parent = parent;
		}
		else {
			document.body.appendChild(this.element);
		}

		if(this.onCreate) {
			this.onCreate();
		}
	},

	onCreate: null,

	append: function(element)
	{
		this.element.appendChild(element);
	},

	//
	parent: null,
	element: null,
	elementTag: "div"
});
