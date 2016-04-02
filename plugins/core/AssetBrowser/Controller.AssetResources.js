"use strict";

Editor.controller("AssetResources", "AssetBrowser",
{
	onLoad: function() 
	{
		var ctxMenu = editor.plugins.ContextMenu;

		ctxMenu.add({
			name: "Resources",
			content: [
				{
					name: "Create", 
					type: "category",
					content: [
						{
							name: "Folder", 
							icon: "fa-folder",
							func: this.menu_Folder.bind(this)
						}
					]
				},
				{
					name: "Actions", 
					type: "category",
					content: [
						{
							name: "Upload", 
							icon: "fa-upload",
							func: this.menu_Upload.bind(this)
						}
					]
				}
			]
		});

		ctxMenu.add({
			name: "ResourcesItem",
			extend: [ "Resources" ],
			content: [
				{
					name: "Actions", 
					type: "category",
					content: [
						{
							name: "Delete", 
							icon: "fa-trash",
							func: this.menu_Delete.bind(this)
						}
					]
				}
			]
		});

		this.list = this.content.get("Resources.Browser");
		this.list.on("drop", this.handleDrop.bind(this));
		this.list.on("select", this.handleSelect.bind(this));
		this.list.on("update", this.handleRenameItem.bind(this));
		this.list.on("move", this.handleMoveItem.bind(this));
		this.list.on("menu", this.openMenu.bind(this));
		
		this.upload = this.content.get("upload");
		this.upload.on("update", this.handleUploadUpdate.bind(this));
	},

	menu_Upload: function() {
		this.upload.open();
	},

	// upload
	handleUploadUpdate: function(event)
	{
		// if(event.element instanceof Element.ListItem) 
		// {
		// 	if(event.element.folder) {
		// 		this.currList = event.element.list;
		// 		event.element.open = true;
		// 	}
		// 	else {
		// 		this.currList = event.element.parent;
		// 	}
		// }
		// else if(event.element instanceof Element.List) {
		// 	this.currList = event.element;
		// }
		// else {
		// 	this.currList = null;
		// 	return;
		// }

		this.currList = this.list;

		var files = event.domEvent.target.files;
		var num = files.length;

		for(var n = 0; n < num; n++) {
			this.readFile(files[n]);
		}
	},

	handleDrop: function(event)
	{
		var domEvent = event.domEvent;

		this.currList = this.list;

		// if(event.element instanceof Element.ListItem) 
		// {
		// 	if(event.element.folder) {
		// 		this.currList = event.element.list;
		// 	}
		// 	else {
		// 		this.currList = event.element.parent;
		// 	}
		// }
		// else if(event.element instanceof Element.List) {
		// 	this.currList = event.element;
		// }
		// else {
		// 	this.currList = null;
		// 	return;
		// }

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
			_path: this.currList.path,
			_ext: ext,
			_type: editor.resourceMgr.getTypeFromExt(ext),
			_lastModified: file.lastModified
		};
		this.addItem(this.currList, info);

		var blob = dataURItoBlob(fileResult.target.result, file.type);
		editor.fileSystem.writeBlob(this.currList.path + info.name + "." + ext, blob, this._handleOnFileLoad.bind(this));		
	},

	_handleOnFileLoad: function(path)
	{
		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
			editor.saveCfg();
		}
	},	

	//
	name: "Resources",

	upload: null,

	numItemsLoading: 0
});
