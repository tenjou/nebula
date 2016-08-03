"use strict";

wabi.element("staticInput", 
{
	prepare: function()
	{
		this.attrib("readonly", "");
	},

	set_value: function(value) 
	{
		if(value instanceof wabi.data) {
			this.$domElement.value = value.raw.value;
		}
		else {
			this.$domElement.value = value;
		}
	},

	//
	$tag: "input",
	value: ""
});

wabi.element("dropdown",
{
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

	prepare: function()
	{
		this.on("click", "staticInput", this.openMenu, this);
		this.$elements.list.on("click", "*", this.selectOption, this);
	},

	setup: function()
	{
		// this.$elements.input.bind = "value";
		this.$elements.caret.value = "fa-caret-down";
		this.$elements.list.hidden = true;

		wabi.on("click", this.hideMenu, this);
	},

	set_value: function(value)
	{


		// console.log("dropdown", value);

		if(this.$dataset && value) 
		{
			var data = this.genDataBuffer();
			var selectedData = data.get(value);
			if(!selectedData) {
				this.$elements.input.data = null;
				return "";
			}

			this.$elements.input.data = selectedData;
		}
		else {
			this.$elements.input.data = null;
			return "";
		}
	},

	set_dataset: function(value)
	{
		if(!value) {
			this.$dataset = null;
			return;
		}

		this.$dataset = wabi.globalData.get(value);
		if(!this.$dataset) {
			console.log("(wabi.element.dropdown.set_dataset) Data set not found: " + value);
			return;
		}
	},

	set_emptyOption: function(value) {},

	set_open: function(value) {},

	openMenu: function(event)
	{
		event.stop();

		var list = this.$elements.list;
		list.removeChildren();

		if(!this.$dataset) { return; }

		list.value = this.genDataBuffer();
		list.hidden = false;
	},

	genDataBuffer: function()
	{
		var buffer = {};
		var data = new wabi.data(buffer);
		var raw = this.$dataset.raw;

		if(this.emptyOption) {
			buffer[""] = {};
		}

		for(var key in raw) {
			buffer[key] = raw[key];
		}

		return data;
	},

	hideMenu: function(event) {
		this.$elements.list.hidden = true;
	},

	selectOption: function(event)
	{
		event.stop();
		this.value = this.$elements.list.$cache.selected.data.id;
		this.hideMenu();
	},

	//
	$dataset: null,

	value: "",
	dataset: null,
	filter: null,
	sort: false,
	emptyOption: false
});
