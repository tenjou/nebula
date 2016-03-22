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
			var buffer = event.element.id.split("*");
			var translatedBuffer = new Array(buffer.length);

			// translate:
			var data = this.currData;
			var num = data.length;
			
			var n, item, name;
			for(var i = 0; i < buffer.length; i++)
			{
				name = buffer[i];

				for(n = 0; n < num; n++) 
				{
					item = data[n];
					if(item.name === name) 
					{
						translatedBuffer[i] = item;
						if(item.content) {
							data = item.content;
							num = data.length;
						}
						break;
					}
				}	
			}

			this.cb(translatedBuffer);
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
		this.currData = data;
	},

	mergeMenus: function(a, b)
	{
		var menu = [].concat(a);

		this.appendMenu(menu, b);

		return menu;
	},

	appendMenu: function(a, b)
	{
		var itemA, itemB, nA;
		var numA = a.length;
		var numB = b.length;

		merge:
		for(var nB = 0; nB < numB; nB++) 
		{
			itemB = b[nB];
			for(nA = 0; nA < numA; nA++) 
			{
				itemA = a[nA];
				if(itemA.name === itemB.name)
				{
					if(itemB.content)
					{
						if(!itemA.content) {
							itemA.content = itemB.content;
						}
						else {
							itemA.content = this.mergeMenus(itemA.content, itemB.content);
						}
					}

					continue merge;
				}
			}

			a.push(itemB);
		}		
	},

	//
	menu: null,
	cb: null,
	currData: null
});
