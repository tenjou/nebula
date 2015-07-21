"use strict";

meta.class("Editor", 
{
	start: function()
	{
		this.createMenu();
		this.createFooter();
		this.createRightToolbar();
		this.createScreen();

		var self = this;
		window.addEventListener("resize", function() {
			self.onResize();
		}, false);

		this.onResize();

		init();

		var that = this;
		this._renderFunc = function() { that.render(); };
		this.render();
	},

	createMenu: function()
	{
		this.menu = document.createElement("div");
		this.menu.setAttribute("class", "menu");
		this.menu.style.height = "30px";
		document.body.appendChild(this.menu);

		this.createMenuLogo();
	},

	createMenuLogo: function()
	{
		var logo = document.createElement("div");
		logo.setAttribute("class", "logo");
		logo.innerHTML = "meta"
		this.menu.appendChild(logo);
	},

	createFooter: function()
	{
		this.footer = document.createElement("div");
		this.footer.setAttribute("class", "footer");
		this.footer.style.height = "30px";
		document.body.appendChild(this.footer);
	},

	createRightToolbar: function() 
	{
		this.rightToolbar = document.createElement("div");
		this.rightToolbar.setAttribute("class", "right-toolbar");
		document.body.appendChild(this.rightToolbar);

		var style = this.rightToolbar.style;
		style.width = "200px";
		style.backgroundColor = "black";
		style.borderLeft = "2px solid #111";

		this.loadRightToolbar();
	},

	loadRightToolbar: function()
	{
		var palette = new PaletteWidget("palette");
		palette.loadAtlas("assets/tilemap.png", 32, 32);
		this.widgets.push(palette);			
	},

	createScreen: function()
	{
		this.screen = document.createElement("div");
		this.screen.setAttribute("class", "screen");
		document.body.appendChild(this.screen);

		this.createCanvas();
	},

	createCanvas: function()
	{
		this.canvas = document.createElement("canvas");
		this.screen.appendChild(this.canvas);
	},

	addRender: function(widget) 
	{
		if(widget.flags & widget.Flag.RENDERING) { return; }

		this.renderWidgets.push(widget);
	},

	removeRender: function(widget)
	{
		if((widget.flags & widget.Flag.RENDERING) === 0) { return; }

		var num = this.widgets.length;
		for(var n = 0; n < num; n++) {
			if(this.widgets[n] === widget) {
				this.widgets.splice(n, 1);
			}
		}
	},

	render: function() 
	{
		var widget;
		var num = this.renderWidgets.length;
		for(var n = 0; n < num; n++) {
			widget = this.renderWidgets[n];
			if(widget.flags & widget.Flag.NEED_RENDER) {
				widget.render();
				widget.flags &= ~widget.Flag.NEED_RENDER;
			}
		}

		draw();

		window.requestAnimationFrame(this._renderFunc);
	},

	onResize: function()
	{
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;

		this.menu.style.width = this.screenWidth + "px";

		this.footer.style.width = this.screenWidth + "px";
		this.footer.style.top = (this.screenHeight - 30) + "px";

		var style = this.rightToolbar.style;
		style.height = (this.screenHeight - 60) + "px";
		style.top = "30px";
		style.left = (this.screenWidth - 202) + "px";

		style = this.screen.style;
		style.width = (this.screenWidth - 202) + "px";
		style.height = (this.screenHeight - 60) + "px";
		style.top = "30px";

		var num = this.widgets.length;
		for(var n = 0; n < num; n++) {
			this.widgets[n].updatePos();
		}
	},

	//
	screenWidth: 0,
	screenHeight: 0,

	menu: null,
	footer: null,
	rightToolbar: null,
	screen: null,
	canvas: null,

	widgets: [],
	renderWidgets: []
});
