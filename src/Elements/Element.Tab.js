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

		this.element.onclick = this.handleClick.bind(this);
	},

	handleClick: function(event) {
		this.emit("click");
	},

	activate: function()
	{
		this._active = true;
		this.element.setAttribute("class", "active");

		if(this.content) {
			this.content.hidden = false;
		}
	},

	deactivate: function()
	{
		this._active = false;
		this.element.setAttribute("class", "");

		if(this.content) {
			this.content.hidden = true;
		}
	},

	set name(name) {
		this._name.innerHTML = name;
	},

	get name() {
		return this._name.innerHTML;
	},

	set active(value)
	{
		if(this._active === value) { return; }
		this._active = value;

		if(value) {
			this.activate();
			this.emit("active");
		}
		else {
			this.deactivate();
			this.emit("inactive");
		}
	},

	get active() {
		return this._active;
	},

	set content(content) 
	{
		if(this._content === content) { return; }

		if(this._content) {
			this.parentContainer.remove(this._content);
		}
		
		this._content = content;

		if(content) {
			this.parentContainer.append(content);
		}
	},

	get content() {
		return this._content;
	},
 
	//
	elementTag: "tab",

	parentContainer: null,

	_name: null,
	_content: null,

	_active: false
});