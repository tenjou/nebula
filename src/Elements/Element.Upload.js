"use strict";

meta.class("Element.Upload", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.onchange = this.handleChange.bind(this);

		this.domElement.setAttribute("type", "file");
		this.domElement.setAttribute("multiple", "");
		this.domElement.setAttribute("directory", "");
		this.addCls("hidden");
	},

	handleChange: function(domEvent) {
		this.emit("update", domEvent);
		this.domElement.value = "";
	},

	open: function() {
		this.domElement.click();
	},

	//
	elementTag: "input",
});
