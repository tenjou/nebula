"use strict";

editor.plugin("meta2d",
{
	onPrepare: function()
	{
		this.loadTypes();
		this.loadContextMenu();
		this.loadInspect();
	},

	onStart: function()
	{
		var layout = editor.plugins.layout;
		this.rulerHorizontal = layout.template.get("#ruler-horizontal");
		this.rulerVertical = layout.template.get("#ruler-vertical");

		this.iframe = wabi.createElement("iframe");
		this.iframe.$value = "plugins/meta2d/meta2d/index/index.html";
		this.iframe.on("load", this.handleIframeLoad, this);
		this.iframe.appendTo(layout.toolbarIFrame);
	},

	handleIframeLoad: function() 
	{
		var wnd = this.iframe.wnd;
		wnd.meta.loader.register(editor);
		wnd.meta.on("camera-move", this.handleCameraMove.bind(this));
		wnd.addEventListener("mousemove", this.handleMouseMove.bind(this));
		wnd.addEventListener("resize", this.handleResize.bind(this));
		this.handleResize(null);
	},

	handleCameraMove: function(camera)
	{
		this.rulerHorizontal.updatePos(camera.x);
		this.rulerVertical.updatePos(camera.y);
	},

	handleMouseMove: function(event)
	{
		this.rulerHorizontal.updateCursor(event.x);
		this.rulerVertical.updateCursor(event.y);
	},

	handleResize: function(event) 
	{
		this.rulerHorizontal.updateSize();
		this.rulerVertical.updateSize();
	},

	loadTypes: function()
	{
		var resources = editor.plugins.resources;

		resources.addType("sprite", {
			icon: "fa-rocket"
		});

		resources.addType("layer", {
			icon: "fa-photo"
		});
	},

	loadContextMenu: function()
	{
		var contextmenu = editor.plugins.contextmenu;

		contextmenu.add("hierarchy", {
			Create: {
				content: {
					Sprite: {
						icon: editor.plugins.resources.getIconFromType("sprite"),
						func: this.createSprite.bind(this)
					},
					Layer: {
						icon: editor.plugins.resources.getIconFromType("layer"),
						func: this.createLayer.bind(this)
					},
					Folder: {
						icon: editor.plugins.resources.getIconFromType("folder"),
						func: this.createFolder.bind(this)
					}
				}
			}
		});

		contextmenu.add("hierarchyItem", "hierarchy", {
			Actions: {
				content: {
					Delete: {
						icon: "fa-trash",
						func: this.deleteItem.bind(this)
					}
				}
			}
		});
	},

	createFolder: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "Folder",
			type: "folder"
		});
	},

	createSprite: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "Sprite",
			type: "sprite"
		});
	},

	createLayer: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "Layer",
			type: "layer"
		});
	},	

	deleteItem: function(event)
	{
		var item = editor.plugins.browser.cache.selected;
		if(!item) { return; }

		editor.dataPublic.get("hierarchy").remove(item.data.id);
	},

	//
	iframe: null,
	rulerHorizontal: null,
	rulerVertical: null,
});
