"use strict";

meta.class("Element.ContextMenu", "Element.Basic",
{
	position: function(x, y)
	{
		this.domElement.style.left = x + "px";
		this.domElement.style.top = y + "px";
	},

	fill: function(data)
	{
		if(data instanceof Array) 
		{
			var num = data.length;
			for(var n = 0; n < num; n++) {
				this.addItem(data[n]);
			}
		}
		else 
		{
			for(var category in data) {
				this._loadCategory(category, data[category]);
			}
		}
	},

	_loadCategory: function(category, items)
	{
		var categoryItem = new Element.ContextMenuCategory(this);
		categoryItem.value = category;

		var num = items.length;
		for(var n = 0; n < num; n++) {
			this.addItem(items[n]);
		} 
	},

	addItem: function(data) 
	{
		var item = new Element.ContextMenuItem(this);

		if(typeof(data) === "object") 
		{
			if(data.icon) {
				item.icon = data.icon;
			}
			if(data.name) {
				item.value = data.name;
			}
		}
		else {
			item.value = data;
		}
	},

	//
	elementTag: "context-menu"
});
