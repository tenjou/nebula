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
						content: {
							Name: "@string",
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
		var content = editor.createContent("inspect." + typeName);
		if(!content) {
			content = editor.createContent("inspect.default");
		}

		content.bindData(data);
		content.on("data-update", this.handleContentUpdate.bind(this));

		this.cb = cb ? cb : null;
		this.tab.content = content;	
	},

	empty: function() {
		this.tab.empty();
	},

	handleContentUpdate: function(event)
	{	
		if(this.cb) {
			this.cb();
		}

		editor.saveCfg();
	},

	//
	tab: null,
	cb: null
});


