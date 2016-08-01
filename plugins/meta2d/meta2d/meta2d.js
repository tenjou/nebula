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

		resources.addType("sprite", {
			icon: "fa-rocket"
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

	loadInspect: function()
	{
		var inspect = editor.plugins.inspect;

		wabi.addFragment("inspect-sprite", "inspect-general",
		{
			type: "section",
			name: "Transform",
			value: [		
				{
					type: "label",
					name: "Position",
					value: [
						{
							type: "taggedNumber",
							bind: "posX",
							name: "x",
							color: "#D04031"
						},
						{
							type: "taggedNumber",
							bind: "posY",
							name: "y",
							color: "#72B529"
						},
						{
							type: "taggedNumber",
							bind: "posZ",
							name: "z",
							color: "#2F80AD"
						}
					]
				},
			]
		});
	},

	createSprite: function(event)
	{
		editor.dataPublic.get("hierarchy").add("@", {
			value: "Sprite",
			type: "sprite",
			posX: 300
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
