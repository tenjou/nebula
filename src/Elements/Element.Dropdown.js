"use strict";

meta.class("Element.Dropdown", "Element.Basic",
{
	onCreate: function()
	{
		this.items = [];

		this.input = document.createElement("input");
		this.input.setAttribute("type", "text");
		this.input.onclick = this.handleClick.bind(this);
		this.input.onchange = this.handleChange.bind(this);
		this.append(this.input);

		var icon = new Element.Icon(this);
		icon.value = "fa-caret-down";

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

		this.items.sort(function(a, b) {
			if(a < b) { return -1; }
			if(a > b) { return 1; }
			return 0;
		});

		for(var n = 0; n < this.items.length; n++) {
			this.list.createItem(this.items[n]);			
		}
	},

	_fill_content: function(data)
	{
		for(var n = 0; n < data.length; n++)
		{
			var dataItem = data[n];
			if(dataItem.type === "folder") {
				this._fill_content(dataItem.content);
			}
			else 
			{
				if(!this._filterType || this._filterType === dataItem.type) {
					this.items.push(dataItem.name);
				}
			}
		}		
	},

	process: function()
	{
		var newValue = this.input.value;
		if(!newValue) { newValue = null; }

		if(this._value === newValue) {
			return;
		}

		if(newValue !== null)
		{
			var found = false;
			for(var n = 0; n < this.items.length; n++) 
			{
				if(newValue === this.items[n]) {
					found = true;
					break;
				}
			}

			if(!found) { 
				this.value = this.prevValue;
				return;
			}
		}

		this._value = newValue;
		this.emit("update");		
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
		this.process();
	},

	handleClick: function(domEvent)
	{
		if(domEvent.target === this.input) {
			this.showList();
		}
	},

	handleItemClick: function(event) 
	{
		this.input.value = event.element.name;
		
		this.process();
		this.hideList();

		return true;
	},

	set value(value)
	{
		if(!value) { value = null; }

		this._value = value;

		if(value) {
			this.input.value = value;
		}
		else {
			this.input.value = "";
		}
	},

	get value() {
		return this._value;
	},

	set dataset(name) 
	{
		this.datasetName = name;
		this._dataset = editor.getDataset(name);
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

	//
	elementTag: "dropdown",

	input: null,
	list: null,

	prevValue: null,
	_value: null,
	items: null,

	datasetName: null,
	_dataset: null,
	_filter: null,

	_cachedClickFunc: null
});
