"use strict";

Editor.plugin("ContextMenu", 
{
	onSplashStart: function()
	{
		this.menu = new Element.ContextMenu(editor.overlay);
		this.menu.enable = false;
		this.menu.on("click", "*", this.handleMenuChoice.bind(this));

		document.body.onclick = this.handleClick.bind(this);
	},

	handleMenuChoice: function(event)
	{
		if(this.cb) 
		{
			var buffer = event.element.id.split(".");
			this.cb(buffer);
			this.hide();
		}

		return true;
	},

	handleClick: function(domEvent) {
		this.hide();
	},

	hide: function() {
		this.menu.enable = false;
		this.cb = null;
	},

	show: function(data, x, y, cb)
	{
		this.menu.domElement.innerHTML = "";
		this.menu.fill(data);
		this.menu.position(x, y);
		this.menu.enable = true;
		this.cb = cb;
	},

	//
	menu: null,
	cb: null
});
