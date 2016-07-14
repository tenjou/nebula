"use strict";

editor.plugin("login", 
{
	create: function()
	{
		wabi.addTemplate("loginScreen", {
			type: "panel",
			header: "Login",
			width: 300
		});

		wabi.addFragment("loginScreen.error", {
			type: "error",
			bind: "error",
			types: {
				AccountExist: "There is already an account registered with that name.",
				RequiredFields: "All fields must be filled.",
				NoServer: "Could not connect to server.",
				Wrong: "Wrong username or password."
			}
		});

		wabi.addFragment("loginScreen.login", [
			{
				type: "input",
				bind: "username",
				inputType: "name",
				placeholder: "Username"
			},
			{
				type: "input",
				bind: "password",
				inputType: "password",
				placeholder: "Password"
			},
			{
				type: "content",
				value: [
					{
						type: "desc",
						value: "Remember Me",
						content: [
							{
								type: "checkbox",
								bind: "remember"
							}
						]
					}						
				],
				padding: 2
			},
			"loginScreen.error",		
			{
				type: "row",
				value: [
					{
						id: "register",
						type: "button",
						value: "Register"
					},
					{
						id: "login",
						type: "button",
						value: "Login"
					}
				]
			},
			{
				id: "loader",
				type: "loader"
			}			
		]);

		wabi.addFragment("loginScreen.register", [
			{
				type: "input",
				bind: "username",
				inputType: "name",
				placeholder: "Username"
			},
			{
				type: "input",
				bind: "password",
				inputType: "password",
				placeholder: "Password"
			},
			"loginScreen.error",
			{
				type: "row",
				value: [
					{
						id: "back",
						type: "button",
						value: "Back"
					},				
					{
						id: "register",
						type: "button",
						value: "Register"
					}
				]
			},
			{
				id: "loader",
				type: "loader"
			}			
		]);

		// Load user data:
		var localUserData = localStorage.getItem("user");
		var userData = null;
		if(localUserData) {
			userData = JSON.parse(localUserData);
		}
		else 
		{
			userData = {
				username: "",
				password: ""
			};
		}

		this.userData = new wabi.data(userData, "user");
		this.userData.watch(this.onDataChange, this);
		
		this.registerData = new wabi.data("user");		
	},

	onDataChange: function(action, key, value, index, data)
	{
		if(key === "remember" && !value) {
			localStorage.setItem("user", null);
		}
	},

	show: function() 
	{
		editor.server.on("close", this.onServer_close, this);
		editor.server.on("register", this.onServer_register, this);
		editor.server.on("login", this.onServer_login, this);

		this.loginScreen = wabi.createTemplate("loginScreen");
		this.loginScreen.data = this.userData;
		this.loginScreen.appendTo(editor.overlayElement);
		this.showLogin(true);
	},

	hide: function() 
	{	
		editor.server.off(this);

		wabi.destroyTemplate(this.loginScreen);
	},

	onServer_close: function() 
	{
		this.loginScreen.get("#loader").hidden = true;

		if(!this.loginScreen.data.get("error")) {
			this.loginScreen.data.performSetKey("error", "NoServer");
		}
	},	

	onServer_register: function(data) 
	{
		this.loginScreen.get("#loader").hidden = true;

		if(data.error) {
			this.loginScreen.data.performSetKey("error", data.error);
			return;
		}

		this.registerData.performSetKey("username", null);
		this.registerData.performSetKey("password", null);

		this.showLogin();
	},

	onServer_login: function(data)
	{
		this.loginScreen.get("#loader").hidden = true;
		
		if(data.error) {
			this.loginScreen.data.performSetKey("error", data.error);
			return;
		}

		editor.login();
	},

	showLogin: function(autologin) 
	{
		this.userData.performSetKey("error", "");
		
		this.loginScreen.data = this.userData;
		this.loginScreen.value = "loginScreen.login";
		this.loginScreen.on("click", "#register", this.handleRegisterAccount, this);
		this.loginScreen.on("click", "#login", this.handleLogin, this);

		if(autologin && this.userData.get("remember")) {
			this.validateAndSend("login");
		}
	},

	showRegister: function() 
	{
		this.loginScreen.data = this.registerData;
		this.loginScreen.value = "loginScreen.register";
		this.loginScreen.on("click", "#back", this.handleBack, this);	
		this.loginScreen.on("click", "#register", this.handleCreateAccount, this);		
	},

	handleBack: function(event) {
		this.showLogin();
	},

	handleRegisterAccount: function(event) {
		this.showRegister();
	},

	handleLogin: function(event) 
	{
		if(!this.validateAndSend("login")) {
			return;
		}

		if(this.userData.get("remember")) {
			localStorage.setItem("user", JSON.stringify(this.userData));
		}
	},

	handleCreateAccount: function(event) {
		this.validateAndSend("register");
	},

	validateAndSend: function(action)
	{
		var data = this.loginScreen.data;
		var username = data.get("username");
		var password = data.get("password");

		if(!username || !password) {
			data.performSetKey("error", "RequiredFields");
			return false;
		}
		else {
			data.performSetKey("error", null);
		}

		this.loginScreen.get("#loader").hidden = false;
		this.emit({
			type: action,
			username: username,
			password: password
		});

		return true;
	},

	logout: function()
	{
		localStorage.removeItem("user");
		window.location.reload();
	},

	emit: function(data)
	{
		if(!editor.server.open)
		{
			editor.server.connect(
				function() {
					editor.server.emit(data);	
				});
		}
		else {
			editor.server.emit(data);	
		}		
	},

	//
	loginScreen: null,
	userData: null,
	registerData: null
});