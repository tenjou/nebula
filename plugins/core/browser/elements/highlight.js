"use strict";

wabi.element("highlight",
{
	set_value: function(value) 
	{
		this.$domElement.innerHTML = value;
		// this.setCls("active", true)

		if(this.value && value) 
		{
			console.log("active")
			this.setCls("active", true);
			var self = this;
			setTimeout(function() {
				self.setCls("active", false);
			}, 1000)		

		}		
	}
});
