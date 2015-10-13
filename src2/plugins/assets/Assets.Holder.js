"use strict";

meta.class("Assets.Holder",
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

					var item = new Assets.Item();
					item.name = idName;
					item.img = fileResult.target.result;
					self.element.appendChild(item.element);

					self.data[idName] = {
						name: idName,
						path: "",
						ext: file.type,
						lastModified: file.lastModified
					};
					//editor.fileSystem.write("assets/")
					editor.saveJSON();
				}
			})(file);
			reader.readAsDataURL(file);
		}
	},

	//
	element: null,
	holder: null
});
