"use strict";

meta.class("EditorUI.Element", 
{
	set x(x) {
		this._x = x;
		this.element.style.left = x + "px";
	},

	set y(y) {
		this._y = y;
		this.element.style.top = y + "px";
	},	

	get x() {
		return this._x;
	},

	get y() {
		return this._y;
	},

	set width(width) {
		this._width = width;
		this.element.style.width = (width - (this._margin * 2)) + "px";
	},

	set height(height) {
		this._height = height;
		this.element.style.height = (height - (this._margin * 2)) + "px";
	},	

	get width() {
		return this._width;
	},

	get height() {
		return this._height;
	},	

	set margin(margin) 
	{
		this._margin = margin;
		this.element.style.margin = margin + "px";

		this.width = this._width;
		this.height = this._height;
	},

	get margin() {
		return this._margin;
	},

	//
	element: null,

	_width: 0,
	_height: 0,
	_x: 0,
	_y: 0,
	_margin: 0
});
