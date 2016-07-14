"use strict";

wabi.element("dropdown",
{
	elements: 
	{
		input: {
			type: "input",
			link: "value"
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
		this.$elements.caret.state = "fa-caret-down";
		this.$elements.list.state.hidden = true;

		this.on("click", "input", this.openMenu, this);
		this.on("list", "select", this.selectOption, this);
		wabi.on("click", this.hideMenu, this);
	},

	set_value: function(value)
	{
		console.log("dropdown", value);
	},

	set_dataset: function(value)
	{
		var dataset = wabi.datasets[value];
		if(!dataset) {
			console.warn("(element.dropdown.set_dataset) Could not find dataset: " + value);
			return;
		}

		this.$dataset = dataset;
	},

	openMenu: function(event)
	{
		var list = this.$elements.list;
		list.removeAll();

		if(!this.$dataset) { return; }

		var items;
		if(this.emptyOption) {
			items = [ "" ];
		}
		else {
			items = [];
		}

		if(this.filter)
		{
			var key = Object.keys(this.filter)[0];
			var value = this.filter[key];

			for(var n = 0; n < this.$dataset.length; n++)
			{
				var item = this.$dataset[n];
				if(item.get(key) === value) {
					items.push(item);
				}
			}
		}
		else
		{
			for(var n = 0; n < this.$dataset.length; n++)
			{
				var item = this.$dataset[n];
				items.push(item);
			}			
		}

		list.value = items;
		list.hidden = false;

		event.stop();
	},

	hideMenu: function(event) {
		this.$elements.list.hidden = true;
	},

	selectOption: function(event)
	{
		console.log("select option")
	},

	//
	$dataset: null,

	dataset: null,
	filter: null,
	sort: false,
	emptyOption: false
});
