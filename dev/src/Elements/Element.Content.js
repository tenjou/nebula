"use strict";

meta.class("Element.Content", "Editor.Element",
{
	createSection: function(name)
	{
		var section = new Editor.Element.Section(this);
		section.name = name;

		return section;
	},

	set hidden(value) 
	{
		if(value) {
			this.element.setAttribute("class", "hidden");
		}
		else {
			this.element.setAttribute("class", "");
		}
	},

	get hidden() 
	{
		var cls = this.element.getAttribute("class");
		if(cls === "hidden") {
			return true;
		}

		return false;
	},

	//
	elementTag: "content"
});