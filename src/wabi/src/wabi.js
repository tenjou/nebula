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

		var template;
		var buffer = this.templatesCached[id];
		if(buffer) 
		{
			template = buffer.pop();
			if(template) 
			{
				if(template.setup()) {
					template.setup();
				}
				return template;
			}
		}

		var template = wabi.createElement(props.type);
		template.state = props;
		template.$flags |= template.Flag.REGION;

		return template;
	},

	destroyTemplate: function(template)
	{
		template.parent = null;

		var buffer = this.templatesCached[template.id];
		if(buffer) {
			buffer.push(template);
		}
		else {
			buffer = [ template ];
			this.templatesCached[template.id] = buffer;
		}
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

	createElement: function(name, parent, params, autoSetup)
	{
		var element;
		var buffer = this.elementsCached[name];
		if(buffer && buffer.length > 0) 
		{
			element = buffer.pop();
			if(element) 
			{
				element.$flags |= element.Flag.ACTIVE;
				element.parent = parent;
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
			element.$flags |= element.Flag.ACTIVE;
		}

		if(autoSetup !== false) 
		{
			if(element.$setup) {
				element.$setup();
			}
		}

		return element;
	},

	removeElement: function(element, skipChildRemove)
	{
		if((element.$flags & element.Flag.ACTIVE) === 0) { return; }
		element.$flags &= ~element.Flag.ACTIVE;
		element.$remove(skipChildRemove);

		var buffer = this.elementsCached[element.$metadata.name];
		if(!buffer) {
			buffer = [ element ];
			this.elementsCached[element.$metadata.name] = buffer;
		}
		else {
			buffer.push(element);
		}
	},

	on: function(name, func, owner)
	{
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

	off: function(func, owner)
	{

	},

	// TODO: Better method for extending classes, so that instanceof works on parent extends.
	// TODO: Multi-level inheritance support.
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

	genPrototype: function(name, extend, props)
	{
		if(extend) 
		{
			var extendedDef = this.elementDefs[extend]
			if(!extendedDef) {
				console.warn("(wabi.genPrototype) Extended class not found: " + extend);
				return;
			}

			var newProps = Object.assign({}, extendedDef.props);
			Object.assign(newProps, props);
			props = newProps;
		}		

		var states = {};
		var statesHandled = {};
		var statesLinked = {};
		var elementsLinked = {};
		var elementsBinded = {};
		var elements = {};
		var events = [];
		var proto = {};
		var numElements = 0;

		if(props.elements) 
		{
			var elementsProps = props.elements;
			for(var key in elementsProps)
			{
				var item = elementsProps[key];
				elements[key] = item.type;
				numElements++;

				if(item.link)
				{
					statesLinked[item.link] = key;
					elementsLinked[key] = item.link;
				}
				else if(item.bind)
				{
					statesLinked[item.bind] = key;
					elementsBinded[key] = item.bind;
				}
			}

			delete props.elements;
		}

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
						if(!states[stateName])
						{
							states[stateName] = null;
							statesHandled[stateName] = true;
						}
					}
					else {
						events.push(stateName);
					}
				}

				proto[key] = variable;
			}
			else 
			{
				if(key[0] === "$") {
					proto[key] = variable;
				}
				else {
					states[key] = variable;
				}
			}
		}

		var statesProto;

		if(name !== "basic")
		{
			var basicMetadata = this.element.basic.prototype.$metadata;
			var basicStates = basicMetadata.states;

			statesProto = Object.assign({}, basicStates);
			statesProto = Object.assign(statesProto, states);

			// Discard unhandled states:
			for(var key in states)
			{
				if(!statesHandled[key] && !basicStates[key]) { 
					proto[key] = states[key];
					delete states[key];
				}
			}	
		}
		else
		{
			statesProto = states;

			// Discard unhandled states:
			for(var key in states)
			{
				if(!statesHandled[key]) { 
					proto[key] = states[key];
					delete states[key];
				}
			}			
		}

		// Create metadata:
		var metadata = new this.metadata(name);
		metadata.states = statesProto;
		metadata.statesLinked = statesLinked;
		metadata.elementsLinked = elementsLinked;
		metadata.elementsBinded = elementsBinded;

		if(numElements > 0) {
			metadata.elements = elements;
		}
		if(events.length > 0) {
			metadata.events = events;
		}

		proto.$metadata = metadata;
		return proto;
	},

	compileBasicElement: function(props, extend)
	{
		var proto = this.genPrototype("basic", extend, props);

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
		var metadata = elementProto.$metadata;
		var statesLinked = metadata.statesLinked;
		var states = metadata.states;
		var statesProto = {};

		for(var key in statesLinked) {
			states[key] = null;
		}

		for(var key in states) 
		{
			var link = statesLinked[key];
			if(link) 
			{
				if(key === "value") 
				{
					if(elementProto.set_value === undefined) {
						proto.set_value = null;
					}
					if(elementProto.value === undefined) {
						elementProto.value = undefined;
						delete states.value;
					}
				}

				this.defStateLink(proto, key, link);
			}
			else 
			{
				this.defState(proto, key);
				statesProto[key] = states[key];
			}
		}

		function state() {};
		state.prototype = statesProto;
		metadata.stateCls = state;

		this.element[name] = element;
	},

	defState: function(proto, key)
	{
		Object.defineProperty(proto, key, 
		{
			set: function(value) {
				this.$updateState(key, value);
			},
			get: function() {
				return this.$state[key];
			}
		});	
	},

	defStateLink: function(proto, key, link)
	{
		Object.defineProperty(proto, key, 
		{
			set: function(value) {
				this.$elements[link].value = value;
			},
			get: function() {
				return this.$elements[link].value;
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
	templatesCached: {},
	listeners: {},
	
};
