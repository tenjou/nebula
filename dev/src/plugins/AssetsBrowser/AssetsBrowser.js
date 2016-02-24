"use strict";

meta.class("AssetsBrowser", 
{
	load: function()
	{
		var self = this;
		var inputParserTypes = editor.inputParser.types;
		inputParserTypes.assetBrowser = function(parent, name, data) 
		{
			var browser = new Element.Browser(parent);
			browser.itemCls = Element.AssetBrowserItem;
			browser.ctrl = self;
		};
		inputParserTypes.searchBar = function(parent, name, data) {
			console.log("create search bar");
		};

		var leftToolbar = editor.inner.leftToolbar;
		var tabInputData = {
			Browser: {
				type: "container",
				content: {
					SearchBar: {
						type: "searchBar"
					},
					Browser: {
						type: "assetBrowser"
					}
				}
			}		
		};
		var tab = leftToolbar.createTab("Assets", tabInputData);
	},

	handleEvent: function(id, event, element)
	{
		if(event === "click")
		{
			if(id === "browser/item") 
			{
				if(element === this.activeItem) { return; }
				
				element.active = true;

				if(!this.activeItem) {
					this.activeItem = element;
				}
				else {
					this.activeItem.active = false;
					this.activeItem = element;
				}
			}
		}
	},

	//
	activeItem: null
});
