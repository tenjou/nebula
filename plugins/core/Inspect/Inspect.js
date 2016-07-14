"use strict";

editor.plugin("inspect",
{
	create: function()
	{
		wabi.addFragment("inspect-general",
		{
			type: "section",
			name: "General",
			value: [
				{
					type: "labelName",
					bind: "value",
					name: "Name"
				}						
			]
		});

		wabi.addFragment("inspect-texture", "inspect-general",
		{
			type: "section",
			name: "Texture",
			value: [
				{
					type: "image",
					bind: "id",
				}
			]
		});
	},

	onStart: function()
	{
		var toolbarContent = editor.plugins.layout.toolbarInspect.$elements.content;

		this.content = wabi.createElement("content");
		this.content.appendTo(toolbarContent);
	},

	show: function(data)
	{
		var props = wabi.getFragment("inspect-" + data.get("type"));
		if(!props) {
			props = wabi.getFragment("inspect-general");
		}

		this.content.value = props;
		this.content.data = data;
	},

	//
	content: null,
	toolbarContent: null
});
