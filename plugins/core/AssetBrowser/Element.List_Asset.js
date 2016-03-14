"use strict";

meta.class("Element.List_Asset", "Element.List",
{
	onCreate: function()
	{
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		this.domElement.ondragover = this.handleDragOver.bind(this);
		this._super();	
	},

	handleContextMenu: function(domEvent) {
		domEvent.stopPropagation();
		domEvent.preventDefault();
		this.emit("menu", domEvent);
	},

	handleDragOver: function(domEvent)
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();
		domEvent.dataTransfer.dropEffect = "copy";
	},

	handleDrop: function(domEvent)
	{
		this._super(domEvent);

		if(meta.device.name === "Chrome") {
			this.handleFileSelect_Chrome(domEvent);
		}
		else {
			this.handleFileSelect_All(domEvent);
		}
	},

	handleFileSelect_All: function(domEvent) 
	{
		var self = this;

		var file, reader, item;
		var files = domEvent.dataTransfer.files;
		var numFiles = files.length;

		for(var n = 0; n < numFiles; n++) {
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
			path: this.path,
			ext: ext,
			type: editor.resourceMgr.getTypeFromExt(ext),
			lastModified: file.lastModified
		};
		this.addItem(info);

		var blob = dataURItoBlob(fileResult.target.result, file.type);
		editor.fileSystem.writeBlob(this.path + info.name + "." + ext, blob, this._handleOnFileLoad.bind(this));		
	},

	_handleOnFileLoad: function(path)
	{
		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
			editor.saveCfg();
		}
	},

	sortFunc: function(a, b) 
	{
		if(a.name < b.name) { return -1; }
		if(a.name > b.name) { return 1; }
		return 0;
	},

	addItem: function(info)
	{
		this.makeNameUnique(info);

		this.db.push(info);
		editor.saveCfg();

		var item = this._addItem(info);
		this.sort();

		return item;
	},

	_addItem: function(info)
	{
		var typeInfo = editor.resourceMgr.types[info.type];
		if(!typeInfo) {
			typeInfo = editor.resourceMgr.types.unknown;
		}

		var item = this.createItem(info.name);
		item.tag = info.ext;
		item.icon = typeInfo.icon ? typeInfo.icon : "fa-unknown";
		item.info = info;

		this.dbLookup[info.name] = info;

		return item;
	},	

	addFolder: function()
	{
		var info = {
			name: "Folder",
			path: this.path,
			ext: "",
			type: "folder",
			lastModified: Date.now(),
			content: []
		};

		var item = this.addItem(info);
		item.folder = true;

		item.list.path = this.path + info.name + "/";
		item.list.db = info.content;
		item.list.dbLookup = this.dbLookup;

		editor.fileSystem.createDir(item.list.path);

		return item;
	},

	_addFolder: function(info) 
	{
		var item = this._addItem(info);
		item.folder = true;

		this.dbLookup[info.name] = info;
		item.list.path = this.path + "/" + info.name;
		item.list.db = info.content;
		item.list.dbLookup = this.dbLookup;

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
	db: null,
	dbLookup: null,

	path: "/",
	numItemsLoading: 0
});
