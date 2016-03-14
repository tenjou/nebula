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
		this.domElement = document.createElement(this.elementTag);
		this.domElement.holder = this;

		if(id) {
			this.id = id;
		}

		if(parent)
		{
			if(parent instanceof Element.Basic) 
			{
				parent.append(this.domElement);
				this.parent = parent;
			}
			else if(parent instanceof Element) {
				parent.appendChild(this.domElement);
			}
		}		
	},

	onCreate: null,

	append: function(element) 
	{
		if(element instanceof Element.Basic) {
			this.domElement.appendChild(element.domElement);
			element.parent = this;
		}
		else {
			this.domElement.appendChild(element);
		}
	},

	remove: function(element)
	{
		if(element)
		{
			if(element instanceof Element.Basic) {
				this.domElement.removeChild(element.domElement);
				element.parent = null;
			}
			else {
				this.domElement.removeChild(element);
			}
		}
		else {
			this.parent.remove(this);
		}
	},

	insertBefore: function(element, insertBeforeElement) 
	{
		var insertDomElement;
		if(insertBeforeElement instanceof Element.Basic) {
			insertDomElement = insertBeforeElement.domElement;
		}
		else {
			insertDomElement = insertBeforeElement;
		}		

		if(element instanceof Element.Basic) {
			this.domElement.insertBefore(element.domElement, insertDomElement);
			element.parent = this;
		}
		else {
			this.domElement.insertBefore(element, insertDomElement);
		}
	},

	emit: function(eventName, domEvent) 
	{
		var event = new this.Event();
		event.element = this;
		event.name = eventName;
		event.id = "";

		if(domEvent) 
		{
			event.domEvent = domEvent;
			event.x = domEvent.clientX;
			event.y = domEvent.clientY;
			this.updateEventElementOffset(event);
		}

		this._emit(event);
	},

	_emit: function(event) 
	{
		if(this.pickable && this.events) 
		{
			var eventBuffer;
			if(this.events[event.name]) {
				eventBuffer = this.events[event.name];
			}
			else if(this.events["*"]) {
				eventBuffer = this.events["*"];
			}

			if(eventBuffer)
			{
				if(eventBuffer[event.id]) 
				{
					if(eventBuffer[event.id](event)) {
						return;
					}
				}
				
				if(eventBuffer["*"]) 
				{
					if(eventBuffer["*"](event)) {
						return;
					}
				}
			}
		}

		if(!this.parent) {
			return;
		}

		if(this.pickable)
		{
			if(!event.id) {
				event.id = this.id ? this.id : this.elementTag;
			}
			else {
				event.id = (this.id ? this.id : this.elementTag) + "." + event.id;
			}
		}
		
		this.parent._emit(event);
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

	updateEventElementOffset: function(event)
	{
		var offsetLeft = 0;
		var offsetTop = 0;

		var domElement = event.element.domElement;
		if(domElement.offsetParent)
		{
			do 
			{
				if(domElement.tagName === "IFRAME") {
					offsetLeft += domElement.offsetLeft;
					offsetTop += domElement.offsetTop;
				}

			} while(domElement = domElement.offsetParent);
		}

		if(event.element.domElement.tagName === "IFRAME") {
			var rect = event.element.domElement.getBoundingClientRect();
			event.x += rect.left;
			event.y += rect.top;
		}
	},

	addCls: function(name)
	{
		var classes = this.domElement.classList;
		if(!classes.contains(name)) {
			classes.add(name);
		}
	},

	removeCls: function(name) 
	{
		var classes = this.domElement.classList;
		if(classes.contains(name)) {
			classes.remove(name);
		}
	},

	set enable(value) 
	{
		if(value === this._enabled) { return; }

		this._enabled = value;

		if(value) {
			this.parent.domElement.appendChild(this.domElement);
		}
		else {
			this.parent.domElement.removeChild(this.domElement);
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
			this.removeCls("hidden");
		}
		else {
			this.addCls("hidden");
		}
	},

	get visible() {
		return this._visible;
	},

	Event: function() 
	{
		this.element = null;
		this.id = null;
		this.name = null;
		this.domEvent = null;
		this.x = 0;
		this.y = 0;
	},

	//
	parent: null,

	events: null,

	id: null,
	domElement: null,
	elementTag: "div",

	pickable: true,
	_visible: true,
	_enabled: true
});

Element.prototype.holder = null;
