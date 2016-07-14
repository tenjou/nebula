"use strict";

wabi.element("list",
{
	prepare: function() 
	{
		this.on("click", "listItem", this.handleItemClick, this);
	},

	setup: function()
	{
		this.$cache = {
			itemElements: [],
			selectable: true,
			selected: null
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
						this.add_value(this.data.get(n));
					}
				}
				else
				{
					for(var key in value) {
						this.add_value(this.data.get(key));
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

		var element = wabi.createElement("listItem", this);
		element.data = data;
	},

	remove_value: function(value, id)
	{

	},

	set_placeholder: function(value)
	{
		if(value)
		{
			if(!this.$domElement.innerHTML) {
				this.setCls("empty", true);
				this.$domElement.innerHTML = value;
			}
		}
		else
		{
			this.setCls("empty", false);

			if(!this.$children || this.$children.length === 0) {
				this.$domElement.innerHTML = "";
			}
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
		if(!(element instanceof wabi.elements.listItem)) { return; }
		if(!this.$cache.selectable) { return; }

		element.select = true;
	},

	get select() {
		return this.$cache.selected;
	},

	set selectable(value)
	{
		if(this.$cache.selectable === value) { return; }
		this.$cache.selectable = value;

		if(!value && this.cache.selected) {
			this.$cache.selected = false;
		}
	},

	get selectable() {
		return this.$cache.selectable;
	},

	//
	$cache: null
});

wabi.element("listItem",
{
	elements: 
	{
		caret: {
			type: "caret",
			link: "folder"
		},
		icon: {
			type: "icon",
			link: "icon"
		},
		name: {
			type: "word",
			link: "value"
		},
		tag: {
			type: "tag",
			link: "tag"
		}
	},

	prepare: function()
	{
		this.attrib("tabindex", "0");
		this.$flags |= this.Flag.REGION;
	},

	setup: function()
	{
		this.$elements.caret.bind = "folder";
		this.$elements.icon.bind = "icon";
		this.$elements.name.bind = "value",
		this.$elements.tag.bind = "tag";	
		this.$elements.caret.hidden = true;	
	},

	set_select: function(value)
	{
		var cache = this.$parent.$cache;

		if(value)
		{
			if(cache.selected) {
				cache.selected.select = false;
			}

			cache.selected = this;
		}
		else
		{
			if(cache.selected !== this) { return; }
			cache.selected = null;
		}

		this.setCls("selected", value);
		this.emit("select");
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

	handle_click: function(event)
	{
		if(this.folder) {
			this.folder = !this.folder;
		}
	},

	//
	$tag: "item",

	open: false,
	select: false,
	folder: false,
	draggable: false
});
