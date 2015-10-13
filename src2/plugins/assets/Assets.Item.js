"use strict";

meta.class("Assets.Item",
{
	init: function(holder) 
	{
		this.holder = holder;

		var self = this;
		var template = document.getElementById("template-assets-item");
		this.element = template.children[0].cloneNode(true);
		this.element.addEventListener("click", function(event) { self.activate(); }, false);
		this.element.addEventListener("dragover", function(event) { self.handleDragOver(event); }, false);
		this.element.addEventListener("drop", function(event) { self.handleFileSelect(event); }, false);	
	},

	activate: function()
	{
		if(this.holder.activeItem) {
			this.holder.activeItem.element.setAttribute("class", "item");
		}

		this.holder.activeItem = this;
		this.element.setAttribute("class", "item active");
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

					self.name = name.substr(0, wildcardIndex);
					self.img = fileResult.target.result;
				}
			})(file);
			reader.readAsDataURL(file);
		}
	},

	set name(name) {
		this.element.querySelector("span.name").innerHTML = name;
	},

	set img(img) {
		this.element.querySelector("img").src = img;
	},

	//
	element: null,
	holder: null
});