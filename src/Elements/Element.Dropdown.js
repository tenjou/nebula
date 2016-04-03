"use strict";

meta.class("Element.Dropdown", "Element.Basic",
{
	onCreate: function()
	{
		this.items = [];

		this.input = document.createElement("input");
		this.input.setAttribute("type", "text");
		this.input.setAttribute("readonly", "");
		this.input.onclick = this.handleClick.bind(this);
		this.input.onchange = this.handleChange.bind(this);
		this.input.onkeydown = this.handleKeyDown.bind(this);
		this.append(this.input);

		var icon = new Element.Icon(this);
		icon.value = "fa-caret-down";
		icon.domElement.onclick = this.handleClick.bind(this);

		this.list = new Element.List(this);
		this.list.hidden = true;
		this.list.info = "Nothing found";
		this.list.on("click", "item", this.handleItemClick.bind(this));
	},

	fill: function(data)
	{
		this.list.removeAll();
		this.items.length = 0;

		if(!data) { return; }

		if(data.type === "content") {
			this._fill_content(data.buffer);
		}
		else {
			this.items = this.items.concat(data.buffer);
		}

		if(this.sort)
		{
			this.items.sort(function(a, b) {
				if(a < b) { return -1; }
				if(a > b) { return 1; }
				return 0;
			});	
		}

		for(var n = 0; n < this.items.length; n++) {
			this.list.createItem(this.items[n]);			
		}

		window.drop = this;
	},

	_fill_content: function(data)
	{
		if(!data) { return; }

		for(var n = 0; n < data.length; n++)
		{
			var dataItem = data[n];
			if(dataItem._type === "folder") {
				this._fill_content(dataItem.content);
			}
			else 
			{
				if(!this._filterType || this._filterType === dataItem._type) {
					this.items.push(dataItem.name);
				}
			}
		}		
	},

	process: function(value)
	{
		var prevValue = this.value;
		this.value = value;

		if(prevValue !== this.value) {
			this.emit("update");
		}	

		this.input.blur();
		this.hideList();
	},

	showList: function()
	{
		if(!this._cachedClickFunc) {
			this._cachedClickFunc = this.handleHide.bind(this);
		}
		editor.on("click", this._cachedClickFunc);

		this.prevValue = this._value;
		this.fill(this._dataset);
		this.list.hidden = false;
	},

	hideList: function()
	{
		if(!this.list.hidden) 
		{
			editor.off("click", this._cachedClickFunc);
			this.list.hidden = true;
		}
	},

	handleHide: function(domEvent) 
	{
		if(domEvent.target !== this.input) {
			this.hideList();
		}
	},

	handleChange: function(domEvent) {
		this.process(this.input.value);
	},

	handleClick: function(domEvent) {
		this.showList();
	},

	handleKeyDown: function(domEvent) 
	{
		domEvent.preventDefault();
		domEvent.stopPropagation();

		var keyCode = domEvent.keyCode;
		switch(keyCode)
		{
			case 27: { // Esc
				domEvent.target.blur();
				this.hideList();
			} break;
		}
	},

	handleItemClick: function(event) 
	{
		this.process(event.element.name);

		return true;
	},

	set value(value)
	{
		if(!this.items) { 
			this._value = this.default;
			this.prevValue = this._value;
		}
		else
		{
			var found = false;
			for(var n = 0; n < this.items.length; n++) 
			{
				if(value === this.items[n]) {
					found = true;
					break;
				}
			}
		}

		if(found) { 
			this._value = value;
			this.prevValue = this._value;
		}
		else {
			this._value = this.prevValue;
		}

		this.input.value = this._value;
	},

	get value() {
		return this._value;
	},

	set dataset(name) 
	{
		this.datasetName = name;
		this._dataset = editor.getDataset(name);
		this.fill(this._dataset);
	},

	get dataset() {
		return this.datasetName;
	},

	set filterType(filter) {
		this._filterType = filter;
	},

	get filterType() {
		return this._filterType;
	},

	set sort(value) {
		this._sort = value;
	},

	get sort() {
		return this._sort;
	},

	//
	elementTag: "dropdown",

	input: null,
	list: null,

	items: null,

	datasetName: null,
	_dataset: null,
	_filter: null,
	_sort: false,

	_cachedClickFunc: null
});
