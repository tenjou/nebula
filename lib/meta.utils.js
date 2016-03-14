"use strict";

var meta = {};

"use strict";

meta.ajax = function(params)
{
	var data = meta.serialize(params.data);
	var xhr = new XMLHttpRequest();

	if(params.dataType === "html") {
		params.responseType = "document";
	}
	else if(params.dataType === "script" || params.dataType === "json") {
		params.responseType = "text";
	}
	else if(params.dataType === void(0)) {
		params.responseType = "GET";
		xhr.overrideMimeType("text/plain");
	}
	else {
		params.responseType = params.dataType;
	}

	if(params.type === void(0)) {
		params.type = "GET";
	}	

	xhr.open(params.type, params.url, true);
	xhr.onload = function()
	{
		if(xhr.readyState === 4 && xhr.status === 200)
		{
			if(params.success !== void(0))
			{
				if(params.responseType === "document") {
					params.success(xhr.responseXML);
				}
				else if(params.dataType === "script") {
					params.success(eval(xhr.responseText));
				}
				else if(params.dataType === "json") {
					params.success(JSON.parse(xhr.responseText));
				}
				else {
					params.success(xhr.responseText);
				}
			}
		}
		else
		{
			if(params.error !== void(0)) {
				params.error();
			}
		}
	};

	xhr.send(data);

	return xhr;
};

"use strict";

(function(scope) 
{
	if(!scope.meta) {
		scope.meta = {};
	}

	var initializing = false;
	var fnTest = /\b_super\b/;
	var holders = {};

	meta.class = function(clsName, extendName, prop, cb) 
	{
		if(!initializing) {
			meta.class._construct(clsName, extendName, prop, cb);
		}
	};

	meta.class._construct = function(clsName, extendName, prop, cb) 
	{
		if(!clsName) {
			console.error("(meta.class) Invalid class name");
			return;
		}

		if(!prop) {
			prop = extendName;
			extendName = null; 
		}
		if(!prop) {
			prop = {};	
		}

		var extend = null;

		if(extendName)
		{
			var prevScope = null;
			var extendScope = window;
			var extendScopeBuffer = extendName.split(".");
			var num = extendScopeBuffer.length - 1;
			
			for(var n = 0; n < num; n++) 
			{
				prevScope = extendScope;
				extendScope = extendScope[extendScopeBuffer[n]];
				if(!extendScope) {
					extendScope = {};
					prevScope[extendScopeBuffer[n]] = extendScope;				
				}
			}	

			var name = extendScopeBuffer[num];
			extend = extendScope[name];
			if(!extend) 
			{
				var holder = holders[extendName];
				if(!holder) {
					holder = new ExtendHolder();
					holders[extendName] = holder;
				}

				holder.classes.push(new ExtendItem(clsName, prop, cb));			
				return;
			}			
		}		

		Extend(clsName, extend, prop, cb);  	
	};

	function Extend(clsName, extend, prop, cb) 
	{
		var prevScope = null;
		var scope = window;
		var scopeBuffer = clsName.split(".");
		var num = scopeBuffer.length - 1;
		var name = scopeBuffer[num];

		for(var n = 0; n < num; n++) 
		{
			prevScope = scope;
			scope = scope[scopeBuffer[n]];
			if(!scope) {
				scope = {};
				prevScope[scopeBuffer[n]] = scope;
			}
		}

		var extendHolder = holders[clsName];
		var prevCls = scope[name];
		var cls = function Class(a, b, c, d, e, f) 
		{
			if(!initializing) 
			{
				if(this.init) { 
					this.init(a, b, c, d, e, f); 
				}
			}
		};		

		var proto = null;
		var extendProto = null;

		if(extend) {
			initializing = true;
			proto = new extend();
			extendProto = proto.__proto__;
			initializing = false;
		}
		else {
			initializing = true;
			proto = new meta.class();
			initializing = false;
		}			

		for(var key in prop)
		{
			var p = Object.getOwnPropertyDescriptor(prop, key);
			if(p.get || p.set) {
				Object.defineProperty(proto, key, p);
				continue;
			}

			if(extend)
			{
				if(typeof(prop[key]) == "function" 
					&& typeof extendProto[key] == "function" 
					&& fnTest.test(prop[key]))
				{
					proto[key] = (function(key, fn)
					{
						return function(a, b, c, d, e, f)
						{
							var tmp = this._super;
							this._super = extendProto[key];
							this._fn = fn;
							var ret = this._fn(a, b, c, d, e, f);

							this._super = tmp;

							return ret;
						};
					})(key, prop[key]);
					continue;
				}
			}

			proto[key] = prop[key];
		}

		cls.prototype = proto;
		cls.prototype.__cls__ = cls;
		cls.prototype.__name__ = clsName;
		cls.prototype.__lastName__ = name;
		cls.prototype.constructor = proto.init || null;
		scope[name] = cls;

		if(prevCls) {
			for(var key in prevCls) {
				cls[key] = prevCls[key];
			}
		}

		if(extendHolder) {
			var extendItem = null;
			var classes = extendHolder.classes;
			num = classes.length;
			for(n = 0; n < num; n++) {
				extendItem = classes[n];
				Extend(extendItem.name, cls, extendItem.prop, extendItem.cb);
			}

			delete holders[clsName];		
		}

		if(cb) {
			cb(cls, clsName);
		}
	};

	function ExtendHolder() {
		this.classes = [];
	};

	function ExtendItem(name, prop, cb) {
		this.name = name;
		this.prop = prop;
		this.cb = cb;
	};

	meta.classLoaded = function()
	{
		var i = 0;
		var holder = null;
		var classes = null;
		var numClasses = 0;

		for(var key in holders) {
			holder = holders[key];
			console.error("Undefined class: " + key);
			classes = holder.classes;
			numClasses = classes.length;
			for(i = 0; i < numClasses; i++) {
				console.error("Undefined class: " + classes[i].name);
			}
		}

		holder = {};
	};	
})(typeof(window) !== void(0) ? window : global);

