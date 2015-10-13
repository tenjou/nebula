"use strict";

meta.class("Assets.Item",
{
	init: function() 
	{
		var self = this;

		var template = document.getElementById("template-assets-item");
		this.element = template.children[0].cloneNode(true);
		this.element.addEventListener("dragover", function(event) { self.handleDragOver(event); }, false);
		this.element.addEventListener("drop", function(event) { self.handleFileSelect(event); }, false);	
	},

	handleDragOver: function(event) 
	{
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";

		console.log("drag-over-item");
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

					self.name = name.substr(0, wildcardIndex);
					self.img = fileResult.target.result;
				}
			})(file);
			reader.readAsDataURL(file);
		}

		console.log("file-select")
	},

	set name(name) {
		this.element.querySelector("span.name").innerHTML = name;
	},

	set img(img) {
		this.element.querySelector("img").src = img;
	},

	//
	element: null
});