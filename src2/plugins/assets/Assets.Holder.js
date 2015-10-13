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

		console.log("drag-over");
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

					var item = new Assets.Item();
					item.name = name.substr(0, wildcardIndex);
					item.img = fileResult.target.result;
					self.element.appendChild(item.element);
				}
			})(file);
			reader.readAsDataURL(file);
		}

		console.log("file-select")
	},

	//
	element: null
});
