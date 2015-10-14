"use strict";

meta.class("EditorUI.Plate", 
{
	init: function()
	{
		var plate = document.createElement("div");
		plate.setAttribute("class", "plate");

		this.element = plate;
	},

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
		this.element.style.width = (width - (this.marginLeft + this.marginRight)) + "px";
	},

	set height(height) {
		this._height = height;
		this.element.style.height = (height - (this.marginTop + this.marginBottom)) + "px";
	},	

	get width() {
		return this._width;
	},

	get height() {
		return this._height;
	},	

	margin: function(top, right, bottom, left)
	{
		this.marginTop = top;
		this.marginRight = right;
		this.marginBottom = bottom;
		this.marginLeft = left;
		this.element.style.margin = top + "px " + right + "px " + bottom + "px " + left + "px";

		this.width = this._width;
		this.height = this._height;
	},


	//
	element: null,

	_width: 0,
	_height: 0,
	_x: 0,
	_y: 0,
	marginTop: 0, 
	marginRight: 0,
	marginBottom: 0,
	marginLeft: 0
});