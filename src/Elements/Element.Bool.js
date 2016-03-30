"use strict";

meta.class("Element.Bool", "Element.Option",
{
	onCreate: function() {
		this.options = [ true, false ];
	},

	getValue: function()
	{
		if(this._select) {
			return (this._select.innerHTML === "true") ? true : false;
		}
		
		return false;
	}
});
