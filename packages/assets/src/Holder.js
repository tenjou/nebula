"use strict";

module.class("Holder",
{
	init: function() 
	{
		var self = this;
		this.element = document.createElement("div");
		this.element.setAttribute("class", "holder");
		this.element.addEventListener("dragover", function(event) { self.handleDragOver(event); }, false);
		this.element.addEventListener("drop", function(event) { self.handleFileSelect(event); }, false);	
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

		var file, reader;
		var files = event.dataTransfer.files;
		var numFiles = files.length;
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
					console.log(ext);

					var item = new module.exports.Item(self);
					item.name = idName;
					item.img = fileResult.target.result;
					self.element.appendChild(item.element);

					var blob = dataURItoBlob(fileResult.target.result, file.type);

					self.data[idName] = {
						name: idName,
						path: "",
						ext: file.type,
						lastModified: file.lastModified
					};

					console.log("assets/" + idName + ext);

					editor.fileSystem.writeBlob("assets/" + idName + ext, blob)
					editor.saveJSON();
				}
			})(file);
			reader.readAsDataURL(file);
		}
	},

	//
	element: null,
	
	activeItem: null
});

function dataURItoBlob(dataURI, type) 
{
	var binary = atob(dataURI.split(",")[1]);
	var length = binary.length;
	var array = new Uint8Array(length);

	for(var n = 0; n < length; n++) {
	    array[n] = binary.charCodeAt(n);
	}

	return new Blob([ array ], { type: type });
}

