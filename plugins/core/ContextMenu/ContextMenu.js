"use strict";

editor.plugin("contextmenu",
{
	create: function()
	{
		this.menus = {};

		this.contextmenu = wabi.createElement("contextmenu", editor.overlayElement);
		this.contextmenu.hidden = true;

		wabi.on("click", this.handleClick, this);
		wabi.on("contextmenu", this.handleContextmenu, this);
	},

	add: function(id, extend, props)
	{
		if(!props) {
			props = extend;
			extend = null;
		}

		if(this.menus[id]) {
			console.warn("(plugin.contextmenu.add) There is already contextmenu with id: " + id);
			return;
		}

		this.menus[id] = new this.Menu(id, extend, props);
	},

	show: function(id, x, y)
	{
		var menu = this.menus[id];
		if(!menu) {
			console.warn("(plugin.contextmenu.show) No such contextmenus found: " + id);
			return;
		}

		if(menu.extend) {
			console.log("extend");
		}

		this.contextmenu.position(event.x, event.y);
		this.contextmenu.value = menu.props;
		this.contextmenu.hidden = false;
	},

	hide: function() {
		this.contextmenu.hidden = true;
	},

	handleClick: function(event) {
		this.contextmenu.hidden = true;
	},

	handleContextmenu: function(event) {
		event.domEvent.preventDefault();
	},

	Menu: function(id, extend, props)
	{
		this.id = id;
		this.props = props;

		if(this.extend)
		{
			if(typeof(extend) === "string") {
				this.extend = [ extend ];
			}
			else {
				this.extend = extend;
			}
		}
		else {
			this.extend = null;
		}
	},

	//
	menus: null,
	contextmenu: null
});
