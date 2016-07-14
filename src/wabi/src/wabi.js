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

		var element = this.elements[props.type];
		if(!element) {
			console.warn("(wabi.createTemplate) Element type not found: " + props.type);
			return null;
		}

		template = new element(null);
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

	createElement: function(name, parent, params)
	{
		var buffer = this.elementsCached[name];
		if(buffer) 
		{
			var element = buffer.pop();
			if(element) 
			{
				element.$flag |= element.Flag.ACTIVE;
				element.parent = parent;

				if(element.setup) {
					element.setup();
				}

				return element;
			}
		}

		var cls = wabi.elements[name];
		if(!cls) {			
			console.warn("(editor.createElement) No such element found: " + name);
			return null;
		}

		return new wabi.elements[name](parent, params);
	},

	removeElement: function(element)
	{
		if((element.$flag & element.Flag.ACTIVE) === 0) { return; }
		element.$flag &= ~element.Flag.ACTIVE;
		element.remove();

		var buffer = this.elements[element.$metadata.name];
		if(!buffer) {
			buffer = [ element ];
			this.elements[element.$metadata.name] = buffer;
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

	element: function(name, props) 
	{
		if(name === "basic") {
			this.compileBasicElement(props);
		}
		else {
			this.compileElement(name, props);
		}
	},	

	genPrototype: function(name, props)
	{
		var states = {};
		var statesHandled = {};
		var statesLinked = {};
		var elementsLinked = {};
		var elements = {};
		var events = [];
		var proto = {};

		if(props.elements) 
		{
			var elementsProps = props.elements;
			for(var key in elementsProps)
			{
				var item = elementsProps[key];
				elements[key] = item.type;

				if(item.link)
				{
					states[item.link] = null;
					statesLinked[item.link] = key;
					elementsLinked[key] = item.link;
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
			var basicMetadata = wabi.elements.basic.prototype.$metadata;
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

		if(elements) {
			metadata.elements = elements;
		}
		if(events) {
			metadata.events = events;
		}

		proto.$metadata = metadata;
		return proto;
	},

	compileBasicElement: function(props)
	{
		var proto = this.genPrototype("basic", props);

		wabi.elements.basic.prototype = proto;
	},	

	compileElement: function(name, props)
	{
		function element(parent, params) {
			wabi.elements.basic.call(this, parent, params);
		};

		var elementProto = this.genPrototype(name, props);

		element.prototype = Object.create(this.elements.basic.prototype);
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
				}

				this.defStateLink(proto, key, link);
				statesProto[key] = null;
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

		this.elements[name] = element;
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
		this.statesInitial = null;
		this.stateCls = null;
		this.statesLinked = null;
		this.elements = null;
		this.elementsLinked = null;
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

	//
	data: {},

	elements: {},
	elementsCached: {},
	datasets: {},

	fragments: {},
	templates: {},
	templatesCached: {},
	listeners: {},
	
};
