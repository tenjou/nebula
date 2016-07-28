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
		this.removeAll();

		if(!value) { return; }

		for(var n = 0; n < value.length; n++) {
			this.createItem(value[n]);
		}
	},

	createItem: function(item)
	{
		var element;
		var strType = typeof(item);
		if(strType === "object")
		{
			if(item.type === "category") {
				element = wabi.createElement("contextmenuCategory", this);
			}
			else {
				element = wabi.createElement("contextmenuItem", this);
			}
		}
		else if(strType === "string") {
			element = wabi.createElement("contextmenuItem", this);
		}
		else
		{
			console.warn("(wabi.element.contextmenu.createItem) Invalid data");
			return;
		}

		element.state = item;
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