meta.enumNames = function(baseName, mask, min, max)
{
	var names = new Array(max - min);

	var maskLength = mask.length;
	var numbers;

	for(var n = min; n <= max; n++) {
		numbers = Math.floor(n / 10);
		names[n] = baseName + mask.substr(0, maskLength - numbers - 1) + n;
	}

	return names;
};

meta.getNameFromPath = function(path)
{
	var wildcardIndex = path.lastIndexOf(".");
	var slashIndex = path.lastIndexOf("/");

	// If path does not have a wildcard:
	if(wildcardIndex < 0 || (path.length - wildcardIndex) > 5) { 
		return path.slice(slashIndex + 1);
	}

	return path.slice(slashIndex + 1, wildcardIndex);
};

meta.randomItem = function(array) {
	return array[meta.random.number(0, array.length - 1)];
};

meta.onDomLoad = function(func)
{
	if((document.readyState === "interactive" || document.readyState === "complete")) {
		func();
		return;
	}

	var cbFunc = function(event) {
		func();
		window.removeEventListener("DOMContentLoaded", cbFunc);
	};

	window.addEventListener("DOMContentLoaded", cbFunc);
};

/**
 * Get enum key as string.
 * @param buffer {Object} Enum object where key is located.
 * @param value {*} Value of the key which needs to be converted.
 * @returns {string} Converted enum to string.
 */
meta.enumToString = function(buffer, value)
{
	if(buffer === void(0)) {
		return "unknown";
	}

	for(var enumKey in buffer)
	{
		if(buffer[enumKey] === value) {
			return enumKey;
		}
	}

	return "unknown";
};

/**
 * Convert hex string to object with RGB values.
 * @param hex {String} Hex to convert.
 * @return {{r: Number, g: Number, b: Number}} Object with rgb values.
 */
meta.hexToRgb = function(hex)
{
	if(hex.length < 6) {
		hex += hex.substr(1, 4);
	}

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	}
};

/**
 * Check if string is url.
 * @param str {string} String to check.
 * @returns {boolean} <b>true</b> if is url.
 */
