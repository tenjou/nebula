"use strict";

editor.plugin("browser",
{
	create: function()
	{
		wabi.addTemplate("browserHierarchy", {
			type: "panel",
			$header: "Hierarchy",
			$value: [
				{
					id: "hierarchy",
					type: "list",
					itemCls: "browserListItem",
					bind: "*"
				}
			]
		});

		wabi.addTemplate("browserResources", {
			type: "panel",
			$header: "Resources",
			$value: [
				{
					id: "resources",
					type: "list",
					itemCls: "browserListItem",
					bind: "*"
				},
				{
					type: "upload",
					hidden: true
				}
			]
		});

		wabi.addTemplate("browserDefs", {
			type: "panel",
			$header: "Defs",
			$value: [
				{
					id: "defs",
					type: "list",
					itemCls: "browserListItem",
					bind: "*"
				}
			]
		});

		editor.plugins.contextmenu.add("resources", {
			Create: {
				type: "category",
				content: {
					Folder: {
						icon: "fa-folder",
						func: this.createFolder.bind(this)
					}
				}
			},
			Actions: {
				type: "category",
				content: {
					Upload: {
						icon: "fa-upload",
						func: this.upload.bind(this)
					}
				}
			}
		});

		editor.plugins.contextmenu.add("resourcesItem", "resources", {
			Actions: {
				type: "category",
				content: {
					Delete: {
						icon: "fa-trash",
						func: this.deleteResourceItem.bind(this)
					}
				}
			}
		});
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

		var content = editor.plugins.layout.toolbarBrowser.elements.content;
		content.setCls("browser", true);

		this.createHierarchyPanel(content, this.cache);

		this.cache = this.browserHierarchy.get("#hierarchy").cache;

		this.createResourcePanel(content, this.cache);
		this.createDefsPanel(content, this.cache);
	},

	createHierarchyPanel: function(parent, cache)
	{
		this.browserHierarchy = wabi.createTemplate("browserHierarchy");
		this.browserHierarchy.data = this.hierarchy;
		this.browserHierarchy.on("contextmenu", "list", function(event) {
			editor.plugins.contextmenu.show("hierarchy", event.x, event.y);
		});
		this.browserHierarchy.on("contextmenu", "browserListItem", function(event) {
			this.openContextMenu("hierarchyItem", event);
		}, this);
		this.browserHierarchy.on("click", "browserListItem", this.inspectItem, this);
		this.browserHierarchy.appendTo(parent);		
	},

	createResourcePanel: function(parent, cache)
	{
		this.browserResources = wabi.createTemplate("browserResources");
		this.browserResources.get("#resources").cache = this.cache;
		this.browserResources.data = this.resources;
		this.browserResources.on("drop", [ "list", "browserListItem" ], this.handleResourceDrop, this);
		this.browserResources.on("dragenter", [ "list", "browserListItem" ], this.handleDragEnter, this);
		this.browserResources.on("dragleave", [ "list", "browserListItem" ], this.handleDragLeave, this);

		var list = this.browserResources.get("list")[0];
		list.on("contextmenu", function(event) {
			editor.plugins.contextmenu.show("resources", event.x, event.y);
		});
		list.on("click", "browserListItem", this.inspectItem, this);
		list.on("contextmenu", "browserListItem", function(event) {
			this.openContextMenu("resourcesItem", event);
		}, this);

		this.resourceUpload = this.browserResources.get(wabi.element.upload)[0];
		this.resourceUpload.on("change", this.handleUpload, this);
		
		this.browserResources.appendTo(parent);		
	},

	createDefsPanel: function(parent, cache)
	{
		this.browserDefs = wabi.createTemplate("browserDefs");
		this.browserDefs.get("#defs").cache = this.cache;
		this.browserDefs.data = this.defs;
		this.browserDefs.on("contextmenu", "list", function(event) {
			editor.plugins.contextmenu.show("defs", event.x, event.y);
		});
		this.browserDefs.on("contextmenu", "browserListItem", function(event) {
			this.openContextMenu("defsItem", event);
		});
		this.browserDefs.on("click", "browserListItem", this.inspectItem, this);

		var list = this.browserDefs.get("list")[0];

		this.browserDefs.appendTo(parent);		
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

	upload: function() {
		this.resourceUpload.open();
	},

	handleUpload: function(event) 
	{
		var files = event.element.files;
		for(var n = 0; n < files.length; n++) {
			this.readFile(files[n]);
		}
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
		reader.onload = function(fileResult) 
		{
			editor.writeFile(file, fileResult, function(hash, type) {
				self.resources.add(hash, "*" + type + "." + hash);
			});
		};

		reader.readAsDataURL(file);
	},

	_handleOnFileLoad: function(path, currList, info)
	{
		this.addItem(currList, info);

		this.numItemsLoading--;
		if(this.numItemsLoading === 0) {
		}
	},

	openContextMenu: function(menuId, event)
	{
		editor.plugins.contextmenu.show(menuId, event.x, event.y);
		this.inspectItem(event);
	},

	inspectItem: function(event) {
		event.element.select = true;
		editor.plugins.inspect.show(event.element.data);
	},

	deleteItem: function(event)
	{

	},

	deleteResourceItem: function(event)
	{
		var selected = this.cache.selected;
		if(!selected) { return; }

		editor.deleteFile(selected.data);	
	},

	//
	hierarchy: null,
	resources: null,
	defs: null,

	browserHierarchy: null,
	browserResources: null,
	browserDefs: null,

	resourceUpload: null,
	cache: null
});
