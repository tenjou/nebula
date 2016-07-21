"use strict";

wabi.elements.basic = function(parent, params)
{
	if(this.create) {
		this.create(params);
	}
	
	if(!this.$domElement) {
		this.$domElement = document.createElement(this.$tag ? this.$tag : this.$metadata.name);
	}

	this.$domElement.holder = this;

	this.$state = new this.$metadata.stateCls();

	// Load child elements:
	var elements = this.$metadata.elements;
	if(elements) 
	{
		this.$elements = {};

		for(var key in elements)
		{
			var element = wabi.createElement(elements[key], this);
			if(!element) { continue; }

			var parentLink = this.$metadata.elementsLinked[key];
			if(parentLink) {
				element.$parentLink = parentLink;
			}

			this.$state[parentLink] = element;
			this.$elements[key] = element;
		}
	}

	if(parent) {
		this.parent = parent;
	}

	// Load events:
	var events = this.$metadata.events;
	if(events)
	{
		for(var n = 0; n < events.length; n++) {
			this.$addEvent(events[n]);
		}		
	}

	if(this.prepare) {
		this.prepare();
	}

	this.$setup();
};

wabi.element("basic", 
{
	create: null,

	prepare: null,

	$setup: function()
	{
		// Process initial state:
		var states = this.$metadata.states;
		for(var key in states) 
		{
			var value = states[key];
			var newValue = this.$processState(key, value);
			if(value !== newValue) {
				this.$state[key] = newValue;
			}
		}

		if(this.setup) {
			this.setup();
		}		
	},

	setup: null,

	append: function(element)
	{

	},

	appendTo: function(parent)
	{
		if(!parent) {
			console.warn("(element.basic.appendTo) Invalid parent passed");
			return;
		}

		if(this.$parent) {
			console.warn("(element.basic.appendTo) Element is already added to different parent");
			return;
		}

		var parentHolder;
		if(parent instanceof Element) 
		{
			parentHolder = parent.holder;
			if(!parentHolder) {
				parentHolder = wabi.createElement("wrapped", null, parent);
				parent.holder = parentHolder;
			}
		}
		else {
			parentHolder = parent;
		}	

		if(!parentHolder.$children) {
			parentHolder.$children = [ this ];
		}
		else {
			parentHolder.$children.push(this);
		}

		this.$parent = parentHolder;

		if(parentHolder.$data && parentHolder.bind !== "*") {
			this.data = parentHolder.$data;
		}
		
		if(this.enable && parentHolder.$domElement) {
			this.$flags |= this.Flag.ENABLED;
			parentHolder.$domElement.appendChild(this.$domElement);
		}
	},

	$removeElement: function(element)
	{
		if(element.$parent !== this) {
			console.warn("(element.basic) Element has different parent");
			return;
		}

		if(element.$data) {
			element.data = null;
		}

		if(element.$flags & this.Flag.ENABLED) {
			element.$flags &= ~(this.Flag.ENABLED | this.Flag.ACTIVE);
			this.$domElement.removeChild(element.$domElement);
		}

		element.$parent = null;
		element.$listeners = null;
		element.$childrenListeners = null;
		element.$flags = 0;

		wabi.removeElement(element);
	},

	remove: function(element)
	{
		this.$removeElement(element);

		var index = this.$children.indexOf(element);
		if(index > -1) {
			this.$children[index] = this.$children[this.$children.length - 1];
			this.$children.pop();
		}
	},

	removeAll: function()
	{
		if(!this.$children) { return; }

		for(var n = 0; n < this.$children.length; n++) {
			this.$removeElement(this.$children[n]);
		}

		this.$children.length = 0;
	},

	attrib: function(key, value)
	{
		if(value === void(0)) {
			return this.$domElement.getAttribute(key);
		}
		else {
			this.$domElement.setAttribute(key, value);
		}
		
		return value;
	},

	style: function(key, value)
	{
		if(this.$domElement.style[key] === void(0)) {
			console.warn("(wabi.element.basic.style) Invalid DOM style:", key);
			return null;
		}

		if(value === void(0)) {
			return this.$domElement.style[key];
		}
		else {
			this.$domElement.style[key] = value;
		}
		
		return value;
	},

	setCls: function(name, state) 
	{
		if(state) {
			this.$domElement.classList.add(name);
		}
		else {
			this.$domElement.classList.remove(name);
		}
	},

	get: function(id) 
	{
		if(id[0] === "#")
		{
			var domElement = this.$domElement.querySelector(id);
			if(domElement) {
				return domElement.holder;
			}
		}
		else
		{
			var buffer = this.$domElement.querySelectorAll(id);
			var num = buffer.length;
			if(num > 0) 
			{
				var holderBuffer = new Array(num);
				for(var n = 0; n < num; n++) {
					holderBuffer[n] = buffer[n].holder;
				}

				return holderBuffer;
			}
		}

		return null;
	},

	on: function(event, id, cb, owner)
	{
		if(typeof(id) === "function") {
			owner = cb;
			cb = id;
			id = null;
		}

		var element, listeners;

		if(id)
		{
			if(typeof(id) === "string" && id[0] === "#")
			{
				element = this.get(id);
				if(!element) { return; }
			}
			else
			{
				if(!this.$childrenListeners) {
					this.$childrenListeners = {};
				}

				if(id instanceof Array) 
				{
					for(var n = 0; n < id.length; n++) {
						this.$onChildListen(event, id[n], cb, owner);
					}
				}
				else {
					this.$onChildListen(event, id, cb, owner)
				}

				return;
			}	
		}
		else
		{
			element = this;	
		}

		listeners = element.$listeners;
		if(!listeners) {
			listeners = {};
			element.$listeners = listeners;
		}

		var buffer = listeners[event];
		if(!buffer) {
			buffer = [];
			listeners[event] = buffer;
			element.$addEvent(event);
		}

		buffer.push(cb.bind(owner));			
	},

	emit: function(eventName)
	{
		if(!this.$listeners) { 
			return; 
		}

		var buffer = this.$listeners[eventName];
		if(!buffer) { return; }

		var event = new wabi.event(eventName, this, domEvent);

		for(var n = 0; n < buffer.length; n++) {
			buffer[n](event);
		}

		if(this.$parent) {
			this.$checkParentListeners(eventName, event);
		}
	},

	emitEx: function(event)
	{
		if(!this.$listeners) { return; }

		var buffer = this.$listeners[event.name];
		if(!buffer) { return; }

		for(var n = 0; n < buffer.length; n++) {
			buffer[n](event);
		}
	},

	checkParentListeners: function(eventName, event)
	{
		var buffer = this.$childrenListeners[eventName];
		if(buffer)
		{
			for(var n = 0; n < buffer.length; n++) {
				buffer[n](event);
			}
		}

		if(this.$parent) {
			this.$checkParentListeners(eventName, event);
		}
	},

	$onChildListen: function(event, id, cb, owner)
	{
		var map = this.$childrenListeners[id];
		if(!map) {
			map = {};
			this.$childrenListeners[id] = map;
		}

		var buffer = map[event];
		if(!buffer) {
			buffer = [ cb.bind(owner) ];
			map[event] = buffer;
		}
		else {
			buffer.push(cb.bind(owner));
		}

		if(this.$domElement["on" + event] === null) {
			this.$addEvent(event);
		}
	},

	off: function(event, owner)
	{

	},

	set_id: function(id) 
	{
		if(id) {
			this.$domElement.id = id;
		}
		else {
			this.$domElement.removeAttribute("id");
		}
	},

	set_bind: function(bind)
	{
		if(bind)
		{
			var statesLinked = this.$metadata.statesLinked;

			if(typeof(bind) === "string") 
			{
				var element = statesLinked.value;
				if(element !== undefined) {
					this.$elements[element].bind = bind;
					bind = null;
				}
			}
			else 
			{
				for(var key in bind)
				{
					var element = statesLinked[key];
					if(element !== undefined) {
						this.$elements[element].bind = bind[key];
						delete bind[key];
					}
				}
			}
		}
		
		this.$updateBindings(bind);

		return bind;
	},

	set_hidden: function(hidden)
	{
		if(hidden) {
			this.$domElement.classList.add("hidden");
		}
		else {
			this.$domElement.classList.remove("hidden");
		}
	},

	set_enable: function(enable)
	{
		if(!this.$parent) { return; }

		if(enable) 
		{
			if(this.$flags & this.Flag.ENABLED) { return; }
			this.$flags |= this.Flag.ENABLED;
			this.$parent.$domElement.appendChild(this.$domElement);
		}
		else 
		{
			if((this.$flags & this.Flag.ENABLED) === 0) { return; }
			this.$flags &= ~this.Flag.ENABLED;
			this.$parent.$domElement.removeChild(this.$domElement);
		}
	},

	set_value: function(value) {
		this.$domElement.innerHTML = value;
	},

	set state(state)
	{
		if(typeof(state) === "object")
		{
			for(var key in state) {
				this.$setState(key, state[key]);
			}
		}
		else {
			this.$setState("value", state);
		}
	},

	get state() {
		return this.$state;
	},

	set parent(parent)
	{	
		if(this.$parent === parent) { return; }

		if(parent) {
			this.appendTo(parent);
		}
		else 
		{
			if(this.$parent) {
				this.$parent.remove(this);
			}
		}
	},

	get parent() {
		return this.$parent;
	},

	set data(data)
	{
		if(this.$data && 
		   this.$data !== data && 
		   this.$flags & this.Flag.WATCHING) 
		{
			this.$flags &= ~this.Flag.WATCHING;
			this.$data.unwatch(this);
		}

		this.$data = data;
		this.$updateBindings(this.$state.bind);
		
		if(this.$children)
		{
			for(var n = 0; n < this.$children.length; n++) 
			{
				var child = this.$children[n];
				if(child.$flags & this.Flag.REGION) { continue; }

				child.data = data;
			}
		}
	},

	get data() {
		return this.$data;
	},

	$updateBindings: function(bind)
	{
		if(this.$data)
		{
			if(bind)
			{
				if((this.$flags & this.Flag.WATCHING) === 0) {
					this.$flags |= this.Flag.WATCHING;
					this.$data.watch(this.handleDataChange, this);
				}
				
				if(typeof(bind) === "string") {
					this.$updateDataValue("value", bind);
				}
				else
				{
					for(var key in bind) {
						this.$updateDataValue(key, bind[key]);
					}
				}
			}
			else
			{
				if(this.$data && this.$flags & this.Flag.WATCHING) {
					this.$flags &= ~this.Flag.WATCHING;
					this.$data.unwatch(this);
				}				
			}
		}
	},

	$updateDataValue: function(key, bind)
	{
		var value = this.$data.get(bind);
		if(value !== undefined) {
			this.$setState(key, value);
		}
		else {
			this.$setState(key, this.$state.value ? this.$state.value : null);
		}		
	},

	$addEvent: function(eventName) 
	{
		var func = this["handle_" + eventName];

		if(eventName === "click") 
		{
			this.$domElement.onclick = this.$processClick.bind(this);
			if(func) {
				this.$onClick = func.bind(this);
			}
		}
		else if(eventName === "dblclick") 
		{
			this.$domElement.onclick = this.$processClicking.bind(this);
			if(func) {
				this.$onDblClick = func.bind(this);
			}
		}
		else 
		{
			var eventKey = "on" + eventName;

			if(this.$domElement[eventKey] === null) 
			{
				var self = this;
				this.$domElement[eventKey] = function(domEvent) {
					self.$processEvent(eventName, func, domEvent);
				}
			}
		}
	},

	$onClick: null,

	$onDblClick: null,

	$processClick: function(domEvent)
	{
		var event = new wabi.event("click", this, domEvent);

		var element = domEvent.target.holder;
		if(element && element !== this) 
		{
			event.element = element;

			this.$processChildEvent(element.$metadata.name, event);
			this.$processChildEvent("*", event);
			this.emitEx(event);
			return;
		}

		if(this.$onClick) {
			this.$onClick(event);
		}

		this.emitEx(event);
	},

	$processClicking: function(domEvent)
	{
		var event;
		if(domEvent.detail % 2 === 0) {
			event = new wabi.event("dblclick", this, domEvent);
		}
		else {
			event = new wabi.event("click", this, domEvent);
		}

		var element = domEvent.target.holder;
		if(element !== this) 
		{
			event.element = element;

			this.$processChildEvent(element.$metadata.name, event);
			this.$processChildEvent("*", event);
			return;
		}

		if(domEvent.detail % 2 === 0) 
		{
			if(this.$onDblClick) {
				this.$onDblClick(event);
			}

			this.emitEx(event);
		}
		else 
		{
			if(this.$onClick) {
				this.$onClick(event);
			}

			this.emitEx(event);
		}
	},

	$processEvent: function(eventName, func, domEvent)
	{
		var event = new wabi.event(eventName, this, domEvent);

		var element = domEvent.target.holder;
		if(element !== this) 
		{
			event.element = element;

			this.$processChildEvent(element.$metadata.name, event);
			this.$processChildEvent("*", event);
			return;
		}

		if(func) {
			func.call(this, event);
		}
		
		this.emitEx(event);		
	},

	$processChildEvent: function(id, event)
	{
		if(!this.$childrenListeners) { return; }

		var map = this.$childrenListeners[id];
		if(!map) { return; }

		var buffer = map[event.name];
		if(buffer)
		{
			for(var n = 0; n < buffer.length; n++) {
				buffer[n](event);
			}

			return;
		}		
	},

	handleDataChange: function(action, key, value, id)
	{
		var bind = this.$state.bind;
		var type = typeof(bind);

		if(type === "string") 
		{
			if(key !== bind && bind !== "*") { return; }

			this.$setActionState(action, "value", value, id);
		}
		else if(type === "object")
		{
			if(bind[key] === void(0)) { return; }

			this.$setActionState(action, bind[key], value, id);
		}
	},

	$updateParentStateFunc: function(key, value)
	{
		if(this.$parentLink && key === "value") {
			value = this.$parent.$updateParentStateFunc(this.$parentLink, value);
		}

		var func = this["set_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		return value;
	},

	$updateState: function(key, value)
	{
		if(this.$parentLink && key === "value") {
			value = this.$parent.$updateParentStateFunc(this.$parentLink, value);
		}

		var bind = this.$state.bind;

		if(this.$data && bind) 
		{
			if(typeof(bind) === "string")
			{
				if(key === "value") {
					this.$data.set(bind, value);
				}
				else {
					this.$setActionState("set", name, value);
				}
			}
			else
			{
				var dataBindName = bind[name];
				if(dataBindName) {
					data.set(dataBindName, value);
				}
				else {
					this.$setActionState("set", dataBindName, value);
				}
			}
		}
		else 
		{
			this.$setActionState("set", key, value);
		}
	},

	$setActionState: function(action, key, value, index)
	{
		if(this.$state[key] === undefined) { return; }

		var func = this[action + "_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		this.$state[key] = value;
	},

	$setState: function(key, value)
	{
		var stateValue = this.$state[key];
		if(stateValue === undefined) { return; }

		var func = this["set_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		if(stateValue instanceof wabi.elements.basic) 
		{
			if(value instanceof Object && !(value instanceof Array)) {
				stateValue.state = value;
			}
			else {
				stateValue.$setState("value", value);
			}
		}
		else {
			this.$state[key] = value;
		}
	},

	$processState: function(key, value)
	{
		var func = this["set_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		var elementKey = this.$metadata.statesLinked[key];
		if(elementKey) {
			return this.$elements[elementKey].$processState("value", value);
		}

		return value;
	},

	toJSON: function() {
		return this.$state;
	},

	Flag: {
		NONE: 0,
		ACTIVE: 1 << 0,
		REGION: 1 << 1,
		ENABLED: 1 << 2,
		WATCHING: 1 << 3
	},

	//
	$metadata: null,
	$domElement: null,

	$state: null,
	$parent: null,
	$data: null,
	$parentLink: null,

	$flags: 0,
	$tag: null,

	$children: null,
	$childrenListeners: null,

	id: "",
	hidden: false,
	enable: true,
	value: null
});

Element.prototype.holder = null;
