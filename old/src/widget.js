"use strict";

meta.class("Widget", 
{
	init: function(name, params) 
	{
		if(params) {
			this.params = params;
		}

		this.flags |= this.Flag.VISIBLE;

		var self = this;
		
		this.parentElement = document.createElement("div");
		this.parentElement.setAttribute("class", "widget");

		this.headerElement = document.createElement("div");
		this.headerElement.setAttribute("class", "header");
		this.headerElement.addEventListener("click", function() {
			self.toggleVisible();
		});
		this.parentElement.appendChild(this.headerElement);

		this.headerIcon = document.createElement("i");
		this.headerIcon.setAttribute("class", "fa fa-chevron-down");
		this.headerElement.appendChild(this.headerIcon);

		var headerName = document.createElement("span");
		headerName.setAttribute("class", "name");
		headerName.innerHTML = name;
		this.headerElement.appendChild(headerName);

		this.element = document.createElement("div");
		this.element.setAttribute("class", "content");
		this.parentElement.appendChild(this.element);

		editor.rightToolbar.appendChild(this.parentElement);

		this.onCreate();
	},

	updatePos: function()
	{
		this.x = 2;
		this.y = 0;

		var element = this.element;
		do 
		{
			this.x += element.offsetLeft || 0;
			this.y += element.offsetTop || 0;
			element = element.offsetParent;
		} while(element);
	},

	toggleVisible: function()
	{
		if(this.flags & this.Flag.VISIBLE) {
			this.element.style.display = "none";
			this.headerIcon.setAttribute("class", "fa fa-chevron-right");
			this.flags &= ~this.Flag.VISIBLE;
		}
		else {
			this.element.style.display = "block";
			this.headerIcon.setAttribute("class", "fa fa-chevron-down");
			this.flags |= this.Flag.VISIBLE;
		}
	},

	_subscribeInput: function() 
	{
		if(this.flags & this.Flag.INPUT) { return; }

		var that = this;

		this._onInputDown = function(event) {
			if(that.onInputDown) { that.onInputDown(event); }
		};
		this._onInputUp = function(event) {
			if(that.onInputUp) { that.onInputUp(event); }
		};
		this._onInputMove = function(event) {
			if(that.onInputMove) { that.onInputMove(event); }
		};				

		this.element.addEventListener("mousedown", this._onInputDown);
		this.element.addEventListener("mouseup", this._onInputUp);
		this.element.addEventListener("mousemove", this._onInputMove);	
	},

	_unsubscribeInput: function() 
	{
		if((this.flags & this.Flag.INPUT) === 0) { return; }

		this.element.removeEventListener("mousedown", this._onInputDown);
		this.element.removeEventListener("mouseup", this._onInputUp);
		this.element.removeEventListener("mousemove", this._onInputMove);	
	},

	_onInputDown: null,
	_onInputUp: null,
	_onInputMove: null,

	set input(value) 
	{
		if(value) {
			this._subscribeInput();
		}
		else {
			this._unsubscribeInput();
		}
	},

	get input() { 
		return (this.flags & this.Flag.INPUT) === 0; 
	},

	set rendering(value)
	{
		if(value) {
			editor.addRender(this);
		}
		else {
			editor.removeRender(this);
		}
	},

	get rendering() {
		return (this.flags & this.Flag.RENDERING) === 0; 
	},

	get contentHeader()
	{
		if(!this._contentHeader) {
			this._contentHeader = document.createElement("div");

			if(this.element.children.length > 0) {
				this.element.insertBefore(this._contentHeader, this.element.children[0]);
			}
			else {
				this.element.appendChild(this._contentHeader);
			}
		}

		return this._contentHeader;
	},

	Flag: {
		INPUT: 1 << 0,
		RENDERING: 1 << 1,
		NEED_RENDER: 1 << 2,
		VISIBLE: 1 << 3
	},

	//
	x: 0, y: 0,

	parentElement: null,
	headerElement: null,
	headerIcon: null,
	element: null,
	_contentHeader: null,

	params: null,
	flags: 0
});

meta.class("UI.Menu", 
{
	init: function(owner)
	{
		this.element = document.createElement("ul");
		this.element.setAttribute("class", "menu");
		owner.contentHeader.appendChild(this.element);
	},

	addOption: function(name, cb) 
	{
		var option = document.createElement("li");
		option.addEventListener("click", cb);
		option.innerHTML = name;
		this.element.appendChild(option);
	},

	//
	element: null
});

