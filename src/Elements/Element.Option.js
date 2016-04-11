"use strict";

meta.class("Element.Option", "Element.Basic",
{
	handleClick: function(domEvent)
	{
		domEvent.preventDefault();
		domEvent.stopPropagation();

		if(this._select === domEvent.target) { return; }

		if(this._select) {
			this._select.classList.remove("active");
		}
		this._select = domEvent.target;
		this._select.classList.add("active");

		this.emit("update", domEvent);
	},

	set options(options) 
	{
		this._options = options;
		this.removeAll();

		if(!options) { 
			this.value = null;
			return; 
		}

		var func = this.handleClick.bind(this);

		for(var n = 0; n < options.length; n++)
		{
			var option = document.createElement("option");
			option.onclick = func;
			option.innerHTML = options[n];
			this.append(option);
		}

		this.value = options[0];
	},

	get options() {
		return this._options;
	},

	getValue: function() 
	{
		if(this._select) {
			return this._select.innerHTML;
		}

		return null;
	},

	set value(value) 
	{
		if(!this._options) {
			value = "";
		}
		else if(value === void(0) || value === null) {
			value = this._value;
		}

		var newSelect = null;
		for(var n = 0; n < this._options.length; n++) 
		{
			if(this._options[n] === value) {
				newSelect = this.children[n];
				break;
			}
		}

		if(newSelect !== this._select) 
		{
			if(this._select) {
				this._select.classList.remove("active");
			}

			if(newSelect) {
				newSelect.classList.add("active");
			}

			this._select = newSelect;
		}
	},

	get value() {
		return this.getValue();
	},	
	
	//
	elementTag: "options",
	_options: null,
	_select: null,
	_default: ""
});
