"use strict";

meta.class("Element.ListFolder", "Element.Basic",
{
	onCreate: function()
	{
		this._caret = new Element.Caret(this);
		this._caret.on("update", "*", this.handleCaretUpdate.bind(this));

		this._icon = new Element.Icon(this);
		this._icon.type = "fa-folder";

		this._name = new Element.Name(this);

		this.domElement.onclick = this.handleClick.bind(this);
	},

	handleCaretUpdate: function(event) {
		this.open = event.element.open;
	},

	handleClick: function(domEvent) {
		this.open = !this.open;
	},

	set name(name) {
		this._name.value = name;
	},

	get name() {
		return this._name.value;
	},

	set icon(type) 
	{
		if(!this._icon) {
			this._icon = new Element.Icon();
			this.insertBefore(this._icon, this._name);
		}

		this._icon.type = type;
	},

	get icon() 
	{
		if(!this._icon) {
			return null;
		}

		return this._icon.type;
	},	

	set open(value) 
	{
		if(this._open === value) { return; }

		this._open = value;
		this._caret.open = value;

		if(value) {
			this._icon.type = "fa-folder-open";
		}
		else {
			this._icon.type = "fa-folder";
		}
	},

	get open() {
		return this._open;
	},

	//
	elementTag: "folder",
	_caret: null,
	_name: null,
	_icon: null,

	_open: false
});
