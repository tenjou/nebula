"use strict";

meta.class("Controller.AssetDefs", 
{
	init: function(content) 
	{
		this.content = content;
		this.content.data = {
			Defs: {
				type: "containerNamed",
				content: {
					Browser: {
						type: "defList"
					}
				}
			}
		};

		this.list = this.content.get("Defs.Browser");
	},

	loadFromDb: function(db)
	{
		this.db = db;
		this.dbLookup = {};

		this._loadFolder(db, this.list);
	},

	_loadFolder: function(db, list)
	{
		var item, folder;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			item = db[n];
			if(item.type === "folder") {
				folder = list._addFolder(item);
				this._loadFolder(item.content, folder.list);
			}
			else {
				list._addItem(item);
			}

			this.dbLookup[item.name] = item;
		}	

		list.sort();	
	},

	//
	list: null,
	
	db: null,
	dbLookup: null	
});
