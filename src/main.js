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

meta.onDomLoad(function() 
{
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
