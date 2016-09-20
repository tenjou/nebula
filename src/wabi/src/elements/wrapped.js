"use strict";

wabi.element("wrapped", 
{
	create: function(params) 
	{
		if(typeof(params) === "string") {
			this.tag = params;
		}
		else if(params instanceof Element) {
			this.tag = params.tagName;
			this.domElement = params;
		}
	}
});
