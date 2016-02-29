"use strict";

meta.class("Element.Basic",
{
	init: function(parent)
	{
		this.element = document.createElement(this.elementTag);
		this.element.holder = this;

		if(parent) {
			parent.append(this.element);
			this.parent = parent;
		}
		else {
			document.body.appendChild(this.element);
		}

		if(this.onCreate) {
			this.onCreate();
		}
	},

	onCreate: null,

	append: function(element) {
		this.element.appendChild(element);
	},

	emit: function(event) {
		this._emit("", event, this);
	},

	_emit: function(id, event, element) 
	{
		if(!id) {
			id = this.elementTag;
		}
		else {
			id = this.elementTag + "/" + id;
		}

		if(this.handleEvent) {
			this.handleEvent(id, event, element);
		}

		if(this.ctrl) 
		{
			if(this.ctrl.handleEvent) {
				this.ctrl.handleEvent(id, event, element);
			}
			else {
				throw "ElementEmitError: Controller does not own 'handleEvent' function";
			}
		}

		if(!this.parent) {
			return;
		}
		
		this.parent._emit(id, event, element);
	},

	query: function(str)
	{
		var buffer = str.split("/");
		var num = buffer.length - 1;

		var bufferStr = "";
		for(var n = 0; n < num; n++) {
			bufferStr += buffer[n] + " ";
		}
		bufferStr += buffer[n];

		var element = this.element.querySelector(bufferStr);
		if(!element) {
			return null;
		}

		return element.holder;
	},

	handleEvent: null,

	set active(value) 
	{
		if(value === this._active) { return; }

		this._active = value;

		if(value) {
			this.parent.element.appendChild(this.element);
		}
		else {
			this.parent.element.removeChild(this.element);
		}
	},

	get active() {
		return this._active;
	},

	set visible(value) 
	{
		if(value === this._visible) { return; }

		this._visible = value;

		if(value) {
			this.element.setAttribute("class", "");
		}
		else {
			this.element.setAttribute("class", "hidden");
		}
	},

	get visible() {
		return this._visible;
	},

	//
	parent: null,
	ctrl: null,

	element: null,
	elementTag: "div",

	_visible: true,
	_active: true
});

Element.prototype.holder = null;
