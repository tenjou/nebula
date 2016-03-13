"use strict";

Editor.Plugin("ContextMenu", 
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
			if(event.id !== "item") {
				this.buffer = [ event.element.value ];
			}
			else 
			{
				if(this.buffer) {
					this.buffer.unshift(event.element.value);
				}
				else {
					this.buffer = [ event.element.value ];
				}
				
				this.cb(this.buffer);
				this.buffer = null;
			}
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
	buffer: null,
	cb: null
});
