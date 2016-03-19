"use strict";

Editor.controller("Inspect.Default",
{
	onLoad: function()
	{
		this.content.on("update", "General.Name", this.handleNameUpdate.bind(this));
	},

	onBindData: function()
	{
		this.content.get("General.Name").value = this.data.name;
	},

	handleNameUpdate: function(event)
	{
		this.data.name = event.element.value;
		this.content.emit("data-update");
		return true;
	}
});

