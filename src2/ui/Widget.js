"use strict";

meta.class("EditorUI.Widget", "EditorUI.Element",
{
	init: function(flags)
	{
		this.flags = flags;

		this.create();
	},

	create: function()
	{
		var widget = document.createElement("div");
		widget.setAttribute("class", "element widget");

		var table = document.createElement("table");
		widget.appendChild(table);

		if(this.flags & EditorUI.WidgetFlag.HEADER)
		{
			var headerTr = document.createElement("tr");
			headerTr.setAttribute("class", "header");
			table.appendChild(headerTr);
			this.header = document.createElement("td");
			headerTr.appendChild(this.header);

			var text = document.createElement("span");
			text.setAttribute("class", "tab");
			text.innerHTML = "Header";
			this.header.appendChild(text);			
		}

		var bodyTr = document.createElement("tr");
		bodyTr.setAttribute("class", "body");
		table.appendChild(bodyTr);
		this.body = document.createElement("td");
		bodyTr.appendChild(this.body);

			var text = document.createElement("span");
			text.setAttribute("class", "tab");
			text.innerHTML = "Body";
			this.body.appendChild(text);			

		if(this.flags & EditorUI.WidgetFlag.FOOTER)
		{
			var footerTr = document.createElement("tr");
			footerTr.setAttribute("class", "footer");
			table.appendChild(footerTr);			
			this.footer = document.createElement("td");
			footerTr.appendChild(this.footer);

			var text = document.createElement("span");
			text.setAttribute("class", "tab");
			text.innerHTML = "Footer";
			this.footer.appendChild(text);			
		}

		this.element = widget;
		this.flags |= EditorUI.WidgetFlag.CREATED;
	},

	//
	header: null,
	body: null,
	footer: null,

	flags: 0
});

EditorUI.WidgetFlag = {
	CREATED: 1,
	HEADER: 2,
	FOOTER: 4
};