meta.isUrl = function(str)
{
	if(str.indexOf("http://") !== -1 || str.indexOf("https://") !== -1) {
		return true;
	}

	return false;
};

/**
 * Change to upper case first character of the string.
 * @param str {String} String to perform action on.
 * @returns {String}
 */
meta.toUpperFirstChar = function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};


meta.serialize = function(obj)
{
	var str = [];
	for(var key in obj) {
		str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
	}

	return str.join("&");
};

meta.removeFromArray = function(item, array) 
{
	var numItems = array.length;
	for(var i = 0; i < numItems; i++) {
		if(item === array[i]) {
			array[i] = array[numItems - 1];
			array.pop();
			break;
		}
	}
};

meta.shuffleArray = function(array) 
{
	var rand = meta.random;
	var length = array.length
	var temp, item;

	while(length) 
	{
		item = rand.number(0, --length);

		temp = array[length];
		array[length] = array[item];
		array[item] = temp;
	}

	return array;
};

meta.shuffleArrayRange = function(array, endRange, startRange) 
{
	var startRange = startRange || 0;
	var rand = meta.random;
	var temp, item;

	while(endRange > startRange) 
	{
		item = rand.number(0, --endRange);

		temp = array[endRange];
		array[endRange] = array[item];
		array[item] = temp;
	}

	return array;
};

meta.mapArray = function(array)
{
	var obj = {};
	var num = array.length;
	for(var n = 0; n < num; n++) {
		obj[array[n]] = n;
	}

	return obj;
};

meta.rotateArray = function(array)
{
	var tmp = array[0];
	var numItems = array.length - 1;
	for(var i = 0; i < numItems; i++) {
		array[i] = array[i + 1];
	}
	array[numItems] = tmp;
};

meta.nextPowerOfTwo = function(value)
{
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;

    return value;	
};

meta.toHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

