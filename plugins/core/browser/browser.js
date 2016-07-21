"use strict";

editor.plugin("browser",
{
	create: function()
	{
		wabi.addTemplate("browserHierarchy", {
			type: "panel",
			header: "Hierarchy",
			value: [
				{
					id: "hierarchy",
					type: "list",
					bind: "*"
				}
			]
		});

		wabi.addTemplate("browserResources", {
			type: "panel",
			header: "Resources",
			value: [
				{
					id: "resources",
					type: "list",
					bind: "*"
				}
			]
		});

		wabi.addTemplate("browserDefs", {
			type: "panel",
			header: "Defs",
			value: [
				{
					id: "defs",
					type: "list",
					bind: "*"
				}
			]
		});

		editor.plugins.contextmenu.add("resources", [
			{
				value: "Create",
				type: "category",
				content: [
					{
						value: "Folder",
						icon: "fa-folder",
						func: this.createFolder.bind(this)
					}
				]
			},
			{
				value: "Actions",
				type: "category",
				content: [
					{
						value: "Upload",
						icon: "fa-upload",
						func: this.upload.bind(this)
					}
				]
			}
		]);

		editor.plugins.contextmenu.add("resourcesItem", "resources", [
			{
				value: "Actions",
				type: "category",
				content: [
					{
						value: "Delete",
						icon: "fa-trash",
						func: this.deleteItem.bind(this)
					}
				]
			}
		]);
	},

	install: function()
	{
		editor.dataPublic.setKeys({
			hierarchy: {},
			resources: {},
			defs: {}
		});
	},

	onStart: function()
	{
		this.loadData();

		var browserContent = editor.plugins.layout.toolbarBrowser.$elements.content;
		browserContent.setCls("browser", true);

		// HIERARCHY
		this.browserHierarchy = wabi.createTemplate("browserHierarchy");
		this.browserHierarchy.data = this.hierarchy;
		this.browserHierarchy.on("contextmenu", "list", function(event) {
			editor.plugins.contextmenu.show("hierarchy", event.x, event.y);
		});
		this.browserHierarchy.on("contextmenu", "listItem", function(event) {
			editor.plugins.contextmenu.show("hierarchyItem", event.x, event.y);
		});
		this.browserHierarchy.on("click", "listItem", this.inspectItem, this);
		this.browserHierarchy.appendTo(browserContent);

		var cache = this.browserHierarchy.get("#hierarchy").$cache;

		// RESOURCES
		this.browserResources = wabi.createTemplate("browserResources");
		this.browserResources.get("#resources").$cache = cache;
		this.browserResources.data = this.resources;
		this.browserResources.on("contextmenu", "list", function(event) {
			editor.plugins.contextmenu.show("resources", event.x, event.y);
		});
		this.browserResources.on("contextmenu", "listItem", function(event) {
			editor.plugins.contextmenu.show("resourcesItem", event.x, event.y);
		});
		this.browserResources.on("drop", "list", this.handleResourceDrop, this);
		this.browserResources.on("dragenter", [ "list", "listItem" ], this.handleDragEnter, this);
		this.browserResources.on("dragleave", [ "list", "listItem" ], this.handleDragLeave, this);
		this.browserResources.on("click", "listItem", this.inspectItem, this);
		this.browserResources.appendTo(browserContent);

		// DEFS
		this.browserDefs = wabi.createTemplate("browserDefs");
		this.browserDefs.get("#defs").cache = cache;
		this.browserDefs.data = this.defs;
		this.browserDefs.on("contextmenu", "list", function(event) {
			editor.plugins.contextmenu.show("defs", event.x, event.y);
		});
		this.browserDefs.on("contextmenu", "listItem", function(event) {
			editor.plugins.contextmenu.show("defsItem", event.x, event.y);
		});
		this.browserDefs.on("click", "listItem", this.inspectItem, this);
		this.browserDefs.appendTo(browserContent);
	},

	loadData: function()
	{
		this.hierarchy = editor.dataPublic.get("hierarchy");
		this.resources = editor.dataPublic.get("resources");
		this.defs = editor.dataPublic.get("defs");
	},

	updateIcons: function(buffer)
	{
		var resources = editor.plugins.resources;

		for(var key in buffer)
		{
			var item = buffer[key];
			item.icon = resources.getIconFromType(item.type);
		}
	},

	createFolder: function(event) {
		this.browserResources.get("#resources").createFolder();
		// event.element.createFolder();
	},

	upload: function()
	{

	},

	deleteItem: function()
	{

	},

	handleDragEnter: function(event) {
		event.stop();
		event.element.setCls("dragover", true);
	},

	handleDragLeave: function(event) {
		event.stop();
		event.element.setCls("dragover", false);
	},

	handleResourceDrop: function(event)
	{
		event.stop();

		if(meta.device.name === "Chrome") {
			this.handleFileSelect_Chrome(event.domEvent);
		}
		else {
			this.handleFileSelect_All(event.domEvent);
		}

		this.handleDragLeave(event);
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
		var self = this;

		editor.writeFile(file, fileResult, function(hash, filename, ext) {
			self.resources.add(hash, {
				value: filename,
				ext: ext,
				type: editor.plugins.resources.getTypeFromExt(ext)
			});
		});
	},

	_handleOnFileLoad: function(path, currList, info)
	{
		this.addItem(currList, info);

		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
		}
	},

	inspectItem: function(event) {
		editor.plugins.inspect.show(event.element.data);
	},

	//
	hierarchy: null,
	resources: null,
	defs: null,

	browserHierarchy: null,
	browserResources: null,
	browserDefs: null
});
