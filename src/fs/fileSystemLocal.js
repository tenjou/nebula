"use strict";

editor.fileSystemLocal = 
{
	init: function() {
		this.fs = require("fs");
		editor.handleFsReady();
	},

	read: function(path, cb)
	{
		this.fs.readFile(this.rootDir + path,
			function(error, data)
			{
				if(error)
				{
					if(cb) {
						cb(null);
					}

					return;
				}

				if(cb) {
					cb(data.toString());
				}
			});
	},

	create: function(path, cb)
	{
		var self = this;

		var fullPath = this.rootDir + path;
		this.fs.writeFile(fullPath, "",
			function(error)
			{
				if(error) {
					self.handleError("create", error, cb);
					return;
				}

				if(cb) {
					cb(fullPath);
				}
			});
	},

	write: function(path, content, cb)
	{
		var self = this;

		var fullPath = this.rootDir + path;
		this.fs.writeFile(fullPath, content,
			function(error)
			{
				if(error) {
					self.handleError("write", error, cb);
					return;
				}

				if(cb) {
					cb(content);
				}
			});
	},

	writeBase64: function(path, base64, cb)
	{
		var self = this;

		var index = base64.indexOf(",");
		var base64Data = base64.slice(index);
		base64Data += base64Data.replace("+", " ");
		var binaryData = new Buffer(base64Data, "base64").toString("binary");

		var fullPath = this.rootDir + path;
		this.fs.writeFile(fullPath, binaryData, "binary",
			function(error)
			{
				if(error) {
					self.handleError("write64", error, cb);
					return;
				}

				if(cb) {
					cb(path);
				}
			});
	},

	remove: function(path, cb)
	{
		var self = this;

		this.fs.unlink(this.rootDir + path,
			function(error)
			{
				if(error) {
					self.handleError("remove", error, cb);
					return;
				}

				if(cb) {
					cb(path);
				}
			});
	},

	moveTo: function(path, targetPath, cb)
	{
		var self = this;

		this.fs.rename(this.rootDir + path, this.rootDir + targetPath,
			function(error)
			{
				if(error) {
					self.handleError("moveTo", error, cb);
					return;
				}

				if(cb) {
					cb(path);
				}
			});
	},

	checkDir: function(path, cb)
	{
		var self = this;

		this.fs.exists(this.rootDir + path,
			function(error)
			{
				if(error) {
					self.handleError("checkDir", error, cb);
					return;
				}

				if(cb) {
					cb(fullPath);
				}
			});
	},

	readDir: function(path, cb)
	{
		var self = this;

		this.fs.readdir(this.rootDir + path,
			function(error, files)
			{
				if(error) {
					self.handleError("readDir", error, cb);
					return;
				}

				if(cb) {
					cb(files);
				}
			});
	},

	createDir: function(path, cb)
	{
		var self = this;

		var fullPath = this.rootDir + path;
		this.fs.exists(fullPath,
			function(error)
			{
				if(error) {
					self.handleError("createDir", "There is already folder with in: " + fullPath, cb);
					return;
				}

				self.fs.mkdir(fullPath,
					function(error)
					{
						if(error) {
							self.handleError("createDir", error, cb);
							return;
						}

						if(cb) {
							cb(fullPath);
						}
					});
			});
	},

	removeDir: function(path, cb)
	{
		var self = this;

		this.fs.readdir(this.rootDir + path,
			function(error, files)
			{
				if(error) {
					self.handleError("removeDir", error, cb);
					return;
				}

				var wait = files.length;
				var count = 0;
				var folderDone = function(error)
				{
					count++;
					if(count >= wait || error)
					{
						self.fs.rmdir(self.rootDir + path,
							function(error)
							{
								if(error) {
									self.handleError("removeDir", error, cb);
									return;
								}

								if(cb) {
									cb(self.rootDir + path);
								}
							});
					}
				};

				if(!wait) {
					folderDone(null);
					return;
				}

				path = path.replace(/\/+$/,"");
				files.forEach(
					function(file)
					{
						var currPath = path + "/" + file;
						self.fs.lstat(self.rootDir + currPath,
							function(error, stats)
							{
								if(error) {
									self.handleError("removeDir", error, cb);
									return;
								}

								if(stats.isDirectory()) {
									self.removeDir(currPath, folderDone);
								}
								else {
									self.fs.unlink(self.rootDir + currPath, folderDone);
								}
							});
					});
		});
	},

	moveToDir: function(path, targetPath, cb)
	{
		var self = this;

		this.fs.rename(this.rootDir + path, this.rootDir + targetPath,
			function(error)
			{
				if(error) {
					self.handleError("moveToDir", error, cb);
					return;
				}

				if(cb) {
					cb(path);
				}
			});
	},

	handleError: function(type, error, cb)
	{
		console.error("(editor.fileSystemLocal." + type + ")", error);
		if(cb) {
			cb("");
		}
	},

	//
	rootDir: "",
	fullPath: ""
};
