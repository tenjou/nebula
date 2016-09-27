"use strict";

wabi.element("image",
{
	prepare: function() {
		this.img = document.createElement("img");
		this.domElement.appendChild(this.img);
	},

	set_value: function(value) 
	{
		if(value) {
			this.img.src = editor.projectPath + value + "." + this.data.get("ext");
		}
		else {
			this.img.src = "";
		}
	},

	//
	img: null
});
