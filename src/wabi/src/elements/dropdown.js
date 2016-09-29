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
			type: "staticInput",
			bind: "value",
			region: true
		},
		caret: {
			type: "icon",
			$value: "fa-caret-down"
		},
		list: "list"
	},

	setup: function()
	{
		this.elements.list.on("click", this.selectOption, this);
		
		this.on("click", "staticInput", this.openMenu, this);
		wabi.on("click", this.hideMenu, this);
	},

	cleanup: function()
	{
		wabi.off("click", this.hideMenu, this);
	},

	set_value: function(value)
	{
		if(this._dataset)
		{
			var data = this._dataset.get(value);
			if(!data) {
				this.elements.input.data = null;
				this.elements.input.$value = "";
				return "";
			}

			this.elements.input.data = data;
		}
		else {
			this.elements.input.data = null;
			this.elements.input.$value = "";
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
