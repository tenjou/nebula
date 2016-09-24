"use strict";

wabi.element("canvas", 
{
	prepare: function() {
		this.ctx = this.domElement.getContext("2d");
	},

	//
	ctx: null
});