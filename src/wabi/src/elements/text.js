"use strict";

wabi.element("text", 
{
	set_value: function(value) {
		this.domElement.innerHTML = value;
	}
});
