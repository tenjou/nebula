"use strict";

meta.class("Editor.FileSystem", 
{
	init: function()
	{
		this.onReady = meta.createChannel("fileSystem_onReady");

		var self = this;

		navigator.webkitPersistentStorage.requestQuota(64 * 1024 * 1024, 
			function(grantedBytes) 
			{
				requestFileSystem(PERSISTENT, grantedBytes, 
					function(fs) {
						self.handleFileSystemSuccess(fs);
					}, 
					function(fileError) {
						self.handleError(fileError, "init");
					});
			},
			function(error) {
				console.error("(webkitPersistentStorage) " + error);
			});
	},

	handleFileSystemSuccess: function(fs)
	{
		this.fs = fs.root;
		this.ready = true;
		this.onReady.emit(this, true);

		console.log("Opened file system: " + fs.name);
	},	

	create: function(filename, cb)
	{
		var self = this;

		this.fs.getFile(filename, {
				create: true
			},
			function(fileEntry) 
			{
				self.handleCreateDone(fileEntry);
				if(cb) {
					cb();
				}				
			},
			function(fileError) {
				self.handleError(fileError, "create", filename);
			});
	},

	handleCreateDone: function(fileEntry) {},
 
	read: function(filename, cb)
	{
		var self = this;

		this.fs.getFile(filename, {},
			function(fileEntry) {
				self.handleReadDone(fileEntry, cb);
			},
			function(fileError) {
				self.handleError(fileError, cb, "create", filename);
			});
	},

	handleReadDone: function(fileEntry, cb) 
	{
		var self = this;

		fileEntry.file(
			function(file) 
			{
				var reader = new FileReader();
				reader.onload = function() 
				{
					if(cb) {
						cb(this.result);
					}
				};

				reader.readAsText(file);
			},
			function(fileError) {
				self.handleError(fileError, cb, "read", fileError.name);
			});
	},	

	write: function(filename, contents, cb)
	{
		var self = this;

		this.fs.getFile(filename, {},
			function(fileEntry) {
				self.handleWriteDone(fileEntry, contents, cb);
			},
			function(fileError) {
				self.handleError(fileError, cb, "write", filename);
			});
	},

	handleWriteDone: function(fileEntry, contents, cb)
	{
		var self = this;

		fileEntry.createWriter(
			function(fileWritter) 
			{
				fileWritter.onwriteend = function() 
				{
					if(cb) {
						cb(true);
					}
				};

				fileWritter.onerror = function() 
				{
					console.error("(FileSystem::write) Could not write in " + fileEntry.name);
					if(cb) {
						cb(false);
					}
				};

				var blob = new Blob([ contents ], { type: "text/plain" });
				fileWritter.write(blob);
			},
			function(fileError) {
				self.handleError(fileError, cb, "createWritter", filename);
			});
	},

	remove: function(filename, cb)
	{

	},

	handleError: function(fileError, cb, type, filename) 
	{
		if(type === "read" && fileError.name !== "NotFoundError")
		{
			if(filename) {
				console.error("(FileSystem::" + type + ")", "[" + filename + "]", fileError.name);
			}
			else {
				console.error("(FileSystem::" + type + ")", fileError.name);
			}	
		}

		if(cb) {
			cb(null);
		}		
	},

	//
	ready: false,

	fs: null,
	onReady: null
});
