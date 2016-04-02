"use strict";

Editor.controller("Inspect.Default",
{
	onLoad: function()
	{
		this.content.on("update", "General.Name", this.handleNameUpdate.bind(this));
	},

	onBindData: function()
	{
		this.content.get("General.Name").set(this.data.get("name"));
	},

	handleNameUpdate: function(event)
	{
		this.data.set("name", event.element.value);
		return true;
	}
});
