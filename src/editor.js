"use strict";

var editor =
{
	start: function()
	{
		this.rooms = [];

		this.createScreen();
		this.createLoadingScreen();

		var self = this;
		window.addEventListener("resize", 
			function() {
				self.onResize();
			}, false);

		this.onResize();

		// fileSystem:
		this.fileSystem = new Editor.FileSystem();
		this.fileSystem.onReady.add(
			function() {
				editor.startEditor();
			});
	},

	startEditor: function()
	{
		this.registerAllPackages();
	},

	registerAllPackages: function()
	{
		this.state = "register-packages";

		this.registerPackage("Assets");
	},

	loadProjectExplorer: function()
	{
		var name = window.location.hash;
		if(!name) {
			name = "test";
		}
		else {
			name = name.substr(1);
		}

		this.loadWorkspace(name);
	},

	loadWorkspace: function(name)
	{
		this.state = "loading-workspace";
		this.loadingText.innerHTML = "LOADING WORKSPACE";

		this.data = {
			name: name,
			verison: this.version,
			packages: {}
		};		

		if(!this.desktop)
		{
			this.fileSystem.checkDir(name, 
				function(dirPath) 
				{
					window.location.hash = name;
					editor.projectName = name;
					editor.fileSystem.rootDir = name + "/";

					if(!dirPath) {
						editor.createProject(name);
					}
					else {
						editor.dirPath = dirPath + "/";
						editor.loadProject(name);
					}
				});	
		}
		else
		{
			
		}
	},

	createData: function()
	{
		this.data = {
			name: name,
			verison: this.version,
			packages: {}
		};			
	},	

	createProject: function(name)
	{
		this.state = "creating-project";

		this.createData();
		this.createProject_Folder();
	},

	createProject_Folder: function()
	{
		editor.fileSystem.createDir("../" + this.projectName,
			function(dirPath) {
				editor.dirPath = dirPath + "/";
				editor.createProject_InstallPackages();
			});	
	},

	createProject_InstallPackages: function()
	{
		this.flags |= this.Flag.UPDATE_JSON;
		this.installPackage("Assets");
	},

	loadProject: function(name)
	{
		this.createData();

		this.fileSystem.read("editor.json",
			function(result) 
			{
				if(result) {
					editor.prevData = JSON.parse(result);
					editor.installPackages(result);
				}
			});
	},

	finishLoading: function()
	{
		this.state = "finish-loading";
		this.prevData = null;

		this.handleConfig();
		this.loadingScreen.style.display = "none";
	},

	handleConfig: function()
	{
		this.onResize();

		if(this.flags & this.Flag.UPDATE_JSON) {
			this.save();
		}
	},

	save: function()
	{
		var contents = JSON.stringify(this.data);
		var self = this;

		this.fileSystem.write("editor.json", contents,
			function() {
				self.flags &= ~self.Flag.UPDATE_JSON;
				console.log("(JSON Updated)");
			});
	},

	registerRoom: function(room) 
	{
		room.load();
		this.rooms.push(room);
	},

	createScreen: function()
	{
		this.screen = document.createElement("div");
		this.screen.setAttribute("class", "screen");
		document.body.appendChild(this.screen);

		this.createMenu();

		this.innerScreen = document.createElement("div");
		this.innerScreen.setAttribute("class", "inner");
		this.screen.appendChild(this.innerScreen);
	},

	createMenu: function()
	{
		this.menu = document.createElement("div");
		this.menu.setAttribute("class", "menu");
		this.screen.appendChild(this.menu);		

		var homeButton = document.createElement("div");
		homeButton.setAttribute("class", "home-button");
		homeButton.innerHTML = "meta";
		this.menu.appendChild(homeButton);
	},

	createLoadingScreen: function()
	{
		this.loadingScreen = document.createElement("div");
		this.loadingScreen.setAttribute("id", "loading-screen");
		
		this.loadingText = document.createElement("span");
		this.loadingText.innerHTML = "LOADING";
		this.loadingScreen.appendChild(this.loadingText);

		this.screen.appendChild(this.loadingScreen);
	},

	onResize: function()
	{
	},

	set state(name) {
		this._state = name;
		console.log("(State)", name);
	},

	registerPackage: function(name)
	{
		this.packagesToRegister++;

		var self = this;
		meta.ajax({
			url: "packages/" + name + "/package.json",
			dataType: "json",
			success: 
				function(data) { 
					self._handleRegisterPackage(data);
				},
			error: 
				function() { 
					console.error("(editor.registerPackage) Could not load \"" + name + "/package.json\"");
				}
		});
	},

	_handleRegisterPackage: function(info)
	{
		var module = new Editor.Module();
		module.info = info;
		this.packages[info.name] = module;

		console.log("Package registered: \"" + info.name + "\"");

		this.packagesToRegister--;
		if(this.packagesToRegister === 0) {
			this.loadProjectExplorer();
		}
	},
	
	_includeScript: function(path, moduleName, cb)
	{
		var self = this;

		meta.ajax
		({
			url: path,
			success: function(data) 
			{
				var text = "var module = editor.package(\"" + moduleName + "\");\n(function(module)\n{\n" + 
					data + "\n})(module);\n\n//# sourceURL=http://" + path;
				var script = document.createElement("script");
				script.text = text;
				document.head.appendChild(script);

				cb();
			}
		});
	},

	installPackages: function()
	{
		this.state = "install-packages";

		var packages = this.prevData.packages;
		for(var key in packages) {
			this.installPackage(key);
		}
	},	

	installPackage: function(name)
	{
		this.packagesToInstall++;

		var self = this;
		var module = this.package(name);
		var path = "packages/" + name + "/" + module.info.main;

		this._includeScript(path, name, 
			function() {
				self.handlePackageIncludes(module);
			});
	},

	handlePackageIncludes: function(module)
	{
		var includes = module.info.include;
		if(includes) 
		{
			var self = this;
			var includeLoadedFunc = function() {
				module.includesToLoad--;
				if(module.includesToLoad === 0) {
					self.handlePackageInstall(module);
				} 
			};

			var path;
			var num = includes.length;

			module.includesToLoad = num;

			for(var n = 0; n < num; n++)
			{
				path = "packages/" + module.info.name + "/" + includes[n];
				this._includeScript(path, module.info.name, includeLoadedFunc)
			}
		}
		else {
			this.handlePackageInstall(module);
		}
	},

	handlePackageInstall: function(module) 
	{
		var data = null;

		if(this.prevData) {
			data = this.prevData.packages[module.info.name];
		}
		if(!data) {
			data = module.exports.createData();
		}			

		module.data = data;
		this.data.packages[module.info.name] = data;	

		module.exports.install();

		if(!module.loading) {
			this.packageLoaded(module);
		}
	},

	uninstallPackage: function(name)
	{

	},	

	packageLoaded: function(module)
	{
		console.log("Package installed: \"" + module.info.name + "\"");

		this.packagesToInstall--;
		if(this.packagesToInstall === 0) {
			this.finishLoading();
		}		
	},

	package: function(name) 
	{
		var module = this.packages[name];
		if(!module) {
			console.warn("(editor.package) No such installed or registered: " + name);
			return null;
		}

		return module;
	},

	createPath: function(info)
	{
		var path = info.name + "." + info.type.substr(info.type.indexOf("/") + 1);
		return path;
	},

	Flag: {
		UPDATE_JSON: 1
	},

	//
	projectName: null,
	dirPath: null,
	data: null,
	prevData: null,
	version: "0.0.1",

	_state: "",

	screen: null,
	innerScreen: null,
	menu: null,
	loadingScreen: null,
	loadingText: null,

	header: null,
	widget: null,

	screenWidth: 0,
	screenHeight: 0,

	rooms: null,

	packages: {},
	packagesToRegister: 0,
	packagesToInstall: 0,

	flags: 0,
	desktop: false
};

meta.onInit = function() {
	meta.engine.container = document.getElementById("stuff");
	editor.start();
};