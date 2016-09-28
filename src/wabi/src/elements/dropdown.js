"use strict";

wabi.element("dropdown",
{
	state: 
	{
		value: "",
		dataset: null,
		filter: null,
		sort: false,
		emptyOption: false		
	},

	elements: 
	{
		input: {
			type: "staticInput"
		},
		caret: {
			type: "icon"
		},
		list: {
			type: "list",
			link: "list"
		}
	},

	setup: function()
	{
		this.elements.input.flags |= this.Flag.REGION;

		this.on("click", "staticInput", this.openMenu, this);
		this.elements.list.on("click", "*", this.selectOption, this);

		this.elements.input.bind = "value";
		this.elements.caret.$value = "fa-caret-down";
		this.elements.list.hidden = true;

		// wabi.on("click", this.hideMenu, this);
	},

	set_value: function(value)
	{
		if(this._dataset) 
		{
			var data = this.genDataBuffer();
			var selectedData = data.get(value);
			if(!selectedData) {
				this.elements.input.data = null;
				return "";
			}

			this.elements.input.data = selectedData;
		}
		else {
			this.elements.input.data = null;
			return "";
		}
	},

	set_dataset: function(value)
	{
		if(!value) {
			this._dataset = null;
			return;
		}

		this._dataset = wabi.globalData.get(value);
		if(!this._dataset) {
			console.log("(wabi.element.dropdown.set_dataset) Data set not found: " + value);
			return;
		}
	},

	openMenu: function(event)
	{
		event.stop();

		var list = this.elements.list;
		list.removeAll();

		if(!this._dataset) { return; }

		list.$value = this.genDataBuffer();
		list.hidden = false;
	},

	genDataBuffer: function()
	{
		var buffer = {};
		var data = new wabi.data(buffer);
		var raw = this._dataset.raw;

		if(this.$emptyOption) {
			buffer[""] = { value: "" };
		}

		for(var key in raw) {
			buffer[key] = raw[key];
		}

		return data;
	},

	hideMenu: function(event) {
		this.elements.list.hidden = true;
	},

	selectOption: function(event)
	{
		event.stop();
		this.$value = this.elements.list.cache.selected.data.id;
		this.hideMenu();
	},

	//
	_dataset: null,
});
