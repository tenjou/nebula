"use strict";

wabi.element("iframe",
{
	// $addEvent: function(eventName) 
	// {
	// 	var func = this.$wnd["handle_" + eventName];

	// 	if(eventName === "click") 
	// 	{
	// 		this.$domElement.onclick = this.$processClick.bind(this);
	// 		if(func) {
	// 			this.$onClick = func.bind(this);
	// 		}
	// 	}
	// 	else if(eventName === "dblclick") 
	// 	{
	// 		this.$domElement.onclick = this.$processClicking.bind(this);
	// 		if(func) {
	// 			this.$onDblClick = func.bind(this);
	// 		}
	// 	}
	// 	else 
	// 	{
	// 		var eventKey = "on" + eventName;

	// 		if(this.$domElement[eventKey] === null) 
	// 		{
	// 			var self = this;
	// 			this.$domElement[eventKey] = function(domEvent) {
	// 				self.$processEvent(eventName, func, domEvent);
	// 			}
	// 		}
	// 	}
	// },

	set_value: function(value) {
		this.domElement.src = value;
	},

	handle_load: function(event) {
		this.wnd = this.domElement.contentWindow;
	},

	//
	wnd: null
});
