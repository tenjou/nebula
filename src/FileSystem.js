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
	},	

	create: function(filename, cb)
	{
		var self = this;

		this.fs.getFile(this.rootDir + filename, {
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

		this.fs.getFile(this.rootDir + filename, {},
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

		this.fs.getFile(this.rootDir + filename, { create: true },
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
					fileWritter.onwriteend = function() 
					{
						if(cb) {
							cb(true);
						}						
					}

					var blob = new Blob([ contents ], { type: "text/plain" });
					fileWritter.write(blob);
				};

				fileWritter.onerror = function() 
				{
					console.error("(FileSystem::write) Could not write in " + fileEntry.name);
					if(cb) {
						cb(false);
					}
				};

				fileWritter.truncate(1);
			},
			function(fileError) {
				self.handleError(fileError, cb, "createWritter", filename);
			});
	},

	writeBlob: function(filename, blob, cb)
	{
		var self = this;

		this.fs.getFile(this.rootDir + filename, { create: true },
			function(fileEntry) {
				self.handleWriteBlobDone(fileEntry, blob, cb);
			},
			function(fileError) {
				self.handleError(fileError, cb, "writeBlob", filename);
			});
	},

	handleWriteBlobDone: function(fileEntry, blob, cb)
	{
		var self = this;

		fileEntry.createWriter(
			function(fileWritter) 
			{
				fileWritter.onwriteend = function() 
				{
					fileWritter.onwriteend = function() 
					{
						if(cb) {
							cb(true);
						}						
					}

					fileWritter.write(blob);
				};

				fileWritter.onerror = function() 
				{
					console.error("(FileSystem::writeBlob) Could not write blob in " + fileEntry.name);
					if(cb) {
						cb(false);
					}
				};

				fileWritter.truncate(1);
			},
			function(fileError) {
				self.handleError(fileError, cb, "createWritter", filename);
			});
	},	

	remove: function(filename, cb)
	{

	},

	checkDir: function(name, cb)
	{
		var self = this;

		this.fs.getDirectory(this.rootDir + name, {},
			function(dirEntry) 
			{
				if(cb) {
					cb(true);
				}
			},
			function(fileError) {
				self.handleError(fileError, cb, "checkDir", name);
			});
	},

	readDir: function(name, cb)
	{
		var self = this;

		this.fs.getDirectory(this.rootDir + name, {},
			function(dirEntry) 
			{
				var dirReader = dirEntry.createReader();
				var entries = [];

				dirReader.readEntries(
					function(results) 
					{
						if(results.length) 
						{
							entries = entries.concat(results);
							
							if(cb) {
								cb(entries);
							}
						}
					},
					function(fileError) {
						self.handleError(fileError, cb, "readDir", name);
					});
			},
			function(fileError) {
				self.handleError(fileError, cb, "readDir", name);
			});
	},

	createDir: function(name, cb)
	{
		var self = this;

		this.fs.getDirectory(this.rootDir + name, { create: true },
			function(dirEntry) 
			{
				if(cb) {
					cb(true);
				}
			},
			function(fileError) {
				self.handleError(fileError, cb, "createDir", name);
			});
	},

	removeDir: function(name, cb)
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
			cb(false);
		}		
	},

	//
	ready: false,

	fs: null,
	onReady: null,

	rootDir: ""
});
