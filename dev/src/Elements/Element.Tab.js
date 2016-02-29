"use strict";

meta.class("Editor.Element.Tab", "Element.Basic",
{
	onCreate: function()
	{
		var inner = document.createElement("tab-inner");
		this.element.appendChild(inner);

		this._name = document.createElement("tab-content");
		inner.appendChild(this._name);

		var hidder = document.createElement("hidder");
		inner.appendChild(hidder);

		this.content = new Element.Content(this.parent.parent.parent.container);
		this.content.hidden = true;

		this.element.onclick = this._handleClick.bind(this);
	},

	_handleClick: function(event) {
		this.activate();
	},

	activate: function() 
	{
		this.element.setAttribute("class", "active");
		this.content.hidden = false;

		this.parent.parent.activeTab = this;
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