"use strict";

meta.class("Editor.Element.Inner", "Editor.Element",
{
	onCreate: function()
	{
		if(editor.layout === "particles") {
			this.onCreateParticles();
			return;
		}

		var assetsData = {

		};

		var toolsData = {
			TODO2: {
				TODO2: ""
			}
		};		

		this.leftToolbar = new Editor.Element.Toolbar(this);
		// this.leftToolbar.createTab("Assets", Element.AssetsTab);
		// this.leftToolbar.loadTab("Assets", assetsData);
		// this.leftToolbar.loadTab("Tools", toolsData);

		this.roomToolbar = new Editor.Element.ToolbarRoom(this);

		var inspectData = {
			Properties: {
				type: "section",
				content: {
					Name: "",
					Type: 0,
					StuffXXX: 0
				}
			},
			"Some Stuff": {
				type: "section",
				content: {
					Yeah: ""
				}
			}
		};

		var paletteData = {
			Texture: {
				type: "section",
				content: {
					Name: ""
				}
			}
		};		

		this.rightToolbar = new Editor.Element.Toolbar(this);
		this.rightToolbar.createTab("Inspect", inspectData);
		this.rightToolbar.createTab("Palette", paletteData);
	},

	onCreateParticles: function()
	{
		this.roomToolbar = new Editor.Element.ToolbarRoom(this);

		var inspectData = {
			Properties: {
				type: "section",
				content: {
					Name: "",
					Type: 0,
					StuffXXX: 0
				}
			},
			"Some Stuff": {
				type: "section",
				content: {
					Yeah: ""
				}
			}
		};

		var paletteData = {
			Presets: {
				Type: ""
			}
		};	

		this.rightToolbar = new Editor.Element.Toolbar(this);
		this.rightToolbar.loadTab("Particle", inspectData);
		this.rightToolbar.loadTab("Presets", paletteData);
	},

	//
	elementTag: "inner",

	leftToolbar: null,
	rightToolbar: null,
	roomToolbar: null,
});
