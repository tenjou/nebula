"use strict";

editor.plugin("contextmenu",
{
	create: function()
	{
		this.menus = {};

		this.contextmenu = wabi.createElement("contextmenu", editor.overlayElement);
		this.contextmenu.hidden = true;

		wabi.on("click", this.handleClick, this);
		wabi.on("contextmenu", this.handleContextmenu, this);
	},

	add: function(id, extend, props)
	{
		if(!props) {
			props = extend;
			extend = null;
		}

		if(!props) {
			console.warn("(plugin.contextmenu.add) Invalid properties passed for id: " + id);
			return;
		}

		var menu = this.menus[id];
		if(!menu) 
		{
			var processedProps = {};
			this.processProps(processedProps, props);

			menu = new this.Menu(id, extend, processedProps);
			this.menus[id] = menu;
		}
		else 
		{
			this.processProps(menu.props, props);

			if(extend) 
			{
				if(menu.extend) {
					menu.extend.push(extend);
				}
				else {
					menu.extend = [ extend ];
				}
			}
		}
	},

	processProps: function(src, props)
	{
		for(var key in props)
		{
			var state = props[key];
			var prevState = src[key];

			if(!state) 
			{
				if(!prevState) {
					src[key] = { value: key };
				}
			}
			else if(state instanceof Function) 
			{
				if(prevState) {
					prevState.func = state;
				}
				else {
					src[key] = { value: key, func: state };
				}
			}
			else if(state instanceof Object) 
			{
				if(prevState)
				{
					if(state.value && state.value !== prevState.value) {
						prevState.value = state.value;
					}

					if(state.content) {
						this.processProps(prevState.content, state.content);
					}
				}
				else
				{
					if(!state.value) {
						state.value = key;
					}

					if(state.content) 
					{
						if(!state.type) {
							state.type = "category";
						}

						var content = {};
						this.processProps(content, state.content);
						state.content = content;
					}

					src[key] = state;
				}

			}
		}
	},

	show: function(id, x, y)
	{
		var menu = this.menus[id];
		if(!menu) {
			console.warn("(plugin.contextmenu.show) No such context menu found: " + id);
			return;
		}

		if(menu.extend) 
		{
			var props = {};
			this.extendMenu(props, menu);
			this.contextmenu.$value = props;
		}
		else 
		{
			this.contextmenu.$value = menu.props;
		}

		this.contextmenu.position(event.x, event.y);
		this.contextmenu.hidden = false;
	},

	extendMenu: function(src, menu)
	{
		if(menu.extend) 
		{
			var extend = menu.extend;
			for(var n = 0; n < extend.length; n++) 
			{
				var extendId = extend[n];
				var extendMenu = this.menus[extendId];
				if(!extendMenu) {
					console.warn("(plugin.contextmenu.extendMenu) No such context menu found: " + extendId);
					continue;
				}

				this.extendMenu(src, extendMenu)
			}
		}

		this.mergeProps(src, menu.props);
	},

	mergeProps: function(src, props)
	{
		for(var key in props)
		{
			var state = props[key]
			var prevState = src[key];

			if(!prevState) 
			{
				var newState = {};
				Object.assign(newState, state);
				if(newState.content) {
					newState.content = {};
					Object.assign(newState.content, state.content);
				}

				src[key] = newState;
			}
			else
			{
				if(prevState.value !== state.value) {
					prevState.value = state.value;
				}

				if(state.content) 
				{
					if(prevState.content) {
						this.mergeProps(prevState.content, state.content);
					}
					else {
						prevState.content = {};
						Object.assign(prevState.content, state.content);
					}
				}
			}
		}
	},

	hide: function() {
		this.contextmenu.hidden = true;
	},

	handleClick: function(event) {
		this.contextmenu.hidden = true;
	},

	handleContextmenu: function(event) {
		event.domEvent.preventDefault();
		this.hide();
	},

	Menu: function(id, extend, props)
	{
		this.id = id;
		this.props = props;
		this.extend = extend ? [ extend ] : null;
	},

	//
	menus: null,
	contextmenu: null
});
