"use strict";

Editor.controller("AssetBrowser", 
{
	onCreate: function() 
	{
		this.watchItemFunc = this.watchItem.bind(this);
	},

	onBindData: function()
	{
		editor.registerDataset(this.name, this.data, "content");

		this.dbLookup = {};

		this._loadContent(this.list, this.data);
	},

	_loadContent: function(list, db)
	{
		var data, dbData, item;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			dbData = db[n];
			data = new Editor.Data(dbData);
			item = this._addItem(list, data);
			if(dbData.content && dbData.content.length > 0) {
				item.folder = true;
				this._loadContent(item.list, dbData.content);
			}
		}	

		list.sort();	
	},

	onAdd: null,

	addItem: function(list, info)
	{
		var data = new Editor.Data(info);

		this.makeNameUnique(info);

		var item = this._addItem(list, data);
		item.select = true;
		list.sort();
		item._name.focus();	

		var db;
		var parent = list.parent;
		if(parent instanceof Element.ListItem) {
			db = parent.info.data.content;
			if(!db) {
				db = [];
				parent.info.data.content = db;
			}
			info.id = parent.info.data.id + "/" + info.name;
		}
		else {
			db = this.data;
			info.name = info.name;
		}	

		db.push(info);
		
		
		if(this.name === "Resources") 
		{
			if(!info._ext) {
				editor.fileSystem.createDir(info.id);
			}
		}

		editor.saveCfg();

		if(this.onAdd) {
			this.onAdd(info);
		}

		return item;
	},

	_addItem: function(list, data)
	{
		var props = data.data;

		var dataType = props._type;
		if(dataType === "unknown") {
			dataType = editor.resourceMgr.getTypeFromExt(props._ext);
			if(dataType !== "unknown") {
				props._type = dataType;
			}
		}

		var typeInfo = editor.resourceMgr.types[props._type];
		if(!typeInfo) {
			typeInfo = editor.resourceMgr.types.unknown;
		}

		var element = list.createItem(props.name);
		element.tag = props._ext;
		element.type = typeInfo;
		element.info = data;

		var parent = list.parent;
		if(parent instanceof Element.ListItem) {
			props.id = parent.info.data.id + "/" + props.name;
		}
		else {
			props.id = props.name;
		}

		data.element = element;
		data.watch(this.watchItemFunc);
		this.dbLookup[props.id] = data;

		return element;
	},	

	watchItem: function(item, key)
	{
		if(key === "name") 
		{
			var element = item.element;
			if(!this.renameItem(element)) {
				element.revert();
			}
		}
	},

	handleRenameItem: function(event)
	{
		var nameElement = event.element;
		var itemElement = nameElement.parent.parent;

		itemElement.info.data.name = nameElement.value;

		if(!this.renameItem(itemElement)) {
			nameElement.revert();
		}
	},

	renameItem: function(element)
	{
		var info = element.info;

		var newId;
		var parent = element.parent.parent;
		if(parent instanceof Element.ListItem) {
			newId = parent.info.data.id + "/" + info.data.name;
		}
		else {
			newId = info.data.name;
		}

		if(this.dbLookup[newId]) {
			var id = info.data.id;
			info.data.name = id.slice(id.lastIndexOf("/") + 1);
			this.inspectItem();
			return false;
		}

		this.updateItemDeps(newId, info.data.id, info.data);
		
		if(this.name === "Resources")
		{
			if(info.data._type !== "cubemap")
			{
				if(info.data._ext)
				{
					editor.fileSystem.moveTo(
						info.data.id + "." + info.data._ext,
						newId + "." + info.data._ext,
						this.inspectItem.bind(this));
				}
				else {
					editor.fileSystem.moveToDir(info.data.id, newId, this.inspectItem.bind(this));
				}
			}
		}

		if(element.list) {
			this.updateItemInfo(element.list.items, newId);
		}		

		delete this.dbLookup[info.data.id];
		this.dbLookup[newId] = info;
		info.data._lastModified = Date.now();
		info.set("id", newId);

		element.parent.sort();
		editor.saveCfg();

		return true;
	},	

	updateItemInfo: function(items, path)
	{
		var item, prevId;
		for(var n = 0; n < items.length; n++) 
		{
			item = items[n];

			prevId = item.info.data.id;
			item.info.data.id = path + "/" + item.name;
			this.updateItemDeps(item.info.data.id, prevId, item.info.data);

			if(item.list) {
				this.updateItemInfo(item.list.items, item.info.data.id);
			}
		}
	},

	handleMoveItem: function(event)
	{
		// TODO: check if moved item is unique.
		var element = event.element;
		var info = element.info;

		// Remove from previous content db:
		var db;
		var parent = element.preDragParent.parent;
		if(parent instanceof Element.ListItem) {
			db = parent.info.data.content;
		}
		else {
			db = this.data;
		}	
		
		var index = db.indexOf(info.data);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}

		// Add to new content db:
		var prevId = info.data.id;
		parent = element.parent.parent;
		if(parent instanceof Element.ListItem) 
		{
			db = parent.info.data.content;
			if(!db) {
				db = [];
				parent.info.data.content = db;
			}
			info.data.id = parent.info.data.id + "/" + info.data.name;
		}
		else {
			db = this.data;
			info.data.id = info.data.name;
		}		

		delete this.dbLookup[prevId];

		this.makeNameUnique(info.data);
		element.name = info.data.name;
		info.data._lastModified = Date.now();

		db.push(element.info.data);
		this.dbLookup[info.data.id] = info;

		this.updateItemDeps(info.data.id, prevId, info.data);

		if(this.name === "Resources")
		{
			if(info.data._ext)
			{
				editor.fileSystem.moveTo(
					prevId + "." + info.data._ext,
					info.data.id + "." + info.data._ext);
			}
			else {
				editor.fileSystem.moveToDir(prevId, info.data.id);
			}
		}

		if(element.info.data.content) 
		{
			this._updateMoveItemDb(element.info.data);
		}
		
		element.parent.sort();

		editor.saveCfg();

		if(element.select) {
			this.inspectItem();
		}
	},

	_updateMoveItemDb: function(data)
	{
		var db = data.content;

		var item, prevId;
		var num = db.length;
		for(var n = 0; n < num; n++)
		{
			item = db[n];

			prevId = item.id;
			item.id = data.id + "/" + item.name;

			this.updateItemDeps(item.id, prevId, item);

			if(item.content) {
				this._updateMoveItemDb(item);
			}
		}
	},

	removeItem: function(list, item)
	{
		var info = item.info;

		if(this.name === "Resources") 
		{
			var self = this;
			var func = function(data) {
				self._removeItem(list, item);
			};

			if(info.data._ext) {
				editor.fileSystem.remove(info.data.id + "." + info.data._ext, func);
			}
			else {
				editor.fileSystem.removeDir(info.data.id, func);
			}
		}
		else {
			this._removeItem(list, item);
		}
	},

	_removeItem: function(list, item)
	{
		var info = item.info;

		var db;
		var parent = item.parent.parent;
		if(parent instanceof Element.ListItem) {
			db = parent.info.data.content;
		}
		else {
			db = this.data;
		}	

		if(item.select) {
			editor.plugins.Inspect.empty();
		}

		list.removeItem(item);

		delete this.dbLookup[info.data.id];

		var index = db.indexOf(info.data);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}	

		editor.saveCfg();		
	},

	handleSelect: function(event) 
	{		
		var plugin = editor.plugins.AssetBrowser;
		if(plugin.selectedItem) {
			plugin.selectedItem.select = false;
		}

		plugin.selectedItem = event.element;
		plugin.selectedCtrl = this;

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

	menu_Folder: function() 
	{
		var info = {
			name: "folder",
			_type: "folder",
			_lastModified: Date.now(),
			content: []
		};

		this.addItem(this.currList, info);
	},

	menu_Delete: function() {
		this.removeItem(this.currList, this.currItem);
	},

	makeNameUnique: function(info)
	{
		if(!info.id) {
			info.id = info.name;
		}

		if(!this.dbLookup[info.id]) {
			return;
		}

		var preIdIndex = info.id.lastIndexOf("/");
		var preId = info.id.slice(0, preIdIndex);
		var name = info.id.slice(preIdIndex + 1);

		var index;
		var numIndex = name.lastIndexOf("-");
		if(numIndex > -1) {
			index = parseInt(name.slice(numIndex + 1));
			if(isNaN(index)) {
				index = 2;
			}
			else {
				name = name.slice(0, numIndex);
				index++;
			}
		}
		else {
			index = 2;
		}

		var newId;
		for(;;)
		{
			if(preId) {
				newId = preId + "/" + name + "-" + index;
			}
			else {
				newId = name + "-" + index;
			}

			if(!this.dbLookup[newId]) {
				break;
			}

			index++;
		}

		info.id = newId;
		info.name = name + "-" + index;
	},		

	//
	content: null,
	list: null,
	
	db: null,
	dbLookup: null,

	currItem: null,
	currList: null,

	watchItemFunc: null
});
