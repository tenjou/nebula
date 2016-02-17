"use strict";

meta.class("AssetsBrowser", 
{
	load: function()
	{
		var inputParserTypes = editor.inputParser.types;
		inputParserTypes.assetBrowser = function(section, name, data) 
		{
			var prop = new Element.AssetsProperty(section);
			prop.addField();
		};
		inputParserTypes.searchBar = function(section, name, data) {
			console.log("create search bar");
		};

		// var leftToolbar = editor.inner.leftToolbar;
		// var tabInputData = {
		// 	Browser: {
		// 		type: "Holder",
		// 		content: {
		// 			SearchBar: {
		// 				type: "SearchBar"
		// 			},
		// 			Browser: {
		// 				type: "AssetBrowser"
		// 			}
		// 		}
		// 	}		
		// };
		// var tab = leftToolbar.createTab("Assets", tabInputData);
	}
});
