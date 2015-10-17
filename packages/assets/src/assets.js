"use strict";

module.exports =
{
	install: function()
	{
		this.load();
	},

	uninstall: function()
	{

	},

	load: function()
	{
		var self = this;

		editor.fileSystem.checkDir("assets", 
			function(result) 
			{
				if(!result) 
				{
					editor.fileSystem.createDir("assets", 
						function() {
							self.loadAssets();
						});
				}
				else {
					self.loadAssets();
				}
			});
	},

	loadAssets: function()
	{
		console.log("load-assets");
	}
};
