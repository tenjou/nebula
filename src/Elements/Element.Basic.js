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
		this.contentHolder = this.domElement;

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
			this.contentHolder.appendChild(element.domElement);
			element.parent = this;
		}
		else {
			this.contentHolder.appendChild(element);
		}

		if(!this.children) {
			this.children = [ element ];
		}
		else {
			this.children.push(element);
		}
	},

	remove: function(element)
	{
		if(element)
		{
			if(element instanceof Element.Basic) {
				this.contentHolder.removeChild(element.domElement);
				element.parent = null;
			}
			else {
				this.contentHolder.removeChild(element);
			}
		}
		else {
			this.parent.remove(this);
		}

		if(this.children) 
		{
			var index = this.children.indexOf(element);
			this.children[index] = this.children[this.children.length - 1];
			this.children.pop();
		}
	},

	removeAll: function()
	{
		if(!this.children) { return; }

		while(this.children.length > 0) {
			this.remove(this.children[0]);
		}

		this.children.length = 0;
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
			this.contentHolder.insertBefore(element.domElement, insertDomElement);
			element.parent = this;
		}
		else {
			this.contentHolder.insertBefore(element, insertDomElement);
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
			if(domEvent.clientX) 
			{
				event.x = domEvent.clientX;
				event.y = domEvent.clientY;
				this.updateEventElementOffset(event);
			}
			else {
				event.x = 0;
				event.y = 0;
			}
		}

		this._emit(event);
	},

	_emit: function(event) 
	{
		if(this.pickable && this.events) 
		{
			var eventBuffer, buffer;

			if(this.events[event.name]) {
				eventBuffer = this.events[event.name];
			}
			else if(this.events["*"]) {
				eventBuffer = this.events["*"];
			}

			if(eventBuffer)
			{
				var stop = false;

				buffer = eventBuffer[event.id];
				if(buffer) 
				{
					for(var n = 0; n < buffer.length; n++) 
					{
						if(buffer[n](event)) {
							stop = true;
						}
					}
				}
				
				buffer = eventBuffer["*"];
				if(buffer) 
				{
					for(var n = 0; n < buffer.length; n++) 
					{
						if(buffer[n](event)) {
							stop = true;
						}
					}
				}

				if(stop) {
					return;
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
		if(!cb && typeof(id) === "function") {
			cb = id;
			id = "*";
		}

		if(!this.events) {
			this.events = {};
		}

		var eventBuffer = this.events[event];
		if(!eventBuffer) {
			eventBuffer = {};
			this.events[event] = eventBuffer;
		}

		if(eventBuffer[id]) {
			eventBuffer[id].push(cb);
		}
		else {
			eventBuffer[id] = [ cb ];
		}
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

	set hidden(value) 
	{
		if(this._hidden === value) { return; }
		this._hidden = value;

		if(value) {
			this.domElement.setAttribute("class", "hidden");
		}
		else {
			this.domElement.setAttribute("class", "");
		}
	},

	get hidden() {
		return this._hidden;
	},	

	set default(value) {
		this._default = value;
	},

	get default() {
		return this._default;
	},	

	set: function(value) {
		this.prevValue = this.default;
		this._value = this.default;
		this.value = value;
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
	children: null,

	events: null,

	id: null,
	domElement: null,
	contentHolder: null,
	elementTag: "div",

	pickable: true,
	_hidden: false,
	_enabled: true,

	prevValue: null,
	_value: null,
	_default: null,
});

Element.prototype.holder = null;
