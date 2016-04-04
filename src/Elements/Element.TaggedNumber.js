"use strict";

meta.class("Element.TaggedNumber", "Element.Number",
{
	onCreate: function() 
	{
		this.input = document.createElement("input");
		this._onCreate();
		this.append(this.input);
	},

	set tag(tag)
	{
		if(tag)
		{
			if(!this.tagElement) {
				this.tagElement = document.createElement("tag");
				this.insertBefore(this.tagElement, this.input);
			}
			else {
				this.tagElement.classList.remove("hidden");
			}

			this.tagElement.innerHTML = tag;
		}
		else if(this.tagElement) {
			this.tagElement.classList.add("hidden");
		}

		this._tag = tag;
	},

	get tag() {
		return this._tag;
	},

	set color(color) 
	{
		if(this._color === color) { return; }
		this._color = color;

		this.tagElement.style.background = color;
	},

	get color() {
		return this._color;
	},

	//
	elementTag: "tagged-number",

	_tag: null,
	tagElement: null,

	_color: null
});


    // position: absolute;
    // left: 118px;
    // top: 10px;
    // border-radius: 2px;
    // background: #D04031;
    // color: white;