"use strict";

wabi.element("type", 
{
	set_value: function(value, prevValue) 
	{
		var icon = editor.plugins.resources.getIconFromType(value);

		this.attrib("class", "fa", true);
		this.setCls(icon, true);
	}
});