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

	updateItemDeps: function(newId, prevId, info) 
	{
		var lookup, item;
		var plugin = editor.plugins.AssetBrowser;

		if(info._type === "mesh") 
		{
			lookup = plugin.contentDefs.ctrls[0].dbLookup;
			for(var key in lookup) 
			{
				item = lookup[key];
				if(item.data._type !== "entityPrefab") { continue; }

				if(item.data.mesh === prevId) {
					item.data.mesh = newId;
				}
			}
		}
		else if(info._type === "texture" || info._type === "video") 
		{
			lookup = plugin.contentDefs.ctrls[0].dbLookup;
			for(var key in lookup) 
			{
				item = lookup[key];
				if(item.data._type !== "material") { continue; }

				if(item.data.map === prevId) {
					item.data.map = newId;
				}
				if(item.data.aoMap === prevId) {
					item.data.aoMap = newId;
				}	
				if(item.data.alphaMap === prevId) {
					item.data.alphaMap = newId;
				}									
				if(item.data.envMap === prevId) {
					item.data.envMap = newId;
				}
				if(item.data.specularMap === prevId) {
					item.data.specularMap = newId;
				}		
			}

			lookup = plugin.contentResources.ctrls[0].dbLookup;
			for(var key in lookup) 
			{
				item = lookup[key];
				if(item.data._type !== "cubemap") { continue; }

				if(item.data.nx === prevId) {
					item.data.nx = newId;
				}
				if(item.data.ny === prevId) {
					item.data.ny = newId;
				}
				if(item.data.nz === prevId) {
					item.data.nz = newId;
				}
				if(item.data.px === prevId) {
					item.data.px = newId;
				}
				if(item.data.py === prevId) {
					item.data.py = newId;
				}
				if(item.data.pz === prevId) {
					item.data.pz = newId;
				}																				
			}			
		}

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

		var currList = this.currList;
		var info = {
			name: idName,
			id: idName,
			_ext: ext,
			_type: editor.resourceMgr.getTypeFromExt(ext),
			_lastModified: file.lastModified
		};

		// TODO: Correct name should be known before writting.
		this.makeNameUnique(info);

		var self = this;
		var filePath = info.name + "." + ext;		

		if(editor.electron)
		{
			editor.fileSystem.writeBase64(filePath, fileResult.target.result, function(path) {
				self._handleOnFileLoad(path, currList, info);
			});	
		}
		else
		{
			var blob = dataURItoBlob(fileResult.target.result, file.type);
			editor.fileSystem.writeBlob(filePath, blob, function(path) {
				self._handleOnFileLoad(path, currList, info);
			});				
		}	
	},

	_handleOnFileLoad: function(path, currList, info)
	{
		this.addItem(currList, info);

		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
		}
	},	

	//
	name: "Resources",

	upload: null,

	numItemsLoading: 0
});