meta.class("PaletteWidget", "Widget", 
{
	onCreate: function() 
	{
		this.input = true;
		this.rendering = true;

		this.canvas = document.createElement("canvas");
		this.canvas.width = this.element.clientWidth;
		this.canvas.setAttribute("id", "stuff");
		this.ctx = this.canvas.getContext("2d");
		this.ctx.save();
		this.element.appendChild(this.canvas);

		this.cursor = document.createElement("canvas");
		this.cursorCtx = this.cursor.getContext("2d");

		this.checker = document.createElement("canvas");
		this.checkerCtx = this.checker.getContext("2d");
	},

	_prepareAtlas: function()
	{	
		this.scale = this.element.clientWidth / this.atlas.width;
		this.numGridX = Math.floor(this.atlas.width / this.cellWidth);
		this.numGridY = Math.floor(this.atlas.height / this.cellHeight);
		this.canvas.height = Math.ceil(this.atlas.height * this.scale);

		this.ctx.restore();
		this.ctx.save();
		this.ctx.scale(this.scale, this.scale);
		this.ctx.imageSmoothingEnabled = false;	

		this._resizeCursor();
		this._resizeCheckers();

		this.flags |= this.Flag.NEED_RENDER;
	},

	loadAtlas: function(path, cellWidth, cellHeight) 
	{
		var that = this;

		this.cellWidth = cellWidth;
		this.cellHeight = cellHeight;

		this.atlas = new Image();
		this.atlas.onload = function() {
			that._prepareAtlas();
		};
		this.atlas.src = path;
	},

	_resizeCursor: function()
	{
		this.cursor.width = this.cellWidth;
		this.cursor.height = this.cellHeight;

		this.cursorCtx.beginPath();
		this.cursorCtx.strokeStyle = "black";
		this.cursorCtx.lineWidth = 1;		
		this.cursorCtx.moveTo(0.5, 0.5);
		this.cursorCtx.lineTo(0.5, this.cellHeight - 0.5);
		this.cursorCtx.lineTo(this.cellWidth - 0.5, this.cellHeight - 0.5);
		this.cursorCtx.lineTo(this.cellWidth - 0.5, 0.5);
		this.cursorCtx.lineTo(0, 0.5);
		this.cursorCtx.stroke();		

		this.cursorCtx.beginPath();
		this.cursorCtx.strokeStyle = "white";
		this.cursorCtx.lineWidth = 2;		
		this.cursorCtx.moveTo(2, 2);
		this.cursorCtx.lineTo(2, this.cellHeight - 2);
		this.cursorCtx.lineTo(this.cellWidth - 2, this.cellHeight - 2);
		this.cursorCtx.lineTo(this.cellWidth - 2, 2);
		this.cursorCtx.lineTo(1, 2);
		this.cursorCtx.stroke();

		this.cursorCtx.beginPath();
		this.cursorCtx.strokeStyle = "black";
		this.cursorCtx.lineWidth = 1;
		this.cursorCtx.moveTo(3.5, 3.5);
		this.cursorCtx.lineTo(3.5, this.cellHeight - 3.5);
		this.cursorCtx.lineTo(this.cellWidth - 3.5, this.cellHeight - 3.5);
		this.cursorCtx.lineTo(this.cellWidth - 3.5, 3.5);
		this.cursorCtx.lineTo(3.5, 3.5);		
		this.cursorCtx.stroke();		
	},

	_resizeCheckers: function()
	{
		this.checker.width = this.cellWidth;
		this.checker.height = this.cellHeight;	

		var halfWidth = this.cellWidth / 2;
		var halfHeight = this.cellHeight / 2;

		this.checkerCtx.fillStyle = "#fff";
		this.checkerCtx.fillRect(0, 0, this.cellWidth, this.cellHeight);

		this.checkerCtx.fillStyle = "#ccc";	
		this.checkerCtx.fillRect(0, 0, halfWidth, halfWidth);
		this.checkerCtx.fillRect(halfWidth, halfHeight, this.cellWidth, this.cellHeight);
	},

	render: function()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for(var x = 0; x < this.numGridX; x++) {
			for(var y = 0; y < this.numGridY; y++) {
				this.ctx.drawImage(this.checker, x * this.cellWidth, y * this.cellHeight);
			}
		}

		this.ctx.drawImage(this.atlas, 0, 0);
		this.ctx.drawImage(this.cursor, this.cursorX, this.cursorY);
	},

	onInputDown: function(event)
	{
		var x = (event.clientX - this.x) / this.scale;
		var y = (event.clientY - this.y) / this.scale;
		this.gridX = Math.floor(x / this.cellWidth);
		this.gridY = Math.floor(y / this.cellHeight);
		this.cursorX = this.gridX * this.cellWidth;
		this.cursorY = this.gridY * this.cellHeight;

		this.flags |= this.Flag.NEED_RENDER;
	},

	//
	canvas: null,
	ctx: null,

	scale: 1,
	gridX: 0, gridY: 0,
	numGridX: 0, numGridY: 0,

	cursor: null,
	cursorCtx: null,
	cursorX: 0, cursorY: 0,

	checker: null,
	checkerCtx: null,

	atlas: null,
	cellWidth: 0, cellHeight: 0 
});

meta.class("LayerWidget", "Widget",
{
	onCreate: function()
	{
		var self = this;

		this.menu = new UI.Menu(this);
		this.menu.addOption("new", function() {
			self.onNew();
		});
		
		this.loadLayers();
	},

	loadLayers: function()
	{
		meta.subscribe(this, "create-layer", this._onCreateLayerCb);

		this.list = document.createElement("ul");

		var num = layers.length;
		for(var n = 0; n < num; n++) {
			this.createLayer(layer);
		}

		this.element.appendChild(this.list);
	},

	onNew: function()
	{
		console.log("new");
	},

	_onCreateLayerCb: function(layer) 
	{
		console.log(layer.name)
		var layerElement = document.createElement("li");

		var visibleButton = document.createElement("i");
		visibleButton.setAttribute("class", "fa fa-eye");
		layerElement.appendChild(visibleButton);

		var name = document.createElement("span");
		name.setAttribute("contenteditable", "true");
		name.innerHTML = layer.name;
		layerElement.appendChild(name);

		var deleteButton = document.createElement("i");
		deleteButton.setAttribute("class", "fa fa-times");
		layerElement.appendChild(deleteButton);

		this.list.appendChild(layerElement);
	},

	//
	list: null
});
