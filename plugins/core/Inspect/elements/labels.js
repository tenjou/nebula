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
	$tag: "label"
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
	$tag: "label"
});

"use strict";

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

	//
	$tag: "label"
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
	$tag: "label"
});

