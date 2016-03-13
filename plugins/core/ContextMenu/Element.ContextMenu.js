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
				this.createCategory(this, item);
			}
			else {
				this.createItem(this, item);
			}
		}
		else if(strType === "string") {
			this.createItem(this, item);
		}
		else {
			console.warn("(Element.ContextMenu.fill) Invalid data");
		}
	},

	_loadCategoryItem: function(category, data) 
	{
		var strType = typeof(data);
		if(strType === "object")
		{
			if(data.type !== "category") {
				this.createItem(category, data);
			}
		}
		else if(strType === "string") {
			this.createItem(category, data);
		}
		else {
			console.warn("(Element.ContextMenu.fill) Invalid data");
		}
	},

	createCategory: function(parent, data)
	{
		var categoryItem = new Element.ContextMenuCategory(parent);
		categoryItem.value = data.name;

		if(data.icon) {
			categoryItem.icon = data.icon;
		}

		if(data.content)
		{
			var items = data.content;
			var num = items.length;
			for(var n = 0; n < num; n++) {
				this._loadCategoryItem(categoryItem.inner, items[n]);
			} 
		}
	},

	createItem: function(parent, data) 
	{
		var item = new Element.ContextMenuItem(parent);

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
