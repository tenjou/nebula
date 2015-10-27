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

		this.registerPackage("assets");
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

		if(!this.desktop)
		{
			this.fileSystem.checkDir(this.projectName, 
				function(result) 
				{
					window.location.hash = name;
					editor.projectName = name;
					editor.fileSystem.rootDir = name + "/";

					if(!result) {
						editor.createProject(name);
					}
					else {
						editor.loadProject(name);
					}
				});	
		}
		else
		{
			
		}
	},

	createProject: function(name)
	{
		this.state = "creating-project";

		this.data = {
			name: name,
			packages: []
		};	

		this.createProject_Folder();
	},

	createProject_Folder: function()
	{
		editor.fileSystem.createDir("../" + this.projectName,
			function() {
				editor.createProject_InstallPackages();
			});	
	},

	createProject_InstallPackages: function()
	{
		this.flags |= this.Flag.UPDATE_JSON;
		this.installPackage("assets");
	},

	loadProject: function(name)
	{
		this.fileSystem.read("editor.json",
			function(result) 
			{
				if(result) {
					editor.parseCfg(result);
				}
			});
	},

	finishLoading: function()
	{
		this.handleConfig();
		this.loadingScreen.style.display = "none";
	},

	handleConfig: function()
	{
		this.onResize();

		if(this.flags & this.Flag.UPDATE_JSON) {
			this.saveJSON();
		}
	},

	createCfg: function()
	{
		this.data = {};

		this.fileSystem.create("editor.json", 
			function() {
				editor.continueLoad();
			});
	},

	parseCfg: function(contents)
	{
		this.data = JSON.parse(contents);

		editor.continueLoad();
	},

	saveJSON: function()
	{
		var contents = JSON.stringify(this.data);
		var self = this;

		this.fileSystem.write("editor.json", contents,
			function() {
				self.flags &= ~self.Flag.UPDATE_JSON;
				console.log("(JSON Updated)");
			});
	},

	continueLoad: function()
	{
		this.rooms = {};
		editor.registerRoom(Assets.Room);

		this.onResize();

		this.saveJSON();
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

		// var margin = 5;

		// this.headerPlate = new EditorUI.Plate();
		// this.screen.appendChild(this.headerPlate.element);

		// this.leftPlate = new EditorUI.Plate();
		// this.leftPlate.margin(margin, 0, margin, 0);
		// this.screen.appendChild(this.leftPlate.element);

		// this.rightPlate = new EditorUI.Plate();
		// this.rightPlate.margin(margin, 0, margin, 0);
		// this.screen.appendChild(this.rightPlate.element);	

		// this.viewportPlate = new EditorUI.Plate();
		// this.viewportPlate.margin(margin, margin, margin, margin);
		// this.screen.appendChild(this.viewportPlate.element);

		// meta.engine.container = this.viewportPlate.element;	

		// this.header = new EditorUI.Header();
		// this.screen.appendChild(this.header.element);

		// //
		// var widgetFlags = EditorUI.WidgetFlag;

		// this.widget = new EditorUI.Widget(widgetFlags.HEADER | widgetFlags.FOOTER);
		//this.screen.appendChild(this.widget.element);
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
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;

		var style = this.screen.style;
		style.width = this.screenWidth + "px";
		style.height = this.screenHeight + "px";

		for(var key in this.rooms) {
			this.rooms[key].handleResize();
		}

		// console.log(this.screenWidth, this.screenHeight);

		// this.headerPlate.width = this.screenWidth;
		// this.headerPlate.height = 30;

		// this.leftPlate.width = 210;
		// this.leftPlate.height = this.screenHeight - this.headerPlate.height;
		// this.leftPlate.y = this.headerPlate.height;

		// this.rightPlate.width = 210;
		// this.rightPlate.height = this.screenHeight - this.headerPlate.height;
		// this.rightPlate.x = this.screenWidth - this.rightPlate.width;
		// this.rightPlate.y = this.headerPlate.height;

		// this.viewportPlate.width = this.screenWidth - 420;
		// this.viewportPlate.height = this.screenHeight - 30;
		// this.viewportPlate.x = this.rightPlate.width;
		// this.viewportPlate.y = this.headerPlate.height;
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
		module.data = {};
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
		module.exports.install();

		this.data.packages.push(module.info.name);

		console.log("Package installed: \"" + module.info.name + "\"");

		this.packagesToInstall--;
		if(this.packagesToInstall === 0) {
			this.finishLoading();
		}
	},

	uninstallPackage: function(name)
	{

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

	Flag: {
		UPDATE_JSON: 1
	},

	//
	projectName: null,
	data: null,

	_state: "",

	screen: null,
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