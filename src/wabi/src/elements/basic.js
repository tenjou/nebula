"use strict";

wabi.element.basic = function(parent, params)
{
	if(this.create) {
		this.create(params);
	}
	
	if(!this.domElement) {
		this.domElement = document.createElement(this.tag ? this.tag : this._metadata.name);
	}

	this.domElement.holder = this;
	this._$ = new this._metadata.stateCls();

	if(parent) {
		this.parent = parent;
	}

	// Load events:
	var events = this._metadata.events;
	if(events)
	{
		for(var n = 0; n < events.length; n++) {
			this._addEvent(events[n]);
		}		
	}

	if(this.prepare) {
		this.prepare();
	}
};

wabi.element("basic", 
{
	create: null,

	prepare: null,

	initElement: function(elementSlotId)
	{
		var slotDef = this._metadata.elements[elementSlotId];
		if(!slotDef) {
			return console.warn("(wabi.element.basic.initElement) No such slot defined: " + elementSlotId);
		}

		if(!slotDef.type) {
			return console.warn("(wabi.element.basic.initElement) Element slot `" + elementSlotId + "` is not initializable because type is not defined");
		}

		var element = this.createElement(slotDef.type, elementSlotId);
		if(!element) {
			this.elements[elementSlotId] = null;
		}

		var watch = slotDef.watch;
		for(var key in watch) 
		{
			var funcName = watch[key];
			var func = this[funcName];
			if(!func) 
			{
				console.warn("(wabi.element.basic.initElement) Slot `" + elementSlotId + "` watching on `" + 
					key + "` uses undefined function: " + funcName);
				continue;
			}

			element.watch(key, func, this);
		}

		if(slotDef.state) {
			element.$ = slotDef.state;
		}

		var bind = this._metadata.elementsBinded[elementSlotId];
		if(bind) {
			element.bind = bind;
		}
	},

	deinitElement: function(elementSlotId)
	{
		if(!this.elements) {
			return console.warn("(wabi.element.basic.deinitElement) No elements created");
		}

		var element = this.elements[elementSlotId];
		if(element === undefined) {
			return console.warn("(wabi.element.basic.initElement) Such element does not exist: " + elementSlotId);
		}

		element.remove();
	},

	createElement: function(element, elementSlotId)
	{
		var prevElement = this.elements[elementSlotId];
		if(prevElement) {
			prevElement.remove();
		}
		else if(!this._metadata.elements[elementSlotId]) {
			console.warn("(wabi.element.basic.createElement) Invalid slot id: " + elementSlotId);
			return null;
		}

		if(typeof element === "string")
		{
			element = wabi.createElement(element, this);
			if(!element) { 
				return null; 
			}
		}
		else if(!(element instanceof wabi.element.basic)) {
			console.warn("(wabi.element.basic.createElement) Invalid element passed should be string or extend `wabi.element.basic`");
			return null;
		}

		element.flags |= (this.Flag.SLOT);
		element.slotId = elementSlotId;
		this.elements[elementSlotId] = element;

		var parentLink = this._metadata.elementsLinked[elementSlotId];
		if(parentLink) 
		{
			element._parentLink = parentLink;
			this._$[parentLink] = element;
		}

		return element;
	},

	element: function(id, element)
	{
		if(element === void(0)) 
		{
			if(!this.elements) { return null; }

			element = this.elements[id];
			return element ? element : null;
		}

		if(typeof element === "string") {
			element = wabi.createElement(element);
		}

		var element = this.createElement(element, id);
		if(!element) { return null; }

		var slotId = this._metadata.elements[id].slot;
		var elementBefore = this.domElement.childNodes[slotId];
		if(elementBefore) {
			this.appendBefore(element, elementBefore.holder);
		}
		else {
			element.appendTo(this);
		}

		return element;
	},	

	_setup: function()
	{
		// Create elements:
		var elements = this._metadata.elements;
		if(elements) 
		{
			if(!this.elements) {
				this.elements = {};
			}
			
			for(var key in elements) 
			{
				if(elements[key].type) {
					this.initElement(key);
				}
			}
		}

		// Process initial state:
		var states = this._metadata.states;
		for(var key in states) {
			this._processState(key, states[key]);
		}

		if(this.setup) {
			this.setup();
		}		
	},

	_setupElement: function(element)
	{
		if(!element) { return; }

		var elementsBinded = this._metadata.elementsBinded;
		if(elementsBinded[element.slotId]) {
			element._bind = elementsBinded[element.slotId];
		}
	},

	setup: null,

	append: function(element) {
		element.appendTo(this);
	},

	appendTo: function(parent)
	{
		if(!parent) {
			return console.warn("(wabi.element.basic.appendTo) Invalid parent passed");
		}

		if(this._parent) {
			return console.warn("(wabi.element.basic.appendTo) Element is already added to different parent");
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

		if(!parentHolder.children) {
			parentHolder.children = [ this ];
		}
		else {
			parentHolder.children.push(this);
		}

		this._parent = parentHolder;

		if(parentHolder._data && parentHolder.bind !== "*") 
		{
			if(!this.region) { 
				this.data = parentHolder._data;
			}
		}
		
		if(parentHolder.domElement && (this.flags & this.Flag.ENABLED)) {
			parentHolder.domElement.appendChild(this.domElement);
		}
	},

	appendBefore: function(element, elementBefore)
	{
		if(!this.children) {
			return console.error("(wabi.element.")
		}
		else {
			this.children.push(element);
		}

		if(this._data && this.bind !== "*") 
		{
			if(!element.region) { 
				element.data = this._data;
			}
		}

		element._parent = this;

		if(this.flags & this.Flag.ENABLED) {
			this.domElement.insertBefore(element.domElement, elementBefore.domElement);
		}
	},

	_remove: function()
	{
		this.removeAll();

		if(this.cleanup) {
			this.cleanup();
		}

		if(this._data) {
			this.data = null;
		}

		if(this.flags & this.Flag.ENABLED) 
		{
			if(this._parent) {
				this._parent.domElement.removeChild(this.domElement);
			}
		}

		if(this._parent) 
		{
			var parentChildren = this._parent.children;
			var index = parentChildren.indexOf(this);
			if(index > -1) {
				parentChildren[index] = parentChildren[parentChildren.length - 1];
				parentChildren.pop();
			}

			if(this._parentLink) {
				this._parent._$[this._parentLink] = null;
				this._parentLink = null;
			}
			
			if(this.slotId) {
				this._parent.elements[this.slotId] = null;
				this.slotId = null;
			}
			
			this._parent = null;
		}

		this.flags = 0;
		if(this._watching) { this._watching = null; }
		if(this._listeners) { this._listeners = null; }
	},

	removeAll: function()
	{
		if(this.children) 
		{
			for(var n = this.children.length - 1; n > -1; n--) {
				wabi.removeElement(this.children[n]);
			}
		}
	},

	remove: function(element)
	{
		if(!element) {
			wabi.removeElement(this);
		}
		else 
		{
			if(element._parent !== this) {
				return console.warn("(wabi.element.basic.remove) Element has different parent");
			}

			wabi.removeElement(element);
		}
	},

	attrib: function(key, value)
	{
		if(value === void(0)) {
			return this.domElement.getAttribute(key);
		}
		else {
			this.domElement.setAttribute(key, value);
		}
		
		return value;
	},

	removeAttrib: function(key) {
		this.domElement.removeAttribute(key);
	},

	style: function(key, value)
	{
		if(this.domElement.style[key] === void(0)) {
			console.warn("(wabi.element.basic.style) Invalid DOM style:", key);
			return null;
		}

		if(value === void(0)) {
			return this.domElement.style[key];
		}
		else {
			this.domElement.style[key] = value;
		}
		
		return value;
	},

	setCls: function(name, state) 
	{
		if(state) {
			this.domElement.classList.add(name);
		}
		else {
			this.domElement.classList.remove(name);
		}
	},

	get: function(id) 
	{
		if(id[0] === "#")
		{
			var domElement = this.domElement.querySelector(id);
			if(domElement) {
				return domElement.holder;
			}
		}
		else
		{
			if(typeof id === "function")
			{
				var tag = id.prototype.tag || id.prototype._metadata.name;

				var buffer = this.domElement.querySelectorAll(tag);
				var num = buffer.length;
				if(num > 0) 
				{
					var holderBuffer = new Array(num);
					for(var n = 0; n < num; n++) 
					{
						if(buffer[n].holder instanceof id) {
							holderBuffer[n] = buffer[n].holder;
						}
					}

					return holderBuffer;
				}
			}
			else
			{
				var buffer = this.domElement.querySelectorAll(id);
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
		}

		return null;
	},

	on: function(event, id, cb, owner)
	{
		if(id === undefined) {
			console.warn("(wabi.element.basic.on) Invalid callback passed to event: " + event);
			return;
		}

		if(typeof(id) === "function") {
			owner = cb;
			cb = id;
			id = null;
		}

		if(!cb) {
			console.warn("(wabi.element.basic.on) Invalid callback function: " + event);
			return;
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
				if(!this.childrenListeners) {
					this.childrenListeners = {};
				}

				if(id instanceof Array) 
				{
					for(var n = 0; n < id.length; n++) {
						this._onChildListen(event, id[n], cb, owner);
					}
				}
				else {
					this._onChildListen(event, id, cb, owner)
				}

				return;
			}	
		}
		else
		{
			element = this;	
		}

		listeners = element._listeners;
		if(!listeners) {
			listeners = {};
			element._listeners = listeners;
		}

		var buffer = listeners[event];
		if(!buffer) {
			buffer = [];
			listeners[event] = buffer;
			element._addEvent(event);
		}

		buffer.push(cb.bind(owner));			
	},

	emit: function(eventName, domEvent)
	{
		var event;

		if(this._listeners)
		{
			var buffer = this._listeners[eventName];
			if(buffer)
			{
				event = new wabi.event(eventName, this, domEvent);
				if(this._preventableEvents[eventName]) {
					domEvent.preventDefault();
				}

				for(var n = 0; n < buffer.length; n++) {
					buffer[n](event);
				}
			}
		}

		// if(this._parent) 
		// {
		// 	if(!event) 
		// 	{
		// 		event = new wabi.event(eventName, this, domEvent);
		// 		if(this._$preventableEvents[eventName]) {
		// 			domEvent.preventDefault();
		// 		}
		// 	}

		// 	this.checkParentListeners(eventName, event);
		// }
	},

	emitEx: function(event)
	{
		if(!this._listeners) { return; }

		var buffer = this._listeners[event.name];
		if(!buffer) { return; }

		for(var n = 0; n < buffer.length; n++) {
			buffer[n](event);
		}
	},

	checkParentListeners: function(eventName, event)
	{
		var buffer = this.childrenListeners[eventName];
		if(buffer)
		{
			for(var n = 0; n < buffer.length; n++) {
				buffer[n](event);
			}
		}

		if(this._parent) {
			this.checkParentListeners(eventName, event);
		}
	},

	_onChildListen: function(event, id, cb, owner)
	{
		var map = this.childrenListeners[id];
		if(!map) {
			map = {};
			this.childrenListeners[id] = map;
		}

		var buffer = map[event];
		if(!buffer) {
			buffer = [ cb.bind(owner) ];
			map[event] = buffer;
		}
		else {
			buffer.push(cb.bind(owner));
		}

		if(this.domElement["on" + event] === null) {
			this._addEvent(event);
		}
	},

	off: function(event, owner)
	{

	},

	set id(id) 
	{
		if(id) {
			this.domElement.id = id;
		}
		else {
			this.domElement.removeAttribute("id");
		}
	},

	get id() {
		return this._id;
	},

	set bind(bind)
	{
		if(bind)
		{
			var statesLinked = this._metadata.statesLinked;

			if(typeof(bind) === "string") 
			{
				var element = statesLinked.value;
				if(element !== undefined) {
					this.elements[element].bind = bind;
					bind = null;
				}
			}
			else 
			{
				for(var key in bind)
				{
					var element = statesLinked[key];
					if(element !== undefined) {
						this.elements[element].bind = bind[key];
						delete bind[key];
					}
				}
			}
		}

		this._bind = bind;
		this.updateBindings();
	},

	get bind() {
		return this._bind;
	},

	set hidden(value)
	{
		if(value) 
		{
			if(this.flags & this.Flag.HIDDEN) { return; }
			this.flags |= this.Flag.HIDDEN;

			this.domElement.classList.add("hidden");
		}
		else 
		{
			if((this.flags & this.Flag.HIDDEN) === 0) { return; }
			this.flags &= ~this.Flag.HIDDEN;

			this.domElement.classList.remove("hidden");
		}
	},

	get hidden() {
		return ((this.flags & this.Flag.HIDDEN) === this.Flag.HIDDEN);
	},

	set enabled(value)
	{
		if(value) 
		{
			if(this.flags & this.Flag.ENABLED) { return; }
			this.flags |= this.Flag.ENABLED;

			if(this._parent) {
				this._parent.domElement.appendChild(this.domElement);
			}
		}
		else 
		{
			if((this.flags & this.Flag.ENABLED) === 0) { return; }
			this.flags &= ~this.Flag.ENABLED;

			if(this._parent) {
				this._parent.domElement.removeChild(this.domElement);
			}
		}
	},

	get enabled() {
		return ((this.flags & this.Flag.ENABLED) === this.Flag.ENABLED);
	},

	set $(state)
	{
		if(typeof(state) === "object")
		{
			for(var key in state) {
				this.setState(key, state[key]);
			}
		}
		else {
			this.setState("value", state);
		}
	},

	get $() {
		return this._$;
	},

	set parent(parent)
	{	
		if(this._parent === parent) { return; }

		if(parent) {
			this.appendTo(parent);
		}
		else 
		{
			if(this._parent) {
				this._parent.remove(this);
			}
		}
	},

	get parent() {
		return this._parent;
	},

	set data(data)
	{
		if(data instanceof wabi.ref)
		{
			if(this._data === data.instance) { return; }

			if(this._data && this.flags & this.Flag.WATCHING) {
				this.flags &= ~this.Flag.WATCHING;
				this._data.unwatch(this.handleDataChange, this);
			}

			this._data = data.instance;
			this.ref = data;
		}
		else 
		{
			if(this._data === data) { return; }

			if(this._data && this.flags & this.Flag.WATCHING) {
				this.flags &= ~this.Flag.WATCHING;
				this._data.unwatch(this.handleDataChange, this);
			}

			this._data = data;
		}

		this.updateBindings();
		
		if(this.children)
		{
			for(var n = 0; n < this.children.length; n++) 
			{
				var child = this.children[n];
				if(child.region) { continue; }

				child.data = data;
			}
		}
	},

	get data() {
		return this._data;
	},

	html: function(value) 
	{
		if(value === undefined) {
			return this.domElement.innerHTML;
		}

		return this.domElement.innerHTML = value;
	},

	updateBindings: function()
	{
		if(this._data)
		{
			if(this._bind)
			{
				if((this.flags & this.Flag.WATCHING) === 0) {
					this.flags |= this.Flag.WATCHING;
					this._data.watch(this.handleDataChange, this);
				}
				
				if(typeof(this._bind) === "string") {
					this.updateDataValue("value", this._bind);
				}
				else
				{
					for(var key in this._bind) {
						this.updateDataValue(key, this._bind[key]);
					}
				}
			}
			else
			{
				if(this._data && this.flags & this.Flag.WATCHING) {
					this.flags &= ~this.Flag.WATCHING;
					this._data.unwatch(this.handleDataChange, this);
				}				
			}
		}
	},

	updateDataValue: function(key, bind)
	{
		var value = this._data.get(bind);
		if(value !== undefined) {
			this.setState(key, value);
		}
		else {
			this.setState(key, (this._$.value !== undefined) ? this._$.value : null);
		}		
	},

	_addEvent: function(eventName) 
	{
		var func = this["handle_" + eventName];

		if(eventName === "click") 
		{
			this.domElement.onclick = this._processClick.bind(this);
			if(func) {
				this._onClick = func.bind(this);
			}
		}
		else if(eventName === "dblclick") 
		{
			this.domElement.onclick = this._processClicking.bind(this);
			if(func) {
				this._onDblClick = func.bind(this);
			}
		}
		else 
		{
			var eventKey = "on" + eventName;

			if(this.domElement[eventKey] === null) 
			{
				var self = this;
				this.domElement[eventKey] = function(domEvent) {
					self._processEvent(eventName, func, domEvent);
				}
			}
		}
	},

	_onClick: null,

	_onDblClick: null,

	_processClick: function(domEvent)
	{
		var event = new wabi.event("click", this, domEvent);

		var element = domEvent.target.holder;
		if(element && element !== this) 
		{
			event.element = element;

			this._processChildEvent(element._metadata.name, event);
			this._processChildEvent("*", event);
			this.emitEx(event);
			return;
		}

		if(this._onClick) {
			this._onClick(event);
		}

		this.emitEx(event);
	},

	_processClicking: function(domEvent)
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

			this._processChildEvent(element._metadata.name, event);
			this._processChildEvent("*", event);
			return;
		}

		if(domEvent.detail % 2 === 0) 
		{
			if(this._onDblClick) {
				this._onDblClick(event);
			}

			this.emitEx(event);
		}
		else 
		{
			if(this._onClick) {
				this._onClick(event);
			}

			this.emitEx(event);
		}
	},

	_processEvent: function(eventName, func, domEvent)
	{
		var event = new wabi.event(eventName, this, domEvent);
		if(this._preventableEvents[eventName]) {
			domEvent.preventDefault();
			domEvent.stopPropagation();
		}		

		var element = domEvent.target.holder;
		if(element !== this) 
		{
			event.element = element;

			this._processChildEvent(element._metadata.name, event);
			this._processChildEvent("*", event);
			return;
		}

		if(func) {
			func.call(this, event);
		}
		
		this.emitEx(event);		
	},

	_processChildEvent: function(id, event)
	{
		if(!this.childrenListeners) { return; }

		var map = this.childrenListeners[id];
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
		var bind = this._bind;
		var type = typeof(bind);

		if(type === "string") 
		{
			if(key !== bind && bind !== "*") { return; }

			this._setActionState(action, "value", value, id);
		}
		else if(type === "object")
		{
			if(bind[key] === void(0)) { return; }

			this._setActionState(action, bind[key], value, id);
		}
	},

	_updateParentStateFunc: function(key, value)
	{
		if(this._parentLink && key === "value") {
			value = this._parent._updateParentStateFunc(this._parentLink, value);
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

	_updateState: function(key, value)
	{
		if(this._parentLink && key === "value") {
			value = this._parent._updateParentStateFunc(this._parentLink, value);
		}

		if(this._data && this._bind) 
		{
			if(typeof(this._bind) === "string")
			{
				if(key === "value") {
					this._data.set(this._bind, value);
				}
				else {
					this._setActionState("set", key, value);
				}
			}
			else
			{
				var dataBindName = this._bind[key];
				if(dataBindName) {
					data.set(dataBindName, value);
				}
				else {
					this._setActionState("set", dataBindName, value);
				}
			}
		}
		else 
		{
			this._setActionState("set", key, value);
		}
	},

	_setActionState: function(action, key, value, index)
	{
		if(this._$[key] === undefined) { return; }

		var func = this[action + "_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		if(this.watching)
		{
			var func = this.watching[key];
			if(func) {
				func.call(this._parent, value);
			}
		}

		this._$[key] = value;
	},

	setState: function(key, value)
	{
		var stateValue = this._$[key];
		if(stateValue === undefined) { return; }

		if(this._parentLink && key === "value") {
			value = this._parent.setStateParent(this._parentLink, value);
		}

		var func = this["set_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		if(stateValue instanceof wabi.element.basic) {
			stateValue.setState("value", value);
		}
		else 
		{
			if(this.watching)
			{
				var func = this.watching[key];
				if(func) 
				{
					var newValue = func.call(this._parent, value);
					if(newValue !== undefined) {
						value = newValue;
					}
				}
			}

			this._$[key] = value;
		}
	},

	setStateParent: function(key, value)
	{
		if(this._parentLink && key === "value") {
			value = this._parent.setStateParent(this._parentLink, value);
		}

		var func = this["set_" + key];
		if(func) {
			func.call(this, value);
		}
		
		return value;
	},

	_processState: function(key, value)
	{
		if(value === undefined) { return; }
		if(this._$[key] === value) { return; }

		var func = this["set_" + key];
		if(func) 
		{
			var newValue = func.call(this, value);
			if(newValue !== undefined) {
				value = newValue;
			}
		}

		var elementKey = this._metadata.statesLinked[key];
		if(elementKey) {
			return this.elements[elementKey]._processState("value", value);
		}
		else 
		{
			if(this.watching)
			{
				var func = this.watching[key];
				if(func) {
					func.call(this._parent, value);
				}
			}

			this._$[key] = value;
		}

		return value;
	},

	watch: function(name, func)
	{
		if(!this.watching) {
			this.watching = {};
		}

		this.watching[name] = func;
	},

	unwatch: function(name, func)
	{
		if(this.watching[name]) {
			this.watching[name] = null;
		}
	},

	toJSON: function() {
		return this._$;
	},

	Flag: {
		NONE: 0,
		ENABLED: 1 << 1,
		WATCHING: 1 << 2,
		ELEMENT: 1 << 3,
		SLOT: 1 << 4,
		HIDDEN: 1 << 5
	},

	//
	_metadata: null,
	elements: null,
	domElement: null,

	_id: "",
	_$: null,
	_parent: null,
	_data: null,
	_bind: null,
	ref: null,
	_parentLink: null,

	slotId: null,

	watchers: null,
	watching: null,

	flags: 0,
	tag: null,

	_listeners: null,
	children: null,
	childrenListeners: null,
	_preventableEvents: {
		"contextmenu": true
	},
	
	region: false
});

Element.prototype.holder = null;
