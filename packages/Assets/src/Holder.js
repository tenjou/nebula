"use strict";

module.class("Holder",
{
	init: function(data) 
	{
		var self = this;

		this.element = document.createElement("div");
		this.element.setAttribute("class", "holder");
		this.element.addEventListener("dragover", function(event) { self.handleDragOver(event); }, false);
		this.element.addEventListener("drop", function(event) { self.handleFileSelect(event); }, false);
		this.element.addEventListener("click", 
			function(event) {
				self.deselect();
			});
		window.addEventListener("keydown",
			function(event) 
			{
				switch(event.keyCode)
				{
					case Input.Key.DELETE:
						self.tryRemoveItems();
						break;
				}
			});	

		this.createSpanEditElement();	

		this.data = data;
		this.items = [];
		this.freeItems = [];
		this.loadAssets();
	},

	createSpanEditElement: function()
	{
		var self = this;

		this.spanEditElement = document.createElement("input");
		this.spanEditElement.setAttribute("class", "editable");
		this.spanEditElement.addEventListener("dblclick",
			function(event) {
				event.stopPropagation();
			});		
		this.spanEditElement.addEventListener("keydown",
			function(event) 
			{
				switch(event.keyCode)
				{
					case Input.Key.ESC:
						self.cancelRename();
						break;
					case Input.Key.ENTER:
						self.rename();
						break;
				}
			});	
	},

	loadAssets: function()
	{
		var item, itemInfo;
		var num = this.data.length;
		for(var n = 0; n < num; n++)
		{
			itemInfo = this.data[n];
			item = this.createItem();
			item.name = itemInfo.name;
			item.info = itemInfo;
			item.img = editor.dirPath + itemInfo.name + "." + itemInfo.ext;
		}
	},

	createItem: function()
	{
		var item;

		if(this.freeItems.length > 0) {
			item = this.freeItems.pop();
		}
		else
		{
			var self = this;

			item = new module.exports.Item(self);
			item.element.setAttribute("data-id", this._uniqueItemId++);
		
			var removeButton = item.element.querySelector(".close");
			removeButton.addEventListener("click", 
				function(event) {
					self.removeItem(item);
				});

			var spanEdit = item.element.querySelector("span");
			spanEdit.addEventListener("dblclick",
				function(event) {
					self.startRenameItem(event);
				});
		}

		this.items.push(item);
		this.element.appendChild(item.element);

		return item;
	},

	removeItem: function(item)
	{
		var num = this.items.length;
		for(var n = 0; n < num; n++) 
		{
			if(this.items[n] === item) 
			{
				this.freeItems.push(item);
				this.items[n] = this.items[num - 1];
				this.items.pop();

				this.element.removeChild(item.element);
				break;
			}
		}

		// Remove from the json data.
		num = this.data.length;
		for(n = 0; n < num; n++) 
		{
			if(this.data[n] === item.info) {
				this.data.splice(n, 1);
				break;
			}
		}

		// Remove from the file system:
		var path = item.info.name + "." + item.info.ext;
		editor.fileSystem.remove(path);
		editor.save();

		item.info = null;
	},

	tryRemoveItems: function()
	{
		if(this.activeItem) {
			this.removeItem(this.activeItem);
			this.activeItem = null;
		}
	},

	startRenameItem: function(item)
	{
		var parentNode = this.spanEditElement.parentNode;
		if(parentNode) {
			parentNode.removeChild(this.spanEditElement);
			parentNode.innerHTML = this.spanEditElement.value;
		}

		var span = item.srcElement;
		this.prevSpanValue = span.innerHTML;
		this.spanEditElement.value = span.innerHTML;

		span.innerHTML = "";
		span.appendChild(this.spanEditElement);
		this.spanEditElement.select();
	},

	cancelRename: function()
	{
		var parentNode = this.spanEditElement.parentNode;
		if(parentNode) {
			parentNode.removeChild(this.spanEditElement);
			parentNode.innerHTML = this.prevSpanValue;
		}

		this.prevSpanValue = "";
	},

	rename: function()
	{
		var parentNode = this.spanEditElement.parentNode;
		if(parentNode) 
		{
			var itemElement = findAncestor(this.spanEditElement, "item");
			var item = this.items[itemElement.dataset.id];

			// if name is not unique:
			var spanName = this.createUniqueName(this.spanEditElement.value);
			if(spanName === this.spanEditElement.value) 
			{
				var oldPath = item.info.name + "." + item.info.ext;

				item.info.name = this.spanEditElement.value;
				var newPath = item.info.name + "." + item.info.ext;

				editor.fileSystem.moveTo(oldPath, newPath, 
					function(result) {
						if(result) {
							editor.save();
						}
					});

				parentNode.removeChild(this.spanEditElement);
				parentNode.innerHTML = this.spanEditElement.value;
			}
			else {
				parentNode.removeChild(this.spanEditElement);
				parentNode.innerHTML = this.prevSpanValue;
				this.prevSpanValue = "";			
			}
		}
	},

	deselect: function()
	{
		if(this.activeItem) {
			this.activeItem.element.setAttribute("class", "item");
		}

		this.cancelRename();
	},

	handleDragOver: function(event) 
	{
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	},	

	handleFileSelect: function(event)
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

	readFile: function(file)
	{
		if(!file.type.match("image.*")) {
			return;
		}

		this.numItemsLoading++;

		var self = this;

		var reader = new FileReader();
		reader.onload = (function(file) {
			return function(fileResult) 
			{
				var name = encodeURIComponent(file.name);
				var wildcardIndex = name.indexOf(".");
				var idName = name.substr(0, wildcardIndex);
				var ext = name.substr(wildcardIndex + 1);

				var blob = dataURItoBlob(fileResult.target.result, file.type);

				// Check if there is such name in the folder already:
				idName = self.createUniqueName(idName);

				// Info:
				var info = {
					name: idName,
					ext: ext,
					lastModified: file.lastModified
				};
				self.data.push(info);					

				var item = self.createItem();
				item.name = idName;
				item.info = info;

				var cb = (function(item) {
					return function(path) 
					{
						item.img = path;
						self.numItemsLoading--;
						if(self.numItemsLoading === 0) {
							editor.save();
						}
					}
				}(item));

				editor.fileSystem.writeBlob(idName + "." + ext, blob, cb);
			}
		})(file);
		reader.readAsDataURL(file);
	},

	createUniqueName: function(name)
	{
		var info;
		var uniqueName = name;
		var inc = 2;		
		var num = this.items.length;

		uniqName:
		for(;;)
		{
			for(var n = 0; n < num; n++) 
			{
				info = this.items[n].info;
				if(info.name === uniqueName) {
					uniqueName = name + "-" + inc;
					inc++;
					continue uniqName;
				}
			}

			return uniqueName;
		}
	},	

	//
	data: null,
	element: null,
	activeItem: null,

	items: null,
	freeItems: null,

	spanEditElement: null,
	prevSpanValue: "",

	numItemsLoading: 0,

	_uniqueItemId: 0,
});