meta.rgbToHex = function(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

function isSpace(c) {
	return (c === " " || c === "\t" || c === "\r" || c === "\n");
};

function isNewline(c) {
	return (c === "\r" || c === "\n");
};

function isDigit(c) {
	return (c >= "0" && c <= "9") || (c === ".");
};

function isAlpha(c) 
{
	return (c >= "a" && c <= "z") ||
		   (c >= "A" && c <= "Z") ||
		   (c == "_" && c <= "$");
};

function isAlphaNum(c) 
{
	return (c >= "a" && c <= "z") ||
		   (c >= "A" && c <= "Z") ||
		   (c >= "0" && c <= "9") ||
		   c === "_" || c === "$";
};

function isBinOp(c) 
{
	return (c === "=" || c === "!" || c === "<" || c === ">" || 
			c === "+" || c === "-" || c === "*" || c === "/" ||
			c === "&" || c === "~" || c === "|" || c === "%");
};

function getClsFromPath(path)
{
	var cls = null;
	var scope = window;
	var num = path.length;
	for(var i = 0; i < num; i++) {
		scope = scope[path[i]];
		if(!scope) {
			return null;
		}
	}

	return cls;
};

meta.decodeBinaryBase64 = function(content)
{
	var decodedData = atob(content);
	var size = decodedData.length;
	var data = new Array(size / 4);

	for(var n = 0, i = 0; n < size; n += 4, i++)
	{
		data[i] = decodedData.charCodeAt(n) | 
				  decodedData.charCodeAt(n + 1) << 8 |
				  decodedData.charCodeAt(n + 2) << 16 |
				  decodedData.charCodeAt(n + 3) << 24;
	}

	return data;
}

/**
 * Object that holds information about channel.
 * @property name {String} Name of the channel.
 * @property subs {Array} Array with subsribers.
 * @property numSubs {Number} Total count of subscribers.
 */
meta.Channel = function(name)
{
	this.name = name;
	this.subs = [];
	this.numSubs = 0;

	this._emitting = false;
	this._subsToRemove = null;
};

meta.Channel.prototype =
{
	/**
	 * Emit an event to all subscribers.
	 * @param data {*} Data that comes with event.
	 * @param event {*} Type of event.
	 */
	emit: function(data, event)
	{
		this._emitting = true;

		var sub;
		for(var i = 0; i < this.numSubs; i++) {
			sub = this.subs[i];
			sub.func.call(sub.owner, data, event);
		}

		this._emitting = false;

		// Remove subs from this channel that offd while emited.
		if(this._subsToRemove) 
		{
			var numToRemove = this._subsToRemove.length;
			for(var n = 0; n < numToRemove; n++) {
				this.remove(this._subsToRemove[n]);
			}

			this._subsToRemove = null;
		}
	},

	/**
	 * Subscribe to the channel.
	 * @param owner {Object} Pointer to the owner object.
	 * @param func {Function} Callback function.
	 */
	add: function(func, owner, priority)
	{
		priority = priority || 0;

		if(!func) {
			console.warn("(meta.Channel.subscribe) No valid callback function passed.");
			return;			
		}

		for(var i = 0; i < this.numSubs; i++)
		{
			if(this.subs[i].owner === owner) {
				console.warn("(meta.Channel.subscribe) Already subscribed to channel: " + this.name);
				return;
			}
		}

		var newSub = new meta.Subscriber(owner, func, priority);
		this.subs.push(newSub);
		this.numSubs++;

		if(priority) {
			this._havePriority = true;
			this.subs.sort(this._sortFunc);
		}
		else if(this._havePriority) {
			this.subs.sort(this._sortFunc);
		}
	},

	/**
	 * Unsubscribe from the channel.
	 * @param owner {Object} Pointer to the owner object.
	 */
	remove: function(owner)
	{
		if(owner === null || owner === void(0)) {
			meta.channels[this.name] = null;
		}
		else
		{
			if(this._emitting) 
			{
				if(!this._subsToRemove) {
					this._subsToRemove = [];
				}
				this._subsToRemove.push(owner);
				return;
			}
	
			var sub;
			for(var i = 0; i < this.numSubs; i++)
			{
				sub = this.subs[i];
				if(sub.owner === owner) {
					this.subs[i] = this.subs[this.numSubs - 1];
					this.subs.pop();
					this.numSubs--;
					break;
				}
			}
	
			if(this._havePriority) {
				this.subs.sort(this._sortFunc);
			}
		}
	},

	removeAll: function() {
		this.subs = [];
		this.numSubs = 0;
	},

	_sortFunc: function(a, b) {
		return (a.priority > b.priority) ? -1 : 1
	},

	//
	_havePriority: false
};

meta.Subscriber = function(owner, func, priority) {
	this.owner = owner;
	this.func = func;
	this.priority = priority;
};

/**
 * Create or get channel from the scope.
 * @param name {String} Name of the channel.
 * @return {meta.Channel} Created channel.
 * @memberof! <global>
 */
meta.createChannel = function(name)
{
	if(!name) {
		console.warn("(meta.createChannel) No name was specified!");
		return null;
	}

	var channel = meta.channels[name];
	if(!channel) {
		channel = new meta.Channel(name);
		meta.channels[name] = channel;
	}

	return channel;
};

/**
 * Release channel.
 * @param name
 * @memberof! <global>
 */
meta.releaseChannel = function(name)
{
	if(!name) {
		console.warn("(meta.releaseChannel) No name was specified!");
		return;
	}

	if(meta.channels[name]) {
		meta.channels[name] = null;
	}
};

/**
 * Subscribe to the channel.
 * @param owner {Object} Pointer of the owner object.
 * @param channel {meta.Channel|String|Array} Name, object or array of the channels to subscribe to.
 * @param func {Function} Callback function that will be called when emit arrives.
 * @memberof! <global>
 */
meta.subscribe = function(channel, func, owner, priority)
{
	if(typeof(owner) !== "object") {
		console.warn("(meta.subscribe) No owner passed.");
		return;
	}
	if(!func) {
		console.warn("(meta.subscribe) No callback function passed.");
		return;		
	}

	if(typeof(channel) === "string")
	{
		var srcChannel = meta.channels[channel];
		if(!srcChannel)
		{
			channel = meta.createChannel(channel);
			if(!channel) {
				return;
			}
		}
		else {
			channel = srcChannel;
		}
	}
	else if(Object.prototype.toString.call(channel) === "[object Array]")
	{
		var numChannels = channel.length;
		for(var i = 0; i < numChannels; i++) {
			meta.subscribe(channel[i], func, owner, priority);
		}
		return;
	}
	else {
		console.warn("(meta.subscribe) Wrong type for channel object: " + typeof(channel));
		return;
	}

	channel.add(func, owner, priority);
};

/**
 * Unsubscribe from the channel.
 * @param owner {Object} Pointer of the owner object.
 * @param channel {meta.Channel|String|Array} Name, object or array of the channels to unsubscribe from.
 * @memberof! <global>
 */
meta.unsubscribe = function(channel, owner)
{
	if(typeof(channel) === "string")
	{
		channel = meta.channels[channel];
		if(!channel) {
			console.warn("(meta.unsubscribe) No name was specified!");
			return;
		}
	}
	else if(Object.prototype.toString.call(channel) === "[object Array]")
	{
		var numChannels = channel.length;
		for(var i = 0; i < numChannels; i++) {
			meta.unsubscribe(channel[i], owner);
		}
		return;
	}
	else {
		console.warn("(meta.unsubscribe) Wrong type for channel object.");
		return;
	}

	channel.remove(owner);
};

/**
 * Emit an event to all subscribers.
 * @param channel {String} Name of the channel.
 * @param data {*} Data that comes with event.
 * @param event {*} Type of event.
 */
meta.emit = function(channel, data, event)
{
	if(typeof(channel) === "string")
	{
		channel = meta.channels[channel];
		if(!channel) {
			console.warn("(meta.emit) No name was specified!");
			return;
		}
	}

	channel.emit(data, event);
};

meta.channels = [];

/**
 * @description Manages client feature support and adds missing functionality.
 * @constructor
 * @property vendors {Array} Buffer with vendors to perform check on.
 * @property support {Object} Dictionary of supported features.
 * @property mobile {Boolean} Flag if it's mobile device.
 * @memberof! <global>
 */
meta.Device = function()
{
	this.name = "unknown";
	this.version = "0";
	this.versionBuffer = null;

	this.vendors = [ "", "webkit", "moz", "ms", "o" ];
	this.vendor = "";
	this.support = {};

	this.audioFormats = [];

	this.mobile = false;
	this.isPortrait = false;
	this.audioAPI = false;

	this.hidden = null;
	this.visibilityChange = null;

	this.fullScreenRequest = null;
	this.fullScreenExit = null;
	this.fullScreenOnChange = null;
	this.fullscreen = false;

	this.load();
};

meta.Device.prototype =
{
	/**
	 * @description Load all support related stuff.
	 */
	load: function()
	{
		this.checkBrowser();

		this.mobile = this.isMobileAgent();

		this.checkConsoleCSS();
		this.checkFileAPI();

		this.support.onloadedmetadata = (typeof window.onloadedmetadata === "object");
		this.support.onkeyup = (typeof window.onkeyup === "object");
		this.support.onkeydown = (typeof window.onkeydown === "object");

		this.support.canvas = this.isCanvasSupport();
		this.support.webgl = this.isWebGLSupport();

		this.modernize();
	},

	/**
	 * Check browser name and version.
	 */
	checkBrowser: function()
	{
		var regexps = {
			"Chrome": [ /Chrome\/(\S+)/ ],
			"Firefox": [ /Firefox\/(\S+)/ ],
			"MSIE": [ /MSIE (\S+);/ ],
			"Opera": [
				/OPR\/(\S+)/,
				/Opera\/.*?Version\/(\S+)/,     /* Opera 10 */
				/Opera\/(\S+)/                  /* Opera 9 and older */
			],
			"Safari": [ /Version\/(\S+).*?Safari\// ]
		};

		var userAgent = navigator.userAgent;
		var name, currRegexp, match;
		var numElements = 2;

		for(name in regexps)
		{
			while(currRegexp = regexps[name].shift())
			{
				if(match = userAgent.match(currRegexp))
				{
					this.version = (match[1].match(new RegExp('[^.]+(?:\.[^.]+){0,' + --numElements + '}')))[0];
					this.name = name;

					this.versionBuffer = this.version.split(".");
					var versionBufferLength = this.versionBuffer.length;
					for(var i = 0; i < versionBufferLength; i++) {
						this.versionBuffer[i] = parseInt(this.versionBuffer[i]);
					}

					break;
				}
			}
		}

		if(this.versionBuffer === null || this.name === "unknown") {
			console.warn("(meta.Device.checkBrowser) Could not detect browser.");
		}
		else {
			if(this.name === "Chrome" || this.name === "Safari" || this.name === "Opera") {
				this.vendor = "webkit";
			}
			else if(this.name === "Firefox") {
				this.vendor = "moz";
			}
			else if(this.name === "MSIE") {
				this.vendor = "ms";
			}
		}				
	},

	checkConsoleCSS: function() 
	{
		if(!this.mobile && (this.name === "Chrome" || this.name === "Opera")) {
			this.support.consoleCSS = true;
		}
		else {
			this.support.consoleCSS = false;
		}		
	},

	checkFileAPI: function() 
	{
		if(window.File && window.FileReader && window.FileList && window.Blob) {
			this.support.fileAPI = true;
		}
		else {
			this.support.fileAPI = false;
		}
	},

	/**
	 * @description Add support for missing functionality.
	 */
	modernize: function()
	{
		if(!Number.MAX_SAFE_INTEGER) {
			Number.MAX_SAFE_INTEGER = 9007199254740991;
		}

		this.supportConsole();
		this.supportPageVisibility();
		this.supportFullScreen();
		this.supportRequestAnimFrame();
		this.supportPerformanceNow();
		this.supportAudioFormats();
		this.supportAudioAPI();
		this.supportFileSystemAPI();
	},


	/**
	 * Test if agent is on mobile device.
	 * @returns {boolean}
	 */
	isMobileAgent: function() {
		return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
	},

	/**
	 * @description Check if client supports Canvas rendering context.
	 * @return {boolean}
	 */
	isCanvasSupport: function() {
		return !!window.CanvasRenderingContext2D;
	},

	/**
	 * @description Check if client supports WebGL rendering context.
	 * @return {boolean}
	 */
	isWebGLSupport: function()
	{
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		return !!context;
	},


	/**
	 * If console is not supported replace it with empty functions.
	 */
	supportConsole: function()
	{
		if(!window.console) {
			window.console = {};
			window.console.log = meta.emptyFuncParam;
			window.console.warn = meta.emptyFuncParam;
			window.console.error = meta.emptyFuncParam;
		}
	},

	/**
	 * Check if Page Visibility API is available and which prefix to use.
	 */
	supportPageVisibility: function()
	{
		if(document.hidden !== void(0)) {
			this.hidden = "hidden";
			this.visibilityChange = "visibilitychange";
		}
		else if(document.hidden !== void(0)) {
			this.hidden = "webkitHidden";
			this.visibilityChange = "webkitvisibilitychange";
		}
		else if(document.hidden !== void(0)) {
			this.hidden = "mozhidden";
			this.visibilityChange = "mozvisibilitychange";
		}
		else if(document.hidden !== void(0)) {
			this.hidden = "mshidden";
			this.visibilityChange = "msvisibilitychange";
		}
	},

	/**
	 * Check if FullScreen API is available and which prefix to use.
	 */
	supportFullScreen: function()
	{
		this._fullScreenRequest();
		this._fullScreenExit();
		this._fullScreenOnChange();

		this.support.fullScreen = document.fullscreenEnabled || document.mozFullScreenEnabled ||
			document.webkitFullscreenEnabled || document.msFullscreenEnabled;
	},

	_fullScreenRequest: function()
	{
		var element = document.documentElement;
		if(element.requestFullscreen !== void(0)) {
			this.fullScreenRequest = "requestFullscreen";
		}
		else if(element.webkitRequestFullscreen !== void(0)) {
			this.fullScreenRequest = "webkitRequestFullscreen";
		}
		else if(element.mozRequestFullScreen !== void(0)) {
			this.fullScreenRequest = "mozRequestFullScreen";
		}
		else if(element.msRequestFullscreen !== void(0)) {
			this.fullScreenRequest = "msRequestFullscreen";
		}
	},

	_fullScreenExit: function()
	{
		if(document.exitFullscreen !== void(0)) {
			this.fullScreenExit = "exitFullscreen";
		}
		else if(document.webkitExitFullscreen !== void(0)) {
			this.fullScreenExit = "webkitExitFullscreen";
		}
		else if(document.mozCancelFullScreen !== void(0)) {
			this.fullScreenExit = "mozCancelFullScreen";
		}
		else if(document.msExitFullscreen !== void(0)) {
			this.fullScreenExit = "msExitFullscreen";
		}
	},

	_fullScreenOnChange: function()
	{
		if(document.onfullscreenchange !== void(0)) {
			this.fullScreenOnChange = "fullscreenchange";
		}
		else if(document.onwebkitfullscreenchange !== void(0)) {
			this.fullScreenOnChange = "webkitfullscreenchange";
		}
		else if(document.onmozfullscreenchange !== void(0)) {
			this.fullScreenOnChange = "mozfullscreenchange";
		}
		else if(document.onmsfullscreenchange !== void(0)) {
			this.fullScreenOnChange = "msfullscreenchange";
		}
	},

	/**
	 * @description Add support for requestAnimFrame.
	 */
	supportRequestAnimFrame: function()
	{
		if(!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = (function()
			{
				return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||

					function(callback, element) {
						window.setTimeout( callback, 1000 / 60 );
					};
			})();
		}
	},

	/**
	 * Add support to window.performance.now().
	 */
	supportPerformanceNow: function()
	{
		if(window.performance === void(0)) {
			window.performance = {};
		}

		if(window.performance.now === void(0)) {
			window.performance.now = Date.now;
		}
	},

	/**
	 * Check for supported audio formats.
	 */
	supportAudioFormats: function()
	{
		var audio = document.createElement("audio");
		if(audio.canPlayType("audio/mp4")) {
			this.audioFormats.push("m4a");
		}
		if(audio.canPlayType("audio/ogg")) {
			this.audioFormats.push("ogg");
		}
		if(audio.canPlayType("audio/mpeg")) {
			this.audioFormats.push("mp3");
		}
		if(audio.canPlayType("audio/wav")) {
			this.audioFormats.push("wav");
		}		
	},

	/**
	 * Check for AudioAPI support.
	 */
	supportAudioAPI: function()
	{
		if(!window.AudioContext) {
			window.AudioContext = window.webkitAudioContext || 
				window.mozAudioContext ||
				window.oAudioContext ||
				window.msAudioContext;
		}

		if(window.AudioContext) {
			this.audioAPI = true;
		}
	},

	supportFileSystemAPI: function() 
	{
		if(!window.requestFileSystem) 
		{
			window.requestFileSystem = window.webkitRequestFileSystem || 
				window.mozRequestFileSystem ||
				window.oRequestFileSystem ||
				window.msRequestFileSystem;
		}

		if(window.requestFileSystem) {
			this.support.fileSystemAPI = true;
		}
	}
};

meta.device = new meta.Device();

meta.getElementOffset = function(rootElement)
{
	var offsetLeft = 0;
	var offsetTop = 0;

	var element = rootElement;
	if(element.offsetParent)
	{
		do {
			this.offsetLeft += element.offsetLeft;
			this.offsetTop += element.offsetTop;
		} while(element = element.offsetParent);
	}

	var rect = rootElement.getBoundingClientRect();
	offsetLeft += rect.left;
	offsetTop += rect.top;

	return [ offsetLeft, offsetTop ];
};