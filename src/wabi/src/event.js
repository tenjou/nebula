"use strict";

wabi.event = function(name, element, domEvent)
{
	this.name = name;
	this.element = element;

	if(domEvent) 
	{
		this.domEvent = domEvent;

		if(domEvent.clientX) 
		{
			this.x = domEvent.clientX;
			this.y = domEvent.clientY;
			this.updateElementOffset(event);
		}
		else {
			this.x = 0;
			this.y = 0;
		}
	}		
};

wabi.event.prototype = 
{
	updateElementOffset: function()
	{
		var offsetLeft = 0;
		var offsetTop = 0;

		if(this.element)
		{
			var domElement = this.element.domElement;
			if(domElement.offsetParent)
			{
				do 
				{
					if(domElement.tagName === "IFRAME") {
						offsetLeft += domElement.offsetLeft;
						offsetTop += domElement.offsetTop;
					}

				} while(domElement = domElement.offsetParent);
			}
		}

		if(this.element && this.element.domElement.tagName === "IFRAME") 
		{
			var rect = this.element.domElement.getBoundingClientRect();
			this.x += rect.left;
			this.y += rect.top;
		}
	},	

	stop: function()
	{
		this.domEvent.preventDefault();
		this.domEvent.stopPropagation();		
	},

	get target() {
		return this.domEvent.target.holder;
	},

	//
	domEvent: null,
	x: 0,
	y: 0
};
