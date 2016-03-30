"use strict";

meta.class("Element.Slot", "Element.Basic",
{
	onCreate: function()
	{
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		this.ctrls = [];
	},

	handleContextMenu: function(domEvent) {
		domEvent.preventDefault();
		this.emit("menu", domEvent);
	},

	addCtrl: function(ctrlName) 
	{
		var scope = Editor.Controller;
		var buffer = ctrlName.split(".");
		var num = buffer.length;
		for(var n = 0; n < num; n++) 
		{
			scope = scope[buffer[n]];
			if(!scope) {
				console.warn("(Editor.controller) Invalid class: Editor.Controller." + ctrlName);
				return;
			}
		}

		var ctrlCls = scope;
		if(!ctrlCls) {
			console.warn("Element.addCtrl) No such controller found: " + ctrlName);
			return;
		}

		var ctrl = new ctrlCls(this);

		if(!this.ctrls) {
			this.ctrls = [ ctrl ];
		}
		else {
			this.ctrls.push(ctrl);
		}

		if(this.tree) {
			ctrl.load();
		}
	},

	bindData: function(data)
	{
		var num = this.ctrls.length;
		for(var n = 0; n < num; n++) {
			this.ctrls[n].bindData(data);
		}
	},

	get: function(id)
	{
		var node = this.tree;
		var buffer = id.split(".");
		var num = buffer.length;
		for(var n = 0; n < num; n++) 
		{
			if(!node.children) {
				return null;
			}

			node = node.children[buffer[n]];
			if(!node) {
				return null;
			}
		}

		return node.element;
	},

	set data(data) 
	{
		this.tree = editor.inputParser.parse(this, data);

		if(this.ctrls)
		{
			var num = this.ctrls.length;
			for(var n = 0; n < num; n++) {
				this.ctrls[n].load();
			}
		}
	},

	//
	elementTag: "slot",
	tree: null,
	ctrls: null
});