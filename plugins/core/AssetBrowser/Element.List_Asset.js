"use strict";

meta.class("Element.List_Asset", "Element.List",
{
	onCreate: function()
	{
		this.element.ondragover = this._handleOnDragOver.bind(this);
		this.element.ondrop = this._handleOnDrop.bind(this);		
		this._super();	
	},

	_handleOnDragOver: function(event)
	{
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	},

	_handleOnDrop: function(event)
	{
		event.stopPropagation();
		event.preventDefault();

		if(meta.device.name === "Chrome") {
			this.handleFileSelect_Chrome(event);
		}
		else {
			this.handleFileSelect_All(event);
		}
	},

	handleFileSelect_All: function(event) 
	{
		var self = this;

		var file, reader, item;
		var files = event.dataTransfer.files;
		var numFiles = files.length;

		for(var n = 0; n < numFiles; n++) {
			this.readFile(files[n]);
		}
	},	

	handleFileSelect_Chrome: function(event)
	{
		var entry;
		var dataItems = event.dataTransfer.items;
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
			ext: ext,
			type: null,
			lastModified: file.lastModified
		};
		editor.plugins.AssetsBrowser.content.addItem(info);

		var blob = dataURItoBlob(fileResult.target.result, file.type);
		editor.fileSystem.writeBlob(info.name + "." + ext, blob, this._handleOnFileLoad.bind(this));		
	},

	_handleOnFileLoad: function(path)
	{
		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
			editor.saveCfg();
		}
	},

	//
	numItemsLoading: 0
});
