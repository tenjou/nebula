"use strict";

meta.class("Element.ContextMenuItem", "Element.Basic",
{
	onCreate: function() 
	{
		this._icon = new Element.Icon(this);

		this._name = document.createElement("name");
		this.domElement.appendChild(this._name);

		this.domElement.onclick = this.handleClick.bind(this);	
	},

	loadSubmenu: function(items)
	{
		this.caret = true;
		this.menu = new Element.ContextMenu(this);
		this.menu.fill(items, this.id);
	},

	handleClick: function(domEvent) 
	{
		domEvent.stopPropagation();

		this.emit("click", domEvent);
	},

	set value(value) {
		this._name.innerHTML = value;
	},

	get value() {
		return this._name.innerHTML;
	},

	set icon(value) {
		this._icon.type = value;
	},

	set caret(value) 
	{
		if(value) 
		{
			if(!this._caret) {
				this._caret = new Element.Icon(this);
				this._caret.type = "fa-caret-right";
				this._caret.addCls("float-right");
			}
			else {
				this._caret.enable = true;
			}
		}
		else 
		{
			if(this._caret) {
				this._caret.enable = false;
			}
		}
	},

	get caret() {
		return (this._caret) ? true : false;
	},

	//
	elementTag: "item",
	_icon: null,
	_name: null,
	menu: null
});
