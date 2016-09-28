"use strict";

wabi.element("labelName",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		content: {
			type: "input",
			link: "value"
		}
	},

	//
	tag: "label"
});

wabi.element("labelNumber",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		content: {
			type: "number",
			link: "value"
		}
	},

	//
	tag: "label"
});

wabi.element("labelDropdown",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		dropdown: {
			type: "dropdown",
			link: "value"
		}
	},

	set_dataset: function(value) {
		this.elements.dropdown.$dataset = value;
	},

	set_emptyOption: function(value) {
		this.elements.dropdown.$emptyOption = value;
	},

	//
	tag: "label"
});

wabi.element("labelCheckbox",
{
	elements: 
	{
		name: {
			type: "text",
			link: "name"
		},
		content: {
			type: "checkbox",
			link: "value"
		}
	},

	//
	tag: "label"
});

