"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	onCreate: function()
	{
		this._super();

		this.on("menu", "*", this.openMenu.bind(this));
	},

	handleItemMove: function()
	{
		var db = this.preDragParent.db;
		var index = db.indexOf(this.info);
		if(index > -1) {
			db[index] = db.pop();
		}

		this.parent.db.push(this.info);

		var fileName = this.info.name;
		if(this.info.ext) {
			fileName += "." + this.info.ext;
		}

		this.info.path = this.parent.path;

		editor.fileSystem.moveTo(
			this.preDragParent.path + fileName, 
			this.parent.path + fileName, 
			function(data) {
				console.log(data);
			});
		editor.saveCfg();
	},

	openMenu: function(event)
	{
		var menu = [
			{
				name: "Create", 
				type: "category",
				content: [
					{ 
						name: "Folder", 
						icon: "fa-folder" 
					}
				]
			},
			{
				name: "Actions", 
				type: "category",
				content: [
					{
						name: "Upload", 
						icon: "fa-upload"
					},
					{
						name: "Delete", 
						icon: "fa-trash"
					}
				]
			}
		];

		editor.plugins.ContextMenu.show(menu, event.x, event.y, this.handleMenuChoice.bind(this));
		
		return true;
	},

	handleMenuChoice: function(buffer) 
	{
		console.log(buffer);

		var category = buffer[0];
		if(category === "Create")
		{
			var type = buffer[1];
			if(type === "Folder") {
				this.parent.addFolder(this);
			}
		}

		// var plugin = editor.plugins.AssetBrowser;

		// var value = buffer[0];
		// switch(value) 
		// {
		// 	case "Delete":
		// 		this.parent.removeItem(this.parent.cache.selectedItem);
		// 		break;

		// 	case "Folder":
		// 		plugin.createFolder("Folder", this);
		// 		break;
		// }
	},

	set tag(name) 
	{
		if(!name) { return; }
		
		if(!this._tag) {
			this._tag = new Element.Tag(this._inner);
		}
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_tag: null,
	info: null
});
