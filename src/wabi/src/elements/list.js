"use strict";

wabi.element("list",
{
	prepare: function() 
	{
		this.on("click", "*", this.handleItemClick, this);
	},

	setup: function()
	{
		this.cache = {
			itemElements: [],
			selectable: true,
			selected: null, 
			dragging: null
		};
	},

	set_value: function(value) 
	{
		this.removeAll();

		if(value) 
		{
			this.set_placeholder(null);

			if(value instanceof Object)
			{
				if(value instanceof Array)
				{
					for(var n = 0; n < value.length; n++) {
						this.add_value(value.get(n));
					}
				}
				else
				{
					var raw = value.raw;
					for(var key in raw) {
						this.add_value(value.get(key));
					}
				}
			}
		}

		if(!this.children || this.children.length === 0) {
			this.set_placeholder(this.placeholder);
		}	
	},

	add_value: function(data)
	{
		this.set_placeholder(null);

		var element = wabi.createElement("listItemHolder", this);
		element.$item = this.itemCls;
		element.data = data;
	},

	remove_value: function(value)
	{
		if(!this.children) { return; }

		for(var n = 0; n < this.children.length; n++) 
		{
			var child = this.children[n];
			if(child.data === value) {
				this.remove(child);
				return;
			}
		}
	},

	set_placeholder: function(value)
	{
		if(value)
		{
			if(!this.domElement.innerHTML) {
				this.setCls("empty", true);
				this.html(value);
			}
		}
		else
		{
			this.setCls("empty", false);

			if(!this.children || this.children.length === 0) {
				this.html("")
			}
		}
	},

	set_itemCls: function(itemCls)
	{
		if(!itemCls) {
			return "listItem";
		}

		var cls = wabi.element[itemCls];
		if(!cls) {
			console.warn("(wabi.elements.list.set_itemCls) No such element found: " + itemCls);
			return "listItem";
		}
	},

	handleItemClick: function(event) {
		this.select = event.target;
	},

	createFolder: function()
	{
		var element = wabi.createElement("listItem", this);
		element.value = "Folder";
		element.folder = true;
	},

	set select(element)
	{
		if(!this.cache.selectable) { return; }

		element.select = true;
	},

	get select() {
		return this.cache.selected;
	},

	set selectable(value)
	{
		if(this.cache.selectable === value) { return; }
		this.cache.selectable = value;

		if(!value && this.cache.selected) {
			this.cache.selected = false;
		}
	},

	get selectable() {
		return this.cache.selectable;
	},

	//
	cache: null,

	itemCls: "listItem"
});

wabi.element("listItemHolder", 
{
	elements: 
	{
		item: null,
		list: {
			type: "list",
			bind: "content",
			link: "content"
		}
	},

	prepare: function()
	{
		// this.$elements.list.watch("open")
	},

	setup: function() {
		this.elements.list.cache = this.parent.cache;
	},

	set_item: function(cls)
	{
		this.elements.list.itemCls = cls;
		this.element("item", cls);
	},

	set_content: function(value)
	{
		this.elements.item.$folder = value ? true : false;
		// if(this.itemElement) {
		// 	this.itemElement.folder = value ? true : false;
		// }
	},

	set_draggable: function(value)
	{
		if(value) {
			this.attrib("draggable", "true");
		}
		else {
			this.attrib("draggable", "false");
		}
	},

	handle_dragstart: function(event) 
	{
		this.setCls("dragging", true);
		this.cache.dragging = this;

		event.domEvent.dataTransfer.effectAllowed = "move";
	},

	handle_dragend: function(event) 
	{
		this.setCls("dragging", false)
	},

	handle_dragenter: function(event) {
		this.setCls("dragover", true);
	},

	handle_dragleave: function(event) {
		this.setCls("dragover", false);
	},

	handle_dragover: function(event)
	{
		event.stop();
		event.domEvent.dataTransfer.dropEffect = "move";
	},

	handle_drop: function(event) 
	{
		if(this === this.cache.dragging) { return; }

		this.setCls("dragover", false);
		this.folder = true;

		var cacheData = this.cache.dragging.data;
		this.data.push("content", cacheData);

		event.stop();
	},

	updateOpen: function(event) {
		this.elements.list.hidden = !this.itemElement.open;
	},

	//
	tag: "holder",
	itemElement: null,
	draggable: false,
	region: true
});

wabi.element("listItem",
{
	elements: 
	{
		folder: null,
		word: {
			type: "text",
			link: "value",
			bind: "value"
		}
	},

	prepare: function()
	{
		this.attrib("tabindex", "0");

		this.on("click", "*", function() {
			this.select = true;
		}, this);
	},

	setup: function() {
		this.editable = false;
	},

	cleanup: function() 
	{
		if(this.cache.selected === this) {
			this.cache.selected = null;
		}
	},

	set select(value)
	{
		if(value)
		{
			if(this.cache.selected) {
				this.cache.selected.select = false;
			}

			this.cache.selected = this;
		}
		else
		{
			if(this.cache.selected !== this) { 
				this.cache.selected = null;
			}
		}

		this.setCls("selected", value);
	},

	get select() {
		return (this === this.cache.selected);
	},

	set_folder: function(value) 
	{
		this.slot("folder", value ? "caret" : null);

		if(value) {
			this.open = false;
		}
	},

	set_open: function(value) {},

	handle_click: function(event) {
		this.select = true;
	},

	handle_dblclick: function(event)
	{
		if(this.folder) {
			this.open = !this.open;
		}
	},

	get cache() {
		return this.parent.parent.cache;
	},

	//
	tag: "item"
});

wabi.element("editableListItem", "listItem",
{
	elements: 
	{
		folder: null,
		word: {
			type: "word",
			link: "value",
			bind: "value"
		}
	}
});
