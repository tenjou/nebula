"use strict";

meta.class("Element.Content", "Element.Basic",
{
	init: function(parent, id) 
	{
		this._init(parent, id);

		this.ctrls = [];
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);

		if(this.onCreate) {
			this.onCreate();
		}
	},

	handleContextMenu: function(event) {
		event.preventDefault();
		this.emit("menu");
	},

	addCtrl: function(ctrlName) 
	{
		var ctrlCls = Editor.ControllerMap[ctrlName];
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

	fill: function(data) {},

	empty: function() {
		this.domElement.innerHTML = "";
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

	set hidden(value) 
	{
		if(value) {
			this.domElement.setAttribute("class", "hidden");
		}
		else {
			this.domElement.setAttribute("class", "");
		}
	},

	get hidden() 
	{
		var cls = this.domElement.getAttribute("class");
		if(cls === "hidden") {
			return true;
		}

		return false;
	},

	//
	elementTag: "content",
	tree: null,
	ctrls: null
});