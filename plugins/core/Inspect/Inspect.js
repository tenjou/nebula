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
					bind: "@",
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

	add: function(id, props)
	{

	},

	show: function(data)
	{
		if(!data) {
			this.content.value = "";
			this.content.data = null;
			return;
		}
		
		var props = wabi.getFragment("inspect-" + data.get("type"));
		if(!props) {
			props = wabi.getFragment("inspect-general");
		}

		this.content.data = null;
		this.content.value = props;
		this.content.data = data;
	},

	//
	content: null,
	toolbarContent: null
});
