"use strict";

meta.class("Element.ContextMenu", "Element.Basic",
{
	position: function(x, y)
	{
		this.domElement.style.left = x + "px";
		this.domElement.style.top = y + "px";
	},

	fill: function(data, id)
	{
		if(!id) { id = null; }

		var num = data.length;
		for(var n = 0; n < num; n++) {
			this._loadItem(data[n], id);
		}
	},

	_loadItem: function(item, id)
	{
		var strType = typeof(item);
		if(strType === "object")
		{
			if(item.type === "category") {
				this.createCategory(this, item, id);
			}
			else {
				this.createItem(this, item, id);
			}
		}
		else if(strType === "string") {
			this.createItem(this, item, id);
		}
		else {
			console.warn("(Element.ContextMenu.fill) Invalid data");
		}
	},

	_loadCategoryItem: function(category, data, id) 
	{
		var strType = typeof(data);
		if(strType === "object")
		{
			if(data.type !== "category") {
				this.createItem(category, data, id);
			}
		}
		else if(strType === "string") {
			this.createItem(category, data, id);
		}
		else {
			console.warn("(Element.ContextMenu.fill) Invalid data");
		}
	},

	createCategory: function(parent, data, id)
	{
		if(id) {
			id = id + "." + data.name;
		}
		else {
			id = data.name;
		}

		var categoryItem = new Element.ContextMenuCategory(parent, id);
		categoryItem.value = data.name;

		if(data.icon) {
			categoryItem.icon = data.icon;
		}

		if(data.content)
		{
			var items = data.content;
			var num = items.length;
			for(var n = 0; n < num; n++) {
				this._loadCategoryItem(categoryItem.inner, items[n], id);
			} 
		}
	},

	createItem: function(parent, data, id) 
	{
		var name = (typeof(data) === "object") ? data.name : data;

		if(id) {
			id = id + "." + name;
		}
		else {
			id = name;
		}		

		var item = new Element.ContextMenuItem(parent, id);

		if(typeof(data) === "object") 
		{
			item.value = name;

			if(data.icon) {
				item.icon = data.icon;
			}
			
			if(data.content) {
				item.loadSubmenu(data.content);
			}
		}
		else 
		{

			item.value = data;
		}
	},

	//
	elementTag: "context-menu"
});
