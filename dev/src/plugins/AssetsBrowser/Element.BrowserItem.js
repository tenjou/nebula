"use strict";

meta.class("Element.BrowserItem", "Editor.Element",
{
	onCreate: function()
	{
		this.element.onclick = this._handleOnClick;

		// var caret = new Element.Caret(this);

		this._icon = new Element.Icon(this);
		this._name = new Element.Name(this);
		this._tag = new Element.Tag(this);
	},

	_handleOnClick: function(event)
	{
		event.stopPropagation();

		var holder = event.currentTarget.holder;
		holder.emit("click");
	},

	handleEvent: function(id, event, element)
	{
		console.log(id, event)
	},

	// set caret(value) 
	// {
	// 	if(this._caret === value) { return; }
	// 	this._caret = value;
	// },

	// get caret() {
	// 	return this._caret;
	// },

	set active(value) 
	{
		if(this._active === value) { return; }
		this._active = value;

		if(value) {
			this.element.setAttribute("class", "active");
		}
		else {
			this.element.setAttribute("class", "");
		}
	},

	get active() {
		return this._active;
	},

	set name(name) {
		this._name.value = name;
	},

	get name() {
		return this._name;
	},

	set icon(type) {
		this._icon.type = type;
	},

	get icon() {
		return this._icon.type;
	},

	set tag(name) {
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},

	//
	elementTag: "item",
	_active: false,
	_caret: false,
	_icon: null,
	_name: null,
	_tag: null
});
