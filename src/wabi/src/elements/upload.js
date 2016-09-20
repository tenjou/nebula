"use strict";

wabi.element("upload",
{
	prepare: function()
	{
		this.attrib("type", "file");
		this.attrib("multiple", "");
		this.attrib("directory", "");
	},

	set_value: function(value) {
		this.domElement.value = value;
	},

	open: function() {
		this.domElement.click();
	},

	get files() {
		return this.domElement.files;
	},

	//
	tag: "input"
});
