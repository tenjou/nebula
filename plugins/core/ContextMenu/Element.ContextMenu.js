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
		var num = data.length;
		for(var n = 0; n < num; n++) {
			this._loadItem(data[n]);
		}
	},

	_loadItem: function(item)
	{
		var strType = typeof(item);
		if(strType === "object")
		{
			if(item.type === "category") {
				this.createCategory(item);
			}
			else {
				this.createItem(item);
			}
		}
		else if(strType === "string") {
			this.createItem(item);
		}
		else {
			console.warn("(Element.ContextMenu.fill) Invalid item");
		}
	},

	createCategory: function(data)
	{
		var categoryItem = new Element.ContextMenuCategory(this);
		categoryItem.value = data.name;

		if(data.icon) {
			categoryItem.icon = data.icon;
		}

		if(data.content)
		{
			var items = data.content;
			var num = items.length;
			for(var n = 0; n < num; n++) {
				this._loadItem(items[n]);
			} 
		}
	},

	createItem: function(data) 
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
			if(data.content) {
				item.loadSubmenu(data.content);
			}
		}
		else {
			item.value = data;
		}
	},

	//
	elementTag: "context-menu"
});
