"use strict";

Editor.Plugin("Inspect",
{
	install: function()
	{
		this.cachedContents = {};

		this.contents = {
			default: Controller.Inspect_Default,
			texture: Controller.Inspect_Texture
		};

		var content = new Element.Content();
		content.load(Controller.Inspect_Default);
		this.content = content;		
	},

	onStart: function() {
		this.tab = editor.inner.rightToolbar.createTab("Inspect");
	},

	show: function(type, data)
	{


		//this.tab.clearContent();
		this.tab.addContent(this.content);

		// if(!this.contents[type]) {
		// 	console.warn("(Editor.Plugin.Inspect) No content found for type: " + type);
		// 	type = "default";
		// }

		// var content = this.cachedContents[type];
		// if(!content) {
		// 	content = new this.contents[type]();
		// 	this.cachedContents[type] = content;
		// }		

		// if(type !== "default") {
		// 	content.fill(data);
		// }

		// this.tab.content = content;
	},

	empty: function() {

	},

	//
	contents: null,
	cachedContents: null,
	tab: null
});
