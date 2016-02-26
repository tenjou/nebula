"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function()
	{
		this.element.ondragover = this._handleOnDragOver;
		this.element.ondrop = this._handleOnDrop;
		this.element.onclick = function() {
			this.emit("click");
		}.bind(this);
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

		var holder = event.currentTarget.holder;
		holder.handleFileSelect.call(holder, event);
	},

	handleFileSelect: function(event)
	{
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
		// if(!file.type.match("image.*")) {
		// 	return;
		// }

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

		var blob = dataURItoBlob(fileResult.target.result, file.type);


		var item = new Element.BrowserItem(this);
		item.name = idName;
		item.tag = ext;
		item.icon = editor.resourceMgr.getIconFromExt(ext);

		// Check if there is such name in the folder already:
		//idName = self.createUniqueName(idName);

		// // Info:
		// var info = {
		// 	name: idName,
		// 	ext: ext,
		// 	lastModified: file.lastModified
		// };
		// self.data.push(info);					

		// var item = self.createItem();
		// item.name = idName;
		// item.info = info;

		// var cb = (function(item) {
		// 	return function(path) 
		// 	{
		// 		item.img = path;
		// 		self.numItemsLoading--;
		// 		if(self.numItemsLoading === 0) {
		// 			editor.save();
		// 		}
		// 	}
		// }(item));
		var cb = null;

		//editor.fileSystem.writeBlob(idName + "." + ext, blob, cb);		
	},

	createItem: function(name) 
	{
		if(!this.itemCls) {
			throw "(Element.Browser.createItem): 'itemCls' is not defined";
		}

		var item = new this.itemCls(this);
		item.name = name;

		if(this._info) {
			this._info.setAttribute("class", "hidden");
		}

		return item;
	},

	set info(str) 
	{
		if(!this._info) {
			this._info = document.createElement("info");
			this.element.appendChild(this._info);			
		}

		this._info.innerHTML = str;
	},

	get info() {
		return this._info.innerHTML;
	},

	//
	elementTag: "browser",

	itemCls: null,
	_info: null
});