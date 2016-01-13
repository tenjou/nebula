"use strict";

meta.class("Editor.Element.Tab", "Editor.Element",
{
	onCreate: function()
	{
		this._name = document.createElement("span");
		this.element.appendChild(this._name);

		this.content = new Editor.Element.Content(this.parent.parent);
		this.content.hidden = true;

		var self = this;
		this.element.addEventListener("click", function() {
			self.activate();
		});
	},

	activate: function() 
	{
		this.element.setAttribute("class", "active");
		this.content.hidden = false;

		this.parent.activeTab = this;
	},

	deactivate: function()
	{
		this.element.setAttribute("class", "");
		this.content.hidden = true;
	},

	set name(name) {
		this._name.innerHTML = name;
	},

	get name() {
		return this._name.innerHTML;
	},
 
	//
	elementTag: "tab",

	_name: null,
	content: null
});