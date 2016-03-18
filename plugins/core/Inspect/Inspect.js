"use strict";

Editor.plugin("Inspect",
{
	install: function()
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
							Image: "@image"
						}
					}
				}
			});	
	},

	onStart: function() 
	{
		this.tab = editor.inner.rightToolbar.createTab("Inspect");
	},

	show: function(typeName, data)
	{
		var content = editor.createContent("inspect." + typeName);
		if(!content) {
			content = editor.createContent("inspect.default");
		}

		content.bindData(data);
		this.tab.content = content;	
	},

	empty: function() {
		this.content.empty();
	},

	addType: function(name, info)
	{
		if(this.types[name]) {
			console.warn("(Plugin.Inspect.addType) There is already such type defined: " + name);
			return;
		}

		this.types[name] = info;
	},

	getType: function(name) 
	{
		var type = this.types[name];
		if(!type) {
			console.warn("(Plugin.Inspect.show) No type found: " + name);
			return null;
		}

		return type;
	},

	//
	tab: null
});


