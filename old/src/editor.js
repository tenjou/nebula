"use strict";

var editor =
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

		for(var key in editor.plugin) {
			new editor.plugin[key]();
		}

		init();

		var that = this;
		this._renderFunc = function() { that.render(); };
		this.render();
	},

	createMenu: function()
	{
		this.menu = document.createElement("div");
		this.menu.setAttribute("id", "menu");
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
		style.boxShadow = "-2px 0px 0px rgba(0, 0, 0, 0.07)";
		style.zIndex = "100";

		this.loadRightToolbar();
	},

	loadRightToolbar: function()
	{
		var palette = new PaletteWidget("palette");
		palette.loadAtlas("assets/tilemap.png", 32, 32);
		this.widgets.push(palette);	

		var layers = new LayerWidget("layers");
		this.widgets.push(layers);			
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
		style.left = (this.screenWidth - 200) + "px";

		style = this.screen.style;
		style.width = (this.screenWidth - 200) + "px";
		style.height = (this.screenHeight - 60) + "px";
		style.top = "30px";

		var num = this.widgets.length;
		for(var n = 0; n < num; n++) {
			this.widgets[n].updatePos();
		}
	},

	plugin: function(name, obj) {
		meta.class("editor.plugin." + name, obj);
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
};
