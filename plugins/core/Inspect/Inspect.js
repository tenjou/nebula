"use strict";

Editor.Plugin("Inspect",
{
	install: function()
	{
		this.cachedContents = {};

		this.contents = {
			default: Element.Content,
			image: Element.Content_Inspect_Image
		};
	},

	onStart: function() {
		this.tab = editor.inner.rightToolbar.createTab("Inspect");
	},

	show: function(type, data)
	{
		if(!this.contents[type]) {
			console.warn("(Editor.Plugin.Inspect) No content found for type: " + type);
			type = "default";
		}

		var content = this.cachedContents[type];
		if(!content) {
			content = new this.contents[type]();
			this.cachedContents[type] = content;
		}		

		if(type !== "default") {
			content.fill(data);
		}

		this.tab.content = content;
	},

	empty: function() {

	},

	//
	contents: null,
	cachedContents: null,
	tab: null
});
