"use strict";

meta.class("Element.List_Asset", "Element.List",
{
	onCreate: function()
	{
		this._super();
		this.domElement.ondragover = this.handleDragOver.bind(this);
	},

	handleDragOver: function(domEvent)
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();
		domEvent.dataTransfer.dropEffect = "copy";
	}
});
