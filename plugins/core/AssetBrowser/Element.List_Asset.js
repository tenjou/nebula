"use strict";

meta.class("Element.List_Asset", "Element.List",
{
	onCreate: function()
	{
		this.domElement.ondragover = this.handleDragOver.bind(this);

		this._super();	
	},

	handleDragOver: function(domEvent)
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();
		domEvent.dataTransfer.dropEffect = "copy";
	},

	sortFunc: function(a, b) 
	{
		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		return 0;
	},

	//
	db: null,
	path: ""
});
