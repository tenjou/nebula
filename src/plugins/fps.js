"use strict";

editor.plugin("fps", 
{
	init: function()
	{
		this.element = document.createElement("div");
		this.element.setAttribute("class", "footer-item");
		editor.footer.appendChild(this.element);
	},

	start: function() {
		this.tLast = Date.now();
	},

	update: function(tDelta) 
	{
		this.fps++;

		var tCurrent = Date.now();
		if(tCurrent - this.tLast > 1000) {
			this.element.innerHTML = "FPS: " + this.fps;
			this.fps = 0;
		}

		this.tLast = this.tCurrent;
	},

	//
	element: null,

	tLast: 0,
	fps: 0
});
