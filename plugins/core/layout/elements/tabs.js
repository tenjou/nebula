"use strict";

wabi.element("tabs",
{
	set_value: function(value)
	{
		this.removeAll();

		var tab;

		if(typeof(value) === "string")
		{
			tab = wabi.createElement("tab", this);
			tab.value = value;
		}
		else if(value instanceof Array)
		{
			for(var n = 0; n < value.length; n++)
			{
				tab = wabi.createElement("tab", this);
				tab.value = value[n];
			}
		}
		else {
			return;
		}

		this.$children[0].active = true;
	}
});

wabi.element("tab",
{
	prepare: function()
	{
		var tabInner = document.createElement("tab-inner");
		this.domContent = document.createElement("tab-content");
		tabInner.appendChild(this.domContent);
		this.$domElement.appendChild(tabInner);
	},

	set_value: function(value)
	{
		this.domContent.innerHTML = value;
	},

	set_active: function(value)
	{
		this.setCls("active", true);
	},

	//
	active: true,
	tabContent: null
});
