"use strict";

Editor.controller("AssetBrowser", 
{
	onBindData: function()
	{
		editor.registerDataset(this.name, this.data, "content");

		this.dbLookup = {};
		this.list.db = this.data;

		this._loadFolder(this.list, this.data);
	},

	_loadFolder: function(list, db)
	{
		var item, folder;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			item = new Editor.Data(db[n]);
			if(item.content) {
				folder = this._addFolder(list, item);
				this._loadFolder(folder.list, item.content);
			}
			else {
				this._addItem(list, item);
			}
		}	

		list.sort();	
	},

	addItem: function(list, info)
	{
		var data = new Editor.Data(info);

		this.makeNameUnique(info);

		var item = this._addItem(list, data);

		list.db.push(info);
		list.sort();
		editor.saveCfg();

		return data;
	},

	_addItem: function(list, info)
	{
		var typeInfo = editor.resourceMgr.types[info.get("_type")];
		if(!typeInfo) {
			typeInfo = editor.resourceMgr.types.unknown;
		}

		var item = list.createItem(info.get("name"));
		item.tag = info.get("_ext");
		item.type = typeInfo;
		item.info = info;

		this.dbLookup[info.get("name")] = info;

		return item;
	},	

	addFolder: function(list)
	{
		var info = {
			name: "Folder",
			_path: list.path,
			_type: "folder",
			_lastModified: Date.now()
		};

		var item = this.addItem(list, info);
		item.folder = true;
		item.list.path = list.path + info.name + "/";
		item.list.db = info.content;

		editor.fileSystem.createDir(item.list.path);

		return item;
	},

	_addFolder: function(list, info) 
	{
		var item = this._addItem(list, info);
		item.folder = true;
		item.list.path = list.path + info.name + "/";
		item.list.db = info.content;

		return item;
	},	

	handleRenameItem: function(event)
	{
		var element = event.element;
		var item = element.parent.parent;

		var prevName = element.prevValue;
		item.info.set("name", element.value);

		if(!this.renameItem(item, prevName)) {
			element.revert();
		}
	},

	renameItem: function(item, prevName)
	{
		var info = item.info;

		if(this.dbLookup[info.get("name")]) {
			info.set("name", prevName);
			this.inspectItem();
			return false;
		}

		if(item.folder)
		{
			editor.fileSystem.moveToDir(
				info.get("_path") + prevName,
				info.get("_path") + info.get("name"),
				this.inspectItem.bind(this));
		}
		else
		{
			editor.fileSystem.moveTo(
				info.get("_path") + prevName + "." + info.get("_ext"), 
				info.get("_path") + info.get("name") + "." + info.get("_ext"),
				this.inspectItem.bind(this));
		}

		delete this.dbLookup[prevName];
		this.dbLookup[info.get("name")] = info;
		info.lastModified = Date.now();

		item.parent.sort();
		editor.saveCfg();

		return true;
	},	

	handleMoveItem: function(event)
	{
		var element = event.element;
		var info = element.info;
		
		var db = element.preDragParent.db;
		var index = db.indexOf(info);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}

		db = element.parent.db;
		db.push(element.info);
		info.path = element.parent.path;
		info.lastModified = Date.now();

		var fileName = info.name;
		if(element.folder)
		{
			editor.fileSystem.moveToDir(
				element.preDragParent.path + fileName,
				element.parent.path + fileName);

			this._updateMoveItemDb(element.info.content, element.parent.path + fileName + "/");
		}
		else
		{
			fileName += "." + info.ext;

			editor.fileSystem.moveTo(
				element.preDragParent.path + fileName,
				element.parent.path + fileName);
		}
		
		element.parent.sort();

		editor.saveCfg();

		if(element.select) {
			this.inspectItem();
		}
	},

	_updateMoveItemDb: function(db, path)
	{
		var item;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			item = db[n];
			item.path = path;

			if(item.folder) {
				this._updateMoveItemDb(item.info.content, path + item.info.name + "/");
			}
		}
	},

	removeItem: function(list, item)
	{
		var info = item.info;
		var db = list.db;

		list.removeItem(item);

		delete this.dbLookup[info.get("name")];

		var index = db.indexOf(info.data);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}

		var fileName = info.get("_path") + info.get("name");
		if(item.folder) {
			editor.fileSystem.removeDir(fileName);
		}
		else {
			fileName += "." + info.get("_ext");
			editor.fileSystem.remove(fileName);
		}

		editor.saveCfg();

		if(item.select) {
			editor.plugins.Inspect.empty();
		}		
	},

	handleSelect: function(event) 
	{		
		var plugin = editor.plugins.AssetBrowser;
		if(plugin.selectedItem) {
			plugin.selectedItem.select = false;
		}

		plugin.selectedItem = event.element;

		this.inspectItem();
	},

	inspectItem: function()
	{
		var info = editor.plugins.AssetBrowser.selectedItem.info;
		editor.plugins.Inspect.show(info.get("_type"), info, this.handleInspectUpdate.bind(this));
	},

	handleInspectUpdate: function() 
	{
		var item = editor.plugins.AssetBrowser.selectedItem;
		item.name = item.info.name;
	},

	openMenu: function(event)
	{
		var element = event.element;
		if(element instanceof Element.ListItem) 
		{
			this.currItem = element;
			this.currList = element.parent;	

			editor.plugins.ContextMenu.show(this.name + "Item", event.x, event.y);
		}
		else 
		{
			this.currItem = element;
			this.currList = element;

			editor.plugins.ContextMenu.show(this.name, event.x, event.y);
		}
	},	

	menu_Folder: function() {
		this.addFolder(this.currList, this.currItem);
	},

	menu_Delete: function() {
		this.removeItem(this.currList, this.currItem);
	},		

	makeNameUnique: function(info)
	{
		var index = 2;
		var newName = info.name;

		for(;;)
		{
			if(this.dbLookup[newName]) {
				newName = info.name + "." + index;
				index++;
				continue;
			}

			info.name = newName;
			return newName;
		}

		return name;
	},		

	//
	content: null,
	list: null,
	
	db: null,
	dbLookup: null,

	currItem: null,
	currList: null	
});
