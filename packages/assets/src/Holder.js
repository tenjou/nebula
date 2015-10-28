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

		this.removeItemFunc = function(data) {
			console.log(data);
		};

		this.data = data;
		this.items = [];
		this.freeItems = [];
		this.loadAssets();
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
			item.img = editor.dirPath + itemInfo.name + "." + 
				itemInfo.type.substr(itemInfo.type.indexOf("/") + 1);
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
			removeButton.addEventListener("click", function() {
				self.removeItem(item);
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

		var self = this;

		var file, reader, item;
		var files = event.dataTransfer.files;
		var numFiles = files.length;
		this.numItemsLoading += numFiles;

		function createCb(path) {
			return function() { console.log(path); }
		}

		for(var n = 0; n < numFiles; n++) 
		{
			file = files[n];
			if(!file.type.match("image.*")) {
				continue;
			}

			reader = new FileReader();
			reader.onload = (function(file) {
				return function(fileResult) 
				{
					var name = encodeURIComponent(file.name);
					var wildcardIndex = name.indexOf(".");
					var idName = name.substr(0, wildcardIndex);
					var ext = name.substr(wildcardIndex);

					var blob = dataURItoBlob(fileResult.target.result, file.type);

					item = self.createItem();
					item.name = name;

					// TODO: Check if there is such name in the folder already.

					self.data.push({
						name: idName,
						path: "",
						type: file.type,
						lastModified: file.lastModified
					});

					var cb = (function(item) {
						return function(path) {
							item.img = path;
						}
					}(item));

					editor.fileSystem.writeBlob(idName + ext, blob, cb);
					editor.saveJSON();
				}
			})(file);
			reader.readAsDataURL(file);
		}
	},

	//
	data: null,
	element: null,
	activeItem: null,

	items: null,
	freeItems: null,

	numItemsLoading: 0,

	_uniqueItemId: 0,
});

