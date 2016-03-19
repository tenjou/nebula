"use strict";

meta.class("Element.Icon", "Element.Basic",
{
	onCreate: function() {
		this.addCls("fa");
	},

	set value(value) 
	{
		if(this._value) {
			this.removeCls(this._value);
		}

		this._value = value;
		this.addCls(this._value);
	},

	get value() {
		return this._value;
	},

	//
	elementTag: "icon",
	_value: null
});
