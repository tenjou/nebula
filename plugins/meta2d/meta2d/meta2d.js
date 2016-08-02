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
		var parent = editor.plugins.layout.toolbarIFrame.$elements.content;

		this.iframe = wabi.createElement("iframe");
		this.iframe.value = "plugins/meta2d/meta2d/index/index.html";
		this.iframe.on("load", this.handleIframeLoad, this);
		this.iframe.appendTo(parent);
	},

	handleIframeLoad: function() {
		this.iframe.$wnd.meta.loader.register(editor.dataPublic);
	},

	loadTypes: function()
	{
		var resources = editor.plugins.resources;

		resources.addType("folder", {
			icon: "fa-folder"
		});

		resources.addType("sprite", {
			icon: "fa-rocket"
		});

		resources.addType("view", {
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
					View: {
						icon: editor.plugins.resources.getIconFromType("view"),
						func: this.createView.bind(this)
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

	},

	createSprite: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "Sprite",
			type: "sprite"
		});
	},

	createView: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "View",
			type: "view"
		});
	},	

	deleteItem: function(event)
	{
		var item = editor.plugins.browser.cache.selected;
		if(!item) { return; }

		editor.dataPublic.get("hierarchy").remove(item.data.id);
	},

	//
	iframe: null
});
