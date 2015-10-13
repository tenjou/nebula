"use strict";

var editor =
{
	start: function()
	{
		this.createScreen();

		var self = this;
		window.addEventListener("resize", function() {
			self.onResize();
		}, false);

		// fileSystem:
		this.fileSystem = new Editor.FileSystem();
		this.fileSystem.onReady.add(function() {
			editor.load();
		});
	},

	load: function()
	{
		this.fileSystem.read("editor.json",
			function(result) 
			{
				if(!result) {
					editor.createJSON();
				}
				else {
					editor.loadJSON(result);
				}
			});
	},

	createJSON: function()
	{
		this.data = {};

		this.fileSystem.create("editor.json", 
			function() {
				editor.continueLoad();
			});
	},

	loadJSON: function(contents)
	{
		this.data = JSON.parse(contents);

		editor.continueLoad();
	},

	saveJSON: function()
	{
		var contents = JSON.stringify(this.data);

		this.fileSystem.write("editor.json", contents,
			function() {
				console.log("[db saved]");
			});
	},

	continueLoad: function()
	{
		this.rooms = {};
		editor.registerRoom(Assets.Room);

		this.onResize();

		this.saveJSON();
	},

	registerRoom: function(cls) 
	{
		var room = new cls();

		var roomData = {};
		this.data[room.name] = roomData;
		this.rooms[room.name] = room;
		room.load(roomData);
	},

	createScreen: function()
	{
		this.screen = document.createElement("div");
		this.screen.setAttribute("class", "screen");
		document.body.appendChild(this.screen);

		// var margin = 5;

		// this.headerPlate = new EditorUI.Plate();
		// this.screen.appendChild(this.headerPlate.element);

		// this.leftPlate = new EditorUI.Plate();
		// this.leftPlate.margin(margin, 0, margin, 0);
		// this.screen.appendChild(this.leftPlate.element);

		// this.rightPlate = new EditorUI.Plate();
		// this.rightPlate.margin(margin, 0, margin, 0);
		// this.screen.appendChild(this.rightPlate.element);	

		// this.viewportPlate = new EditorUI.Plate();
		// this.viewportPlate.margin(margin, margin, margin, margin);
		// this.screen.appendChild(this.viewportPlate.element);

		// meta.engine.container = this.viewportPlate.element;	

		// this.header = new EditorUI.Header();
		// this.screen.appendChild(this.header.element);

		// //
		// var widgetFlags = EditorUI.WidgetFlag;

		// this.widget = new EditorUI.Widget(widgetFlags.HEADER | widgetFlags.FOOTER);
		//this.screen.appendChild(this.widget.element);
	},

	onResize: function()
	{
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;

		var style = this.screen.style;
		style.width = this.screenWidth + "px";
		style.height = this.screenHeight + "px";

		for(var key in this.rooms) {
			this.rooms[key].handleResize();
		}

		// console.log(this.screenWidth, this.screenHeight);

		// this.headerPlate.width = this.screenWidth;
		// this.headerPlate.height = 30;

		// this.leftPlate.width = 210;
		// this.leftPlate.height = this.screenHeight - this.headerPlate.height;
		// this.leftPlate.y = this.headerPlate.height;

		// this.rightPlate.width = 210;
		// this.rightPlate.height = this.screenHeight - this.headerPlate.height;
		// this.rightPlate.x = this.screenWidth - this.rightPlate.width;
		// this.rightPlate.y = this.headerPlate.height;

		// this.viewportPlate.width = this.screenWidth - 420;
		// this.viewportPlate.height = this.screenHeight - 30;
		// this.viewportPlate.x = this.rightPlate.width;
		// this.viewportPlate.y = this.headerPlate.height;
	},

	//
	data: null,

	screen: null,

	header: null,
	widget: null,

	screenWidth: 0,
	screenHeight: 0,

	rooms: null
};

meta.onInit = function() {
	meta.engine.container = document.getElementById("stuff");
	editor.start();
};