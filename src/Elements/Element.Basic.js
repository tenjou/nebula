"use strict";

meta.class("Element.Basic",
{
	init: function(parent, id)
	{
		this._init(parent, id);

		if(this.onCreate) {
			this.onCreate();
		}
	},

	_init: function(parent, id)
	{
		this.element = document.createElement(this.elementTag);
		this.element.holder = this;

		if(id) {
			this.id = id;
		}

		if(parent)
		{
			if(parent instanceof Element.Basic) {
				parent.append(this.element);
				this.parent = parent;
			}
			else if(parent instanceof Element) {
				parent.appendChild(this.element);	
			}
		}		
	},

	onCreate: null,

	append: function(element) 
	{
		if(element instanceof Element.Basic) {
			this.element.appendChild(element.element);
		}
		else {
			this.element.appendChild(element);
		}
	},

	remove: function(element)
	{
		if(element instanceof Element.Basic) {
			this.element.removeChild(element.element);
		}
		else {
			this.element.removeChild(element);
		}
	},

	emit: function(event) {
		this._emit("", event, this);
	},

	_emit: function(id, event, element) 
	{
		if(this.pickable && this.events) 
		{
			var eventBuffer;
			if(this.events[event]) {
				eventBuffer = this.events[event];
			}
			else if(this.events["*"]) {
				eventBuffer = this.events["*"];
			}

			if(eventBuffer)
			{
				if(eventBuffer[id]) {
					eventBuffer[id](element, id, event);
				}
				else if(eventBuffer["*"]) {
					eventBuffer["*"](element, id, event);
				}
			}
		}

		if(!this.parent) {
			return;
		}

		if(this.pickable)
		{
			if(!id) {
				id = this.id ? this.id : this.elementTag;
			}
			else {
				id = (this.id ? this.id : this.elementTag) + "." + id;
			}
		}
		
		this.parent._emit(id, event, element);
	},

	on: function(event, id, cb)
	{
		if(!this.events) {
			this.events = {};
		}

		var eventBuffer = this.events[event];
		if(!eventBuffer) {
			eventBuffer = {};
			this.events[event] = eventBuffer;
		}

		if(eventBuffer[id]) {
			console.warn("(Editor.Element.Basic.on) Overwriting callback '" + event + "' function for: ", id);
		}
		eventBuffer[id] = cb;
	},

	set enable(value) 
	{
		if(value === this._enabled) { return; }

		this._enabled = value;

		if(value) {
			this.parent.element.appendChild(this.element);
		}
		else {
			this.parent.element.removeChild(this.element);
		}
	},

	get enable() {
		return this._enabled;
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
	events: null,

	id: null,
	element: null,
	elementTag: "div",

	pickable: true,
	_visible: true,
	_enabled: true
});

Element.prototype.holder = null;
