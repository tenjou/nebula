"use strict";

var wabi = 
{
	addTemplate: function(id, extend, props)
	{
		if(!id) {
			console.warn("(wabi.addTemplate) Invalid template id passed");
			return false;
		}

		if(typeof(extend) === "object") {
			props = extend;
			extend = null;
		}

		if(!props.type) {
			console.warn("(wabi.addTemplate) Invalid template type passed");
			return false;
		}		

		if(this.templates[id]) {
			console.warn("(wabi.addTemplate) There is already added template with such id: " + props.id);
			return false;
		}

		this.templates[id] = props;

		return true;
	},

	createTemplate: function(id)
	{
		var props = this.templates[id];
		if(!props) {
			console.warn("(wabi.createTemplate) Template not found: " + id);
			return null;
		}

		var template = wabi.createElement(props.type);
		template.flags |= template.Flag.REGION;

		for(var key in props) 
		{
			if(key === "type") { continue; }
			
			template[key] = props[key];
		}

		return template;
	},

	addFragment: function(id, extend, props)
	{
		if(!id) {
			console.warn("(wabi.addFragment) Invalid fragment id passed");
			return false;
		}	

		if(this.fragments[id]) {
			console.warn("(wabi.addFragment) There is already added fragment with such id: " + id);
			return false;
		}

		if(!props) {
			props = extend;
			extend = null;
		}

		this.fragments[id] = new this.Fragment(id, extend, props);

		return true;
	},

	getFragment: function(id) 
	{
		var fragment = this.fragments[id];
		if(!fragment) {
			console.warn("(wabi.getTemplate) Could not find fragment with id: " + id);
			return null;
		}

		if(fragment.extend) 
		{
			var props = this.extendFragment([], fragment.extend);
			props = this.appendProps(props, fragment.props);
			return props;
		}

		return fragment.props;
	},

	extendFragment: function(props, extend)
	{
		for(var n = 0; n < extend.length; n++)
		{
			var fragment = this.fragments[extend[n]];
			if(!fragment) {
				console.warn("(wabi.extendFragment) Could not find fragment with id: " + fragment.id);
				continue;
			}
			else 
			{
				if(fragment.extend) {
					props = this.extendFragment(props, fragment.extend);
				}

				props = this.appendProps(props, fragment.props);
			}
		}

		return props;
	},

	appendProps: function(props, fragmentProps)
	{
		if(fragmentProps instanceof Array) {
			props = props.concat(fragmentProps);
		}
		else {
			props.push(fragmentProps);
		}
		
		return props;
	},

	createElement: function(name, parent, params)
	{
		var element;
		var buffer = this.elementsCached[name];
		if(buffer && buffer.length > 0) 
		{
			element = buffer.pop();
			if(element) 
			{
				element.flags = element.flagsInitial;

				if(parent) {
					element.parent = parent;
				}
			}
		}
		else 
		{
			var cls = this.element[name];
			if(!cls) {			
				console.warn("(editor.createElement) No such element found: " + name);
				return null;
			}

			element = new this.element[name](parent, params);
		}

		element._setup();

		return element;
	},

	removeElement: function(element)
	{
		if(!element || !(element instanceof wabi.element.basic)) {
			return console.warn("(wabi.removeElement) Invalid element passed");
		}

		element._remove();

		var buffer = this.elementsCached[element._metadata.name];
		if(!buffer) {
			buffer = [ element ];
			this.elementsCached[element._metadata.name] = buffer;
		}
		else {
			buffer.push(element);
		}
	},

	on: function(name, func, owner)
	{
		if(!func) {
			console.warn("(wabi.on) Invalid callback function passed");
			return;
		}

		var buffer = this.listeners[name];
		if(!buffer) 
		{
			var eventName = "on" + name;
			if(window[eventName] === void(0)) { 
				console.warn("(wabi.on) No such global event available: " + name);
				return;
			}

			buffer = [ new this.Watcher(owner, func) ];
			this.listeners[name] = buffer;

			window[eventName] = function(domEvent) 
			{
				var event = new wabi.event(name, null, domEvent);
				for(var n = 0; n < buffer.length; n++) {
					var watcher = buffer[n];
					watcher.func.call(watcher.owner, event);
				}
			}
		}
		else 
		{
			buffer.push(new this.Watcher(owner, func));
		}
	},

	off: function(name, func, owner)
	{
		if(!func) {
			return console.warn("(wabi.on) Invalid callback function passed");
		}

		var buffer = this.listeners[name];
		if(!buffer) {
			return console.warn("(wabi.off) No listeners found for event: " + name);
		}

		var num = buffer.length;
		for(var n = 0; n < num; n++)
		{
			var listener = buffer[n];
			if(listener.func === func && listener.owner === owner)
			{
				buffer[n] = buffer[num - 1];
				buffer.pop();
				break;
			}
		}
	},

	element: function(name, extend, props) 
	{
		if(props === undefined) {
			props = extend;
			extend = null;
		}

		if(this.elementDefs[name]) {
			console.warn("(wabi.element) There is already defined element with such name: " + name);
			return;
		}

		var elementDef = new this.ElementDef(props, extend);
		this.elementDefs[name] = elementDef;

		if(name === "basic") {
			this.compileBasicElement(props, extend);
		}
		else {
			this.compileElement(name, props, extend);
		}
	},	

	// TODO: Re-do how properties are registered.
	genPrototype: function(name, extend, props)
	{
		if(extend) 
		{
			var extendedDef = this.elementDefs[extend];
			if(!extendedDef) {
				console.warn("(wabi.genPrototype) Extended class not found: " + extend);
				return;
			}

			var newProps = {};
			this.assignObj(newProps, extendedDef.props);
			this.assignObj(newProps, props);
			props = newProps;
		}		

		var states = {};
		var statesLinked = {};
		var elementsLinked = {};
		var elementsBinded = {};
		var elements = {};
		var events = [];
		var proto = {};
		var numElements = 0;
		var valueLinked = false;

		if(props.elements) 
		{
			var elementsProps = props.elements;
			for(var elementKey in elementsProps)
			{
				var elementSlotId = elementKey;
				var item = elementsProps[elementSlotId];
				var state = {};
				var watch = {};
				var params = {};

				var link = null;
				var type = null;
				var bind = null;

				if(!item) {}
				else if(typeof item === "string") {
					type = item;
				}
				else
				{
					if(item.type) { type = item.type; }
					if(item.link) { link = item.link; }
					if(item.bind) { bind = item.bind; }

					var watchKeyword = "watch_";
					var watchKeywordLength = watchKeyword.length;

					for(var key in item)
					{
						if(key === "type" || key === "link" || key === "bind") { continue; }

						if(key[0] === "$") {
							state[key.slice(1)] = item[key];
						}
						else if(key.indexOf(watchKeyword) > -1) {
							watch[key.slice(watchKeywordLength)] = item[key];
						}
						else {
							params[key] = item[key];
						}
					}
				}

				var newItem = { 
					type: type,
					link: link,
					slot: numElements++,
					state: state,
					watch: watch,
					params: params
				};

				if(link)
				{
					statesLinked[link] = elementKey;
					elementsLinked[elementKey] = link;
				}

				if(bind) {
					elementsBinded[elementKey] = bind;
				}

				elements[elementSlotId] = newItem;
			}

			delete props.elements;
		}

		// Defines states:
		var statesDefined = props.state;
		var statesInitial = statesDefined;
		if(statesDefined)
		{
			for(var key in statesDefined) {
				states[key] = statesDefined[key];
			}
		}

		// Define properties:
		for(var key in props)
		{
			var p = Object.getOwnPropertyDescriptor(props, key);
			if(p.get || p.set) {
				Object.defineProperty(proto, key, p);
				continue;
			}

			var variable = props[key];
			var variableType = typeof(variable);

			if(variableType === "function")
			{
				var buffer = key.split("_");
				if(buffer.length > 1 && buffer[0] !== "")
				{
					var stateName = buffer[1];

					if(buffer[0] !== "handle") 
					{
						if(states[stateName] === undefined) {
							states[stateName] = null;
						}
					}
					else {
						events.push(stateName);
					}
				}
			}

			proto[key] = variable;
		}

		var statesProto;

		if(name !== "basic")
		{
			var basicMetadata = this.element.basic.prototype._metadata;
			var basicStates = basicMetadata.states;

			statesProto = Object.assign({}, basicStates);
			statesProto = Object.assign(statesProto, states);
		}
		else 
		{
			statesProto = states;			
		}

		var bindsForElement = {};
		for(var key in elementsBinded) {
			bindsForElement[elementsBinded[key]] = key; 
		}

		// Create metadata:
		var metadata = new this.metadata(name);
		metadata.states = statesProto;
		metadata.statesLinked = statesLinked;
		metadata.statesInitial = statesInitial;
		metadata.elementsLinked = elementsLinked;
		metadata.elementsBinded = elementsBinded;
		metadata.bindsForElement = bindsForElement;

		if(numElements > 0) {
			metadata.elements = elements;
		}
		if(events.length > 0) {
			metadata.events = events;
		}

		proto._metadata = metadata;
		return proto;
	},

	compileBasicElement: function(props, extend)
	{
		var proto = this.genPrototype("basic", extend, props);

		proto.flagsInitial = (proto.Flag.ENABLED);
		proto.flags = proto.flagsInitial;

		this.element.basic.prototype = proto;
	},	

	compileElement: function(name, props, extend)
	{
		function element(parent, params) {
			wabi.element.basic.call(this, parent, params);
		};

		var elementProto = this.genPrototype(name, extend, props);

		element.prototype = Object.create(this.element.basic.prototype);
		element.prototype.constructor = element;
		var proto = element.prototype;

		for(var key in elementProto)
		{
			var p = Object.getOwnPropertyDescriptor(elementProto, key);
			if(p.get || p.set) {
				Object.defineProperty(proto, key, p);
				continue;
			}

			proto[key] = elementProto[key];
		}

		// Generate setters:
		var metadata = elementProto._metadata;
		var statesLinked = metadata.statesLinked;
		var states = metadata.states;
		var statesProto = {};

		for(var key in statesLinked) 
		{
			if(!states[key]) {
				states[key] = undefined;
			}
		}

		for(var key in states) 
		{
			var stateValue = states[key];
			var stateValueType = typeof stateValue;

			var link = statesLinked[key];
			if(link) {
				statesProto[key] = null;
				this.defStateLink(proto, key, link);
			}
			else 
			{
				switch(stateValueType)
				{
					case "string":
					case "object":
						statesProto[key] = null;
						break;

					case "number":
						statesProto[key] = 0;
						break;

					case "boolean":
						statesProto[key] = false;
						break;

					default:
						console.warn("(wabi.compileElement) Unhandled stateValueType `" + stateValueType + "` for element: " + name);
						statesProto[key] = null;
						break;
				}

				this.defState(proto, key);
			}
		}

		function state() {};
		state.prototype = statesProto;
		metadata.stateCls = state;

		this.element[name] = element;
	},

	defState: function(proto, key)
	{
		Object.defineProperty(proto, "$" + key, 
		{
			set: function(value) {
				this._updateState(key, value);
			},
			get: function() {
				return this._$[key];
			}
		});	
	},

	defStateLink: function(proto, key, link)
	{
		Object.defineProperty(proto, "$" + key, 
		{
			set: function(value) 
			{
				var element = this.elements[link];
				if(element) {
					element.$value = value;
				}
				else {
					this._updateState(key, value);
				}
			},
			get: function() {
				return this.elements[link].$value;
			}
		});	
	},

	addDataset: function(id, data)
	{
		if(this.datasets[id]) {
			console.warn("(wabi.addDataset) There is already dataset with id: " + id);
			return;
		}

		if(data instanceof wabi.data) {
			this.datasets[id] = data.data;
		}
		else {
			this.datasets[id] = data;
		}
	},

	assignObj: function(target, src)
	{
		for(var key in src) 
		{
			var prop = Object.getOwnPropertyDescriptor(src, key);
			if(prop.get || prop.set) {
				Object.defineProperty(target, key, prop);
				continue;
			}

			target[key] = src[key];
		}
	},

	metadata: function(name) 
	{
		this.name = name;
		this.states = null;
		this.stateCls = null;
		this.statesLinked = null;
		this.elements = null;
		this.elementsLinked = null;
		this.elementsBinded = null;
		this.events = null;
	},

	Watcher: function(owner, func) 
	{
		this.owner = owner ? owner : null,
		this.func = func;
	},

	Fragment: function(id, extend, props)
	{
		this.id = id;
		this.props = props;

		if(extend) 
		{
			if(typeof(extend) === "string") {
				this.extend = [ extend ];
			}
			else {
				this.extend = extend;
			}
		}
		else {
			this.extend = null
		}
	},

	ElementDef: function(props, extend)
	{
		this.props = props;
		this.extend = extend;
	},

	//
	globalData: {},

	elementsCached: {},
	elementDefs: {},
	datasets: {},

	fragments: {},
	templates: {},
	listeners: {}
};
