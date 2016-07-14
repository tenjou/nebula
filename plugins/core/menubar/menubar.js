"use strict";

editor.plugin("menubar",
{
	create: function()
	{
		wabi.addTemplate("topMenubar", 
		{
			type: "menubar",			
			right: [
				{
					type: "menuitem",
					bind: "username",
					icon: "fa-user",
					iconExt: "fa-caret-down"
				}
			]
		});
	},

	onSplashStart: function()
	{
		this.template = wabi.createTemplate("topMenubar");
		this.template.appendTo(editor.wrapperElement);
	},

	//
	template: null
});
