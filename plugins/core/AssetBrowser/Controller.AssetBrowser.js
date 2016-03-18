"use strict";

Editor.controller("AssetBrowser", 
{
	onBindData: function()
	{
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
			item = db[n];
			if(item.type === "folder") {
				folder = this._addFolder(list, item);
				this._loadFolder(folder.list, item.content);
			}
			else {
				this._addItem(list, item);
			}

			this.dbLookup[item.name] = item;
		}	

		list.sort();	
	},

	addItem: function(list, info)
	{
		this.makeNameUnique(info);

		var item = this._addItem(list, info);

		list.db.push(info);
		list.sort();
		editor.saveCfg();

		return item;
	},

	_addItem: function(list, info)
	{
		var typeInfo = editor.resourceMgr.types[info.type];
		if(!typeInfo) {
			typeInfo = editor.resourceMgr.types.unknown;
		}

		var item = list.createItem(info.name);
		item.tag = info.ext;
		item.icon = typeInfo.icon ? typeInfo.icon : "fa-unknown";
		item.info = info;

		this.dbLookup[info.name] = info;

		return item;
	},	

	addFolder: function(list)
	{
		var info = {
			name: "Folder",
			path: list.path,
			ext: "",
			type: "folder",
			lastModified: Date.now(),
			content: []
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

	renameItem: function(event)
	{
		var element = event.element;
		var item = element.parent.parent;
		var info = element.parent.parent.info;

		if(this.dbLookup[element.value]) {
			element.revert();
			return;
		}

		if(item.folder)
		{
			editor.fileSystem.moveToDir(
				info.path + info.name, 
				info.path + element.value, 
				this.updateInspectItem.bind(this));
		}
		else
		{
			editor.fileSystem.moveTo(
				info.path + info.name + "." + info.ext, 
				info.path + element.value + "." + info.ext, 
				this.updateInspectItem.bind(this));
		}

		delete this.dbLookup[info.name];
		this.dbLookup[element.value] = element.info;	
		info.name = element.value;	
		info.dataTransfer = Date.now();

		element.parent.parent.parent.sort();
		editor.saveCfg();
	},	

	moveItem: function(event)
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

		delete this.dbLookup[info.name];

		var index = db.indexOf(info);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}

		var fileName = info.path + info.name;
		if(item.folder) {
			editor.fileSystem.removeDir(fileName);
		}
		else {
			fileName += "." + info.ext;
			editor.fileSystem.remove(fileName);
		}

		editor.saveCfg();

		// if(element.select) {
		// 	editor.plugins.Inspect.show("default");
		// }		
	},

	inspectItem: function(event)
	{
		var info = this.list.cache.selectedItem.info;
		editor.plugins.Inspect.show(info.type, info);
	},

	updateInspectItem: function()
	{

	},

	openMenu: function(event)
	{
		var menu;
		var element = event.element;
		if(element instanceof Element.ListItem) {
			menu = this.createItemMenu(element);
		}
		else {
			menu = this.createListMenu(element);
		}
		
		editor.plugins.ContextMenu.show(menu, event.x, event.y, this.handleContextMenu.bind(this));
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
