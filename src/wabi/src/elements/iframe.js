"use strict";

wabi.element("iframe",
{
	set_value: function(value) {
		this.$domElement.src = value;
	},

	handle_load: function(event) {
		this.$wnd = this.$domElement.contentWindow;
	},

	get wnd() {
		return this.$wnd;
	},

	//
	$wnd: null
});
