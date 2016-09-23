"use strict";

// wabi.element("slots",
// {
// 	elements: {
// 		item1: null,
// 		item2: null
// 	},

// 	createItem1: function()
// 	{
// 		var element = this.slot("item1", "text");
// 		element.value = "slot<1>:" + Math.random();
// 	},

// 	createItem2: function()
// 	{
// 		var element = this.slot("item2", wabi.createElement("text"));
// 		element.value = "slot<2>:" + Math.random();
// 	}
// });

// var element = wabi.createElement("slots", document.body);
// element.createItem2();
// element.createItem1();
// element.createItem2();
// element.removeSlot("item2");
// element.$elements.item1.remove();
// element.createItem2();
// element.createItem1();
// element.removeAll();

// wabi.element("test", 
// {
// 	state: {
// 		value: "test"
// 	},

// 	elements: 
// 	{
// 		item: {
// 			type: "text",
// 			link: "value",
// 			bind: "content",
// 			watch_value: "updateValue",
// 			watch_folder: "updateFolder",
// 			$value: "smthsmth",
// 		}
// 	},

// 	updateValue: function(value)
// 	{
// 		console.log("VALUE_CHANGED:", value)
// 		return "changed_value"
// 	},

// 	updateFolder: function(value)
// 	{

// 	},

// 	set_value: function(value) {
// 		console.log("linked_value", value)
// 		return value + "_2"
// 	}

// 	// set_value: function(value) 
// 	// {
// 	// 	var element = this.element("item");
// 	// 	if(element) {
// 	// 		element.$value = value;
// 	// 	}
// 	// }

// 	// set_value: function(value) {
// 	// 	this.html(value);
// 	// }

// 	// elements: 
// 	// {
// 	// 	item: "text"
// 	// },

// 	// set_value: function(value) 
// 	// {
// 	// 	// var data = new wabi.data({
// 	// 	// 	content: "stuff"
// 	// 	// });
		


// 	// 	var element = this.element("item2", "text");
// 	// 	element.$value = "|" + value + 2;		

// 	// 	var element = this.element("item", "text");
// 	// 	element.$value = value;		
// 	// 	// element.bind = "content"
// 	// 	// element.data = data;
// 	// }
// });

meta.onDomLoad(function() 
{
	// var data = new wabi.data({ content: "from_data" });
	// var data2 = new wabi.data({ content: "a" });

	// var element = wabi.createElement("test", document.body);
	// element.$value = "sdsds";
	// element.data = data;
	// element.$value = "new"
	// element.$value = "test222"
	// element.bind = "content";
	// element.data = data;
	// element.$value = "test";
	// // element.remove();
	// console.log(data.get("content"));

	// var element = wabi.createElement("test", document.body);
	// element.bind = "content";
	// element.data = data2;
	// element.$value = "test";
	// console.log(data2.get("content"));

	// var element = wabi.createElement("test", document.body);
	// element.$value = "stuff";
	// element.remove();

	// var element = wabi.createElement("test", document.body);
	// element.$value = "xxx"
	// console.log("state", element.$value);
	// console.log(JSON.stringify(element))

	// element.
	// element.slot("item", element.elements.item);

	// console.log(element.element.item);
	// element.$;
	// element.$value = "someth"

	// var element = wabi.createElement("slots", document.body);
	// element.createItem2();
	// element.createItem1();
	// element.createItem2();
	// // element.slot("item1", null)
	// element.$elements.item2.remove();
	// // element.createItem2();
	// // element.createItem1();
	// console.log(element.$children.length);
	// element.removeAll();
	// // element.createItem2();

	editor.prepare();
});
