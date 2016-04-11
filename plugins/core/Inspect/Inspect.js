"use strict";

Editor.plugin("Inspect",
{
	onLoad: function()
	{
		editor.addContent("inspect.default", 
			{
				ctrl: "Inspect.Default",
				data: {
					General: {
						type: "section",
						open: true,
						content: {
							Name: {
								type: "string",
							}
						}
					}
				}
			});

		editor.addContent("inspect.texture", 
			{
				ctrl: "Inspect.Texture",
				extend: [ "inspect.default" ],
				data: {
					Image: {
						type: "section",
						open: true,
						content: {
							Holder: "@image"
						}
					}
				}
			});	
	},

	onStart: function() 
	{
		this.tab = editor.inner.rightToolbar.createTab("Inspect");
	},

	show: function(typeName, data, cb)
	{
		this.content = editor.createContent("inspect." + typeName);
		if(!this.content) {
			this.content = editor.createContent("inspect.default");
		}

		this.content.bindData(data);
		data.watch(this.handleContentUpdate.bind(this));

		this.cb = cb ? cb : null;
		this.tab.content = this.content;	
	},

	empty: function() {
		this.tab.empty();
	},

	handleContentUpdate: function(data, key)
	{	
		if(key === "name") {
			this.content.bindData(data);
		}
	},

	//
	tab: null,
	cb: null
});


