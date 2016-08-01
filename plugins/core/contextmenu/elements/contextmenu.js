"use strict";

wabi.element("contextmenu",
{
	elements: 
	{
		inner: {
			type: "contextmenuInner",
			link: "value"
		}
	},

	position: function(x, y) {
		this.x = x;
		this.y = y;
	},

	set_x: function(value) {
		this.$domElement.style.left = value + "px";
	},

	set_y: function(value) {
		this.$domElement.style.top = value + "px";
	},

	//
	x: 0,
	y: 0
});

wabi.element("contextmenuItem",
{
	elements: 
	{
		icon: {
			type: "icon",
			link: "icon"
		},
		text: {
			type: "text",
			link: "value"
		}
	},

	prepare: function() {
		this.on("click", "*", this.handle_click, this);
	},

	handle_click: function(event)
	{
		if(this.func) {
			this.func(event);
		}
	},

	//
	$tag: "item",
	func: null
});

wabi.element("contextmenuCategory",
{
	elements: 
	{
		header: {
			type: "contextmenuHeader",
			link: "value"
		},
		content: {
			type: "contextmenuInner",
			link: "content"
		}
	},

	set_icon: function(value) {
		this.$elements.header.icon = value;
	},

	//
	$tag: "category"
});

wabi.element("contextmenuInner",
{
	set_value: function(value)
	{
		this.removeChildren();

		if(!value) { return; }

		for(var key in value) {
			this.createItem(key, value[key]);
		}
	},

	createItem: function(name, state)
	{
		var element;

		if(state.type === "category") {
			element = wabi.createElement("contextmenuCategory", this);
		}
		else {
			element = wabi.createElement("contextmenuItem", this);
		}

		element.state = state;
	},

	//
	$tag: "inner"
});

wabi.element("contextmenuHeader",
{
	elements: 
	{
		icon: {
			type: "icon",
			link: "icon"
		},
		value: {
			type: "text",
			link: "value"
		},
	},

	//
	$tag: "header"
});
