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

		element.state = state;		
	},

	set_padding: function(value) 
	{
		if(value > 0) {
			this.style("margin", value + "px");
		}
		else if(this.style("margin")) {
			this.style("margin", "");
		}
	},

	set_height: function(value) 
	{
		if(value) {
			this.style("height", value + "px");
		}
	},

	padding: 0,
	height: 0	
});