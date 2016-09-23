"use strict";

wabi.element("content", 
{
	set_value: function(value) 
	{
		this.removeAll();

		this.$loadValue(value);
	},

	$loadValue: function(value)
	{
		if(!value) { return; }

		var type = typeof(value);
		
		if(type === "object")
		{
			if(value instanceof Array)
			{
				for(var n = 0; n < value.length; n++)
				{
					var state = value[n];
					if(typeof(state) === "string") 
					{
						var template = wabi.getFragment(state);
						this.$loadValue(template);
					}
					else {
						this.$loadState(state);
					}
				}	
			}
			else {
				this.$loadState(value);
			}
		}
		else 
		{
			var template = wabi.getFragment(value);
			this.$loadValue(template);
		}		
	},

	$loadState: function(state)
	{
		if(!state.type) {
			console.warn("(wabi.elements.content) Undefined element type");
			return;
		}

		var element = wabi.createElement(state.type, this);
		if(!element) { return; }

		for(var key in state)
		{
			if(key === "type") { continue; }

			element[key] = state[key];
		}
	},

	set padding(value) 
	{
		if(value > 0) {
			this.style("margin", value + "px");
		}
		else if(this.style("margin")) {
			this.style("margin", "");
		}
	},

	get padding() {
		return this._padding;
	},

	set height(value) 
	{
		this.style("height", value + "px");
	},

	get height() {
		return this._height;
	},

	//
	_padding: 0,
	_height: 0	
});