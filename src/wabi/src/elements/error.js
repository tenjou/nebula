"use strict";

wabi.element("error", 
{
	set_value: function(value)
	{
		if(!value) {
			this.$domElement.innerHTML = "";
			return;
		}

		var text = this.types[value];
		if(!text) {
			this.$domElement.innerHTML = "";
			return; 
		}

		this.$domElement.innerHTML = text;
	},

	set_types: function(value)
	{
		if(this.value) {
			this.set_value(this.value);
		}
	},

	//
	types: {}
});
