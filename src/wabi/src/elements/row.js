"use strict";

wabi.element("row", 
{
	set_value: function(value) 
	{
		this.removeAll();
		
		if(!value) { return; }

		for(var n = 0; n < value.length; n++)
		{
			var elementCfg = value[n];

			var element = wabi.createElement(elementCfg.type, this);
			if(!element) {
				continue;
			}

			element.state = elementCfg;
		}	
	}
});
