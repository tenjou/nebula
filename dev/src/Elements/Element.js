"use strict";

meta.class("Editor.Element",
{
	init: function(parent)
	{
		this.element = document.createElement(this.elementTag);
		this.element.holder = this;

		if(parent) {
			parent.append(this.element);
			this.parent = parent;
		}
		else {
			document.body.appendChild(this.element);
		}

		if(this.onCreate) {
			this.onCreate();
		}
	},

	onCreate: null,

	append: function(element) {
		this.element.appendChild(element);
	},

	emit: function(event) {
		this._emit("", event, this);
	},

	_emit: function(id, event, element) 
	{
		if(!id) {
			id = this.elementTag;
		}
		else {
			id = this.elementTag + "/" + id;
		}

		if(this.handleEvent) {
			this.handleEvent(id, event, element);
		}

		if(this.ctrl) 
		{
			if(this.ctrl.handleEvent) {
				this.ctrl.handleEvent(id, event, element);
			}
			else {
				throw "ElementEmitError: Controller does not own 'handleEvent' function";
			}
		}

		if(!this.parent) {
			return;
		}
		
		this.parent._emit(id, event, element);
	},

	query: function(str)
	{
		var buffer = str.split("/");
		var num = buffer.length - 1;

		var bufferStr = "";
		for(var n = 0; n < num; n++) {
			bufferStr += buffer[n] + " ";
		}
		bufferStr += buffer[n];

		var element = this.element.querySelector(bufferStr)
		return element.holder;
	},

	handleEvent: null,

	//
	parent: null,
	ctrl: null,

	element: null,
	elementTag: "div"
});

Element.prototype.holder = null;
