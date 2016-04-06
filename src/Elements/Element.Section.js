"use strict";

meta.class("Element.Section", "Element.Basic",
{
	onCreate: function()
	{
		var header = document.createElement("header");
		header.onclick = this.handleClick.bind(this);
		this.domElement.appendChild(header);

		this.caret = new Element.Caret(header);
		this.caret.open = true;
		this.caret.on("update", this.handleCaretUpdate.bind(this));

		this.h2 = document.createElement("h2");
		header.appendChild(this.h2);

		this.contentHolder = document.createElement("content");
		this.domElement.appendChild(this.contentHolder);
	},

	handleClick: function(domEvent)
	{
		domEvent.preventDefault();
		domEvent.stopPropagation();

		this.caret.open = !this.caret.open;
	},

	handleCaretUpdate: function(event)
	{
		if(this.caret.open) {
			this.contentHolder.classList.remove("hidden");
		}
		else {
			this.contentHolder.classList.add("hidden");
		}
	},

	set value(value) {
		this.h2.innerHTML = value;
	},

	get value() {
		return this.h2.innerHTML;
	},

	set open(value) {
		this.caret.open = value;
	},

	get open() {
		return this.caret.open;
	},

	//
	elementTag: "section",
	caret: null,
	h2: null,
});