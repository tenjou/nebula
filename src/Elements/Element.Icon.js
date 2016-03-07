"use strict";

meta.class("Element.Icon", "Element.Basic",
{
	onCreate: function() {
		this.addCls("fa");
	},

	set type(type) 
	{
		if(this._type) {
			this.removeCls(this._type);
		}

		this._type = type;
		this.addCls(this._type);
	},

	get type() {
		return this._type;
	},

	//
	elementTag: "icon",
	_type: null
});
