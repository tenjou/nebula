"use strict";

meta.class("Controller.AssetResources", 
{
	init: function(content) 
	{
		this.content = content;
		this.content.data = {
			Resources: {
				type: "containerNamed",
				content: {
					Browser: {
						type: "resourceList"
					}
				}
			},
			upload: "@upload"
		};

		this.content.on("menu", this.openMenu.bind(this));

		this.list = this.content.get("Resources.Browser");
		this.list.on("drop", this.handleDrop.bind(this));
		this.list.on("select", this.inspectItem.bind(this));
		this.list.on("update", this.renameItem.bind(this));
		
		this.upload = this.content.get("upload");
		this.upload.on("update", this.handleUploadUpdate.bind(this));
	},

	loadFromDb: function(db)
	{
		this.db = db;
		this.dbLookup = {};
		this.list.db = db;

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

	inspectItem: function(event)
	{
		var info = this.list.cache.selectedItem.info;
		editor.plugins.Inspect.show(info.type, info);
	},

	updateInspectItem: function()
	{

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

		element.parent.parent.parent.sort();
		editor.saveCfg();
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

	createListMenu: function(element) 
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
					}
				]
			}
		];

		this.currItem = element;
		this.currList = element;		

		return menu;
	},

	createItemMenu: function(element)
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

		this.currItem = element;
		this.currList = element.parent;

		return menu;
	},

	handleContextMenu: function(buffer)
	{
		var category = buffer[0];
		var type = buffer[1];

		if(category === "Create")
		{
			if(type === "Folder") {
				this.addFolder(this.currList, this.currItem);
			}
		}
		else if(category === "Actions")
		{
			if(type === "Upload") {
				this.upload.open();
			}
			else if(type === "Delete") {
				this.removeItem(this.currList, this.currItem);
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

		if(item.folder) {
			var fileName = info.path + info.name;
			editor.fileSystem.removeDir(fileName);
		}
		else {
			var fileName = info.path + info.name + "." + info.ext;
			editor.fileSystem.remove(fileName);
		}

		editor.saveCfg();

		// if(element.select) {
		// 	editor.plugins.Inspect.show("default");
		// }		
	},

	// upload
	handleUploadUpdate: function(event)
	{
		var files = event.domEvent.target.files;
		var num = files.length;

		for(var n = 0; n < num; n++) {
			this.readFile(files[n]);
		}
	},

	handleDrop: function(event)
	{
		var domEvent = event.domEvent;

		if(meta.device.name === "Chrome") {
			this.handleFileSelect_Chrome(domEvent);
		}
		else {
			this.handleFileSelect_All(domEvent);
		}
	},

	handleFileSelect_All: function(domEvent) 
	{
		var files = domEvent.dataTransfer.files;
		var num = files.length;

		for(var n = 0; n < num; n++) {
			this.readFile(files[n]);
		}
	},	

	handleFileSelect_Chrome: function(domEvent)
	{
		var entry;
		var dataItems = domEvent.dataTransfer.items;
		var numDataItems = dataItems.length;
		for(var n = 0; n < numDataItems; n++)
		{
			entry = dataItems[n].webkitGetAsEntry();
			if(entry) {
				this.handleFileSelect_Chrome_traverseDir(entry);
			}
		}		
	},

	handleFileSelect_Chrome_traverseDir: function(entry)
	{
		var self = this;

		if(entry.isFile)
		{
			entry.file(
				function(file) {
					self.readFile(file);
				});
		}
		else if(entry.isDirectory)
		{
			var dirReader = entry.createReader();
			dirReader.readEntries(
				function(entries) 
				{
					var num = entries.length;
					for(var n = 0; n < num; n++) {
						self.handleFileSelect_Chrome_traverseDir(entries[n]);
					}
				});
		}
	},

	readFile: function(file)
	{
		this.numItemsLoading++;

		var self = this;

		var reader = new FileReader();
		reader.onload = function(fileResult) {
			self.handleFileOnLoad(file, fileResult);
		};

		reader.readAsDataURL(file);
	},	

	handleFileOnLoad: function(file, fileResult)
	{
		var name = encodeURIComponent(file.name);
		var wildcardIndex = name.lastIndexOf(".");
		var idName = name.substr(0, wildcardIndex);
		var ext = name.substr(wildcardIndex + 1).toLowerCase();

		var fullPath = editor.fileSystem.fullPath + idName + "." + ext;

		var info = {
			name: idName,
			path: this.list.path,
			ext: ext,
			type: editor.resourceMgr.getTypeFromExt(ext),
			lastModified: file.lastModified
		};
		this.addItem(this.list, info);

		var blob = dataURItoBlob(fileResult.target.result, file.type);
		editor.fileSystem.writeBlob(this.list.path + info.name + "." + ext, blob, this._handleOnFileLoad.bind(this));		
	},

	_handleOnFileLoad: function(path)
	{
		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
			editor.saveCfg();
		}
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
		item.list.path = list.path + "/" + info.name;
		item.list.db = info.content;

		return item;
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
	upload: null,

	db: null,
	dbLookup: null,

	currItem: null,
	currList: null,

	numItemsLoading: 0
});