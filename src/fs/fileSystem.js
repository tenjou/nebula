"use strict";

// TODO: queue system for files.

editor.fileSystem =
{
	init: function()
	{
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
		editor.handleFsReady();
	},

	create: function(filename, cb)
	{
		var self = this;
		var path = this.rootDir + filename;

		this.fs.getFile(path, {
				create: true
			},
			function(fileEntry)
			{
				if(cb) {
					cb();
				}
			},
			function(fileError) {
				self.handleError(fileError, cb, "create", filename);
			});
	},

	read: function(filename, cb)
	{
		var self = this;

		this.fs.getFile(this.rootDir + filename, {},
			function(fileEntry) {
				self.handleReadDone(fileEntry, cb);
			},
			function(fileError) {
				self.handleError(fileError, cb, "read", filename);
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

	write: function(filename, content, cb)
	{
		var self = this;

		this.fs.getFile(this.rootDir + filename, { create: true },
			function(fileEntry) {
				self.writeContent(fileEntry, content, cb);
			},
			function(fileError) {
				self.handleError(fileError, cb, "write", filename);
			});
	},

	writeContent: function(fileEntry, content, cb)
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
							cb(content);
						}
					}

					var blob = new Blob([ content ], { type: "text/plain" });
					fileWritter.write(blob);
				};

				fileWritter.onerror = function()
				{
					console.error("(FileSystem::write) Could not write in " + fileEntry.name);
					if(cb) {
						cb(null);
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
							cb(fileEntry.toURL());
						}
					}

					fileWritter.write(blob);
				};

				fileWritter.onerror = function()
				{
					console.error("(FileSystem::writeBlob) Could not write blob in " + fileEntry.name);
					if(cb) {
						cb(null);
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
		var self = this;

		this.fs.getFile(this.rootDir + filename, { create: false },
			function(fileEntry)
			{
				fileEntry.remove(
					function()
					{
						if(cb) {
							cb(fileEntry.toURL());
						}
					},
					function(fileError) {
						self.handleError(fileError, cb, "remove", filename);
					});
			},
			function(fileError) {
				self.handleError(fileError, cb, "remove", filename);
			});
	},

	moveTo: function(path, targetPath, cb)
	{
		var self = this;

		var targetPathIndex = targetPath.lastIndexOf("/") + 1;

		this.fs.getFile(this.rootDir + path, {},
			function(fileEntry)
			{
				self.fs.getDirectory(self.rootDir + targetPath.substr(0, targetPathIndex), {},
					function(dirEntry)
					{
						fileEntry.moveTo(dirEntry, targetPath.substr(targetPathIndex),
							function(fileEntry)
							{
								if(cb) {
									cb(fileEntry.toURL());
								}
							},
						function(fileError) {
							self.handleError(fileError, cb, "rename", path);
						});
					},
					function(fileError) {
						self.handleError(fileError, cb, "rename-getDir", path);
					});
			},
			function(fileError) {
				self.handleError(fileError, cb, "rename-getFile", path);
			});
	},

	checkDir: function(name, cb)
	{
		var self = this;

		this.fs.getDirectory(this.rootDir + name, {},
			function(dirEntry)
			{
				if(cb) {
					cb(dirEntry.toURL());
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
						if(results.length) {
							entries = entries.concat(results);
						}

						if(cb) {
							cb(entries);
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
					cb(dirEntry.toURL());
				}
			},
			function(fileError) {
				self.handleError(fileError, cb, "createDir", name);
			});
	},

	removeDir: function(name, cb)
	{
		var self = this;

		this.fs.getDirectory(this.rootDir + name, {},
			function(dirEntry)
			{
				dirEntry.removeRecursively(
					function()
					{
						if(cb) {
							cb(dirEntry.toURL());
						}
					},
					function(fileError) {
						self.handleError(fileError, cb, "remove", filename);
					});
			},
			function(fileError) {
				self.handleError(fileError, cb, "removeDir", name);
			});
	},

	moveToDir: function(path, targetPath, cb)
	{
		var self = this;

		var targetPathIndex = targetPath.lastIndexOf("/") + 1;

		this.fs.getDirectory(this.rootDir + path, {},
			function(parentDirEntry)
			{
				self.fs.getDirectory(self.rootDir + targetPath.substr(0, targetPathIndex), {},
					function(dirEntry)
					{
						parentDirEntry.moveTo(dirEntry, targetPath.substr(targetPathIndex),
							function(newDirEntry)
							{
								if(cb) {
									cb(newDirEntry.toURL());
								}
							},
						function(fileError) {
							self.handleError(fileError, cb, "rename", path);
						});
					},
					function(fileError) {
						self.handleError(fileError, cb, "rename-getDir", path);
					});
			},
			function(fileError) {
				self.handleError(fileError, cb, "rename-getParentDir", path);
			});
	},

	handleError: function(fileError, cb, type, filename)
	{
		if(type === "read" && fileError.name !== "NotFoundError")
		{
			if(filename) {
				console.error("(editor.fileSystem) [" + type + "]", "[" + filename + "]", fileError.name);
			}
			else {
				console.error("(editor.fileSystem) [" + type + "]", fileError.name);
			}
		}

		if(cb) {
			cb(null);
		}
	},

	//
	fs: null,

	rootDir: "",
	ready: false
};
