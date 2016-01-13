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
			TODO: {
				TODO: ""
			}
		};

		var toolsData = {
			TODO2: {
				TODO2: ""
			}
		};		

		this.leftToolbar = new Editor.Element.Toolbar(this);
		this.leftToolbar.loadTab("Assets", assetsData);
		this.leftToolbar.loadTab("Tools", toolsData);

		this.roomToolbar = new Editor.Element.ToolbarRoom(this);

		var inspectData = {
			Basic: {
				Name: "",
				Type: 0,
				StuffXXX: 0
			},
			"Some Stuff": {
				Yeah: ""
			}
		};

		var paletteData = {
			Texture: {
				Name: ""
			}
		};		

		this.rightToolbar = new Editor.Element.Toolbar(this);
		this.rightToolbar.loadTab("Inspect", inspectData);
		this.rightToolbar.loadTab("Palette", paletteData);
	},

	onCreateParticles: function()
	{
		this.roomToolbar = new Editor.Element.ToolbarRoom(this);

		var inspectData = {
			Properties: {
				Name: "",
				Type: 0,
				StuffXXX: 0
			},
			"Some Stuff": {
				Yeah: ""
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
