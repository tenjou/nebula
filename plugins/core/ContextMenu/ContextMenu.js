"use strict";

Editor.plugin("ContextMenu", 
{
	onCreate: function() 
	{
		this.menuDefs = {};
		this.cbShow = {};

		editor.on("click", this.hide.bind(this));
	},

	onSplashStart: function()
	{
		this.menu = new Element.ContextMenu(editor.overlay);
		this.menu.enable = false;
		this.menu.on("click", "*", this.handleMenuChoice.bind(this));

		document.body.onclick = this.handleClick.bind(this);
	},

	handleMenuChoice: function(event)
	{
		var buffer = event.element.id.split("*");	
		var translatedBuffer = new Array(buffer.length);

		var content = this.currContent;

		var name, item;
		for(var n = 0; n < buffer.length; n++) 
		{
			name = buffer[n];

			for(var i = 0; i < content.length; i++)
			{
				item = content[i];
				if(item.name === name)
				{
					translatedBuffer[n] = item;
					if(item.content) {
						content = item.content;
					}
					break;					
				}
			}
		}

		while(translatedBuffer.length > 0) 
		{
			item = translatedBuffer.shift();
			if(item.func) {
				item.func(item, translatedBuffer);
			}
		}

		this.hide();

		return true;
	},

	handleClick: function(domEvent) {
		this.hide();
	},

	hide: function() {
		this.menu.enable = false;
	},

	add: function(def)
	{
		if(this.menuDefs[def.name]) {
			console.warn("(Plugin.ContextMenu.add) There is already defined such menu: ", def.name);
			return;
		}

		this.menuDefs[def.name] = def;
	},	

	addExtend: function(defName, extendDefName)
	{
		var def = this.menuDefs[defName];
		if(!def) {
			console.warn("(Plugin.ContextMenu.addExtend) Menu definiton not found: ", defName);
			return;
		}

		var defExtend = this.menuDefs[extendDefName];
		if(!defExtend) {
			console.warn("(Plugin.ContextMenu.addExtend) Extend menu definiton not found: ", extendDefName);
			return;
		}	

		if(def.extend) {
			extend.push(defExtend);
		}
		else {
			def.extend = [ extendDefName ];
		}
	},

	show: function(defName, x, y)
	{
		var def = this.menuDefs[defName];
		if(!def) {
			console.warn("(Plugin.ContextMenu.show) Menu definiton not found: " + defName);
			return;
		}

		var content = [];

		if(def.extend) {
			this._extendContent(content, def.extend);
		}

		this.appendMenu(content, def.content);

		var cbBuffer = this.cbShow[def.name];
		if(cbBuffer) 
		{
			var num = cbBuffer.length;
			for(var n = 0; n < num; n++) {
				this.appendMenu(content, cbBuffer[n]());
			}
		}		

		this.menu.domElement.innerHTML = "";

		if(content.length === 0) { 
			this.menu.enable = false;
			this.currContent = null;
			return; 
		}

		this.menu.fill(content);
		this.menu.position(x, y);
		this.menu.enable = true;
		this.currContent = content;
	},

	_extendContent: function(content, extend)
	{
		var extendDef, cbBuffer;
		var num = extend.length;
		for(var n = 0; n < num; n++) 
		{
			extendDef = this.menuDefs[extend[n]];
			if(!extendDef) {
				console.warn("(Plugin.ContextMenu._extendContent) Menu definiton not found: " + extendDef.name);
				return;
			}

			if(extendDef.extend) {
				this._extendContent(content, extendDef.extend);
			}			

			this.appendMenu(content, extendDef.content);

			cbBuffer = this.cbShow[extendDef.name];
			if(cbBuffer) 
			{
				for(var i = 0; i < cbBuffer.length; i++) {
					this.appendMenu(content, cbBuffer[i]());
				}
			}
		}		
	},

	mergeMenus: function(a, b)
	{
		var menu = [].concat(a);

		this.appendMenu(menu, b);

		return menu;
	},

	appendMenu: function(a, b)
	{
		var itemA, itemB, nA;
		var numA = a.length;
		var numB = b.length;

		merge:
		for(var nB = 0; nB < numB; nB++) 
		{
			itemB = b[nB];
			for(nA = 0; nA < numA; nA++) 
			{
				itemA = a[nA];
				if(itemA.name === itemB.name)
				{
					if(itemB.content)
					{
						if(!itemA.content) {
							itemA.content = itemB.content;
						}
						else {
							itemA.content = this.mergeMenus(itemA.content, itemB.content);
						}
					}

					continue merge;
				}
			}

			a.push(itemB);
		}		
	},

	mergeOnShow: function(name, cb)
	{
		var buffer = this.cbShow[name];
		if(!buffer) {
			this.cbShow[name] = [ cb ];
		}
		else {
			buffer.push(cb);
		}
	},

	//
	menu: null,

	menuDefs: null,
	currContent: null,

	cbShow: null
});
