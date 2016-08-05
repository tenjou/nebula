"use strict";

var meta = {
    version: "0.9",
    view: null,
    views: {},
    flags: {
        autoPowTwo: true
    },
    time: {
        delta: 0,
        deltaF: 0,
        maxDelta: 250,
        scale: 1,
        curr: 0,
        fps: 0,
        current: 0,
        update: 0,
        accumulator: 0,
        frameIndex: 0,
        updateFreq: 1e3 / 10
    },
    cache: {
        width: 0,
        height: 0,
        timerIndex: 0,
        camera: null,
        uniqueId: 1
    },
    $listeners: {},
    on: function(event, func, owner) {
        var buffer = this.$listeners[event];
        if (!buffer) {
            buffer = [ new this.Watcher(func, owner) ];
            this.$listeners[event] = buffer;
        } else {
            buffer.push(new this.Watcher(func, owner));
        }
    },
    off: function(event, func, owner) {
        var buffer = this.$listeners[event];
        if (!buffer) {
            console.warn("(meta.off) No listeners found for the event: " + event);
            return;
        }
        owner = owner || window;
        var num = buffer.length;
        for (var n = 0; n < num; n++) {
            var watcher = buffer[n];
            if (watcher.owner === owner && watcher.func === func) {
                buffer[n] = buffer[num - 1];
                buffer.pop();
                break;
            }
        }
    },
    emit: function(event, params) {
        var buffer = this.$listeners[event];
        if (!buffer) {
            return;
        }
        if (params) {
            for (var n = 0; n < buffer.length; n++) {
                var item = buffer[n];
                item.func.call(item.owner, params);
            }
        } else {
            for (var n = 0; n < buffer.length; n++) {
                var item = buffer[n];
                item.func.call(item.owner);
            }
        }
    },
    set camera(camera) {
        if (this.cache.camera === camera) {
            return;
        }
        this.cache.camera = camera;
        camera.activate();
    },
    get camera() {
        return this.cache.camera;
    },
    Watcher: function(func, owner) {
        this.func = func;
        this.owner = owner || window;
    }
};

"use strict";

(function(scope) {
    if (!scope.meta) {
        scope.meta = {};
    }
    var initializing = false;
    var fnTest = /\b_super\b/;
    var holders = {};
    meta.class = function(clsName, extendName, prop, cb) {
        if (!initializing) {
            meta.class._construct(clsName, extendName, prop, cb);
        }
    };
    meta.class._construct = function(clsName, extendName, prop, cb) {
        if (!clsName) {
            console.error("(meta.class) Invalid class name");
            return;
        }
        if (!prop) {
            prop = extendName;
            extendName = null;
        }
        if (!prop) {
            prop = {};
        }
        var extend = null;
        if (extendName) {
            var prevScope = null;
            var extendScope = window;
            var extendScopeBuffer = extendName.split(".");
            var num = extendScopeBuffer.length - 1;
            for (var n = 0; n < num; n++) {
                prevScope = extendScope;
                extendScope = extendScope[extendScopeBuffer[n]];
                if (!extendScope) {
                    extendScope = {};
                    prevScope[extendScopeBuffer[n]] = extendScope;
                }
            }
            var name = extendScopeBuffer[num];
            extend = extendScope[name];
            if (!extend) {
                var holder = holders[extendName];
                if (!holder) {
                    holder = new ExtendHolder();
                    holders[extendName] = holder;
                }
                holder.classes.push(new ExtendItem(clsName, prop, cb));
                return;
            }
        }
        Extend(clsName, extend, prop, cb);
    };
    function Extend(clsName, extend, prop, cb) {
        var prevScope = null;
        var scope = window;
        var scopeBuffer = clsName.split(".");
        var num = scopeBuffer.length - 1;
        var name = scopeBuffer[num];
        for (var n = 0; n < num; n++) {
            prevScope = scope;
            scope = scope[scopeBuffer[n]];
            if (!scope) {
                scope = {};
                prevScope[scopeBuffer[n]] = scope;
            }
        }
        var extendHolder = holders[clsName];
        var prevCls = scope[name];
        var cls = function Class(a, b, c, d, e, f) {
            if (!initializing) {
                if (this.init) {
                    this.init(a, b, c, d, e, f);
                }
            }
        };
        var proto = null;
        var extendProto = null;
        if (extend) {
            initializing = true;
            proto = new extend();
            extendProto = proto.__proto__;
            initializing = false;
        } else {
            initializing = true;
            proto = new meta.class();
            initializing = false;
        }
        for (var key in prop) {
            var p = Object.getOwnPropertyDescriptor(prop, key);
            if (p.get || p.set) {
                Object.defineProperty(proto, key, p);
                continue;
            }
            if (extend) {
                if (typeof prop[key] == "function" && typeof extendProto[key] == "function" && fnTest.test(prop[key])) {
                    proto[key] = function(key, fn) {
                        return function(a, b, c, d, e, f) {
                            var tmp = this._super;
                            this._super = extendProto[key];
                            this._fn = fn;
                            var ret = this._fn(a, b, c, d, e, f);
                            this._super = tmp;
                            return ret;
                        };
                    }(key, prop[key]);
                    continue;
                }
            }
            proto[key] = prop[key];
        }
        proto.delete = function() {
            if (this.__managed__) {
                meta.delete(this);
            } else {
                this.remove();
            }
        };
        proto.__managed__ = false;
        cls.prototype = proto;
        cls.prototype.__name__ = clsName;
        cls.prototype.__lastName__ = name;
        cls.prototype.constructor = proto.init || null;
        scope[name] = cls;
        if (prevCls) {
            for (var key in prevCls) {
                cls[key] = prevCls[key];
            }
        }
        if (extendHolder) {
            var extendItem = null;
            var classes = extendHolder.classes;
            num = classes.length;
            for (n = 0; n < num; n++) {
                extendItem = classes[n];
                Extend(extendItem.name, cls, extendItem.prop, extendItem.cb);
            }
            delete holders[clsName];
        }
        if (cb) {
            cb(cls, clsName);
        }
    }
    function ExtendHolder() {
        this.classes = [];
    }
    function ExtendItem(name, prop, cb) {
        this.name = name;
        this.prop = prop;
        this.cb = cb;
    }
    meta.classLoaded = function() {
        var i = 0;
        var holder = null;
        var classes = null;
        var numClasses = 0;
        for (var key in holders) {
            holder = holders[key];
            console.error("Undefined class: " + key);
            classes = holder.classes;
            numClasses = classes.length;
            for (i = 0; i < numClasses; i++) {
                console.error("Undefined class: " + classes[i].name);
            }
        }
        holder = {};
    };
})(typeof window !== void 0 ? window : global);

"use strict";

meta.isPowerOfTwo = function(x) {
    return x != 0 && (x & ~x + 1) === x;
};

meta.getNameFromPath = function(path) {
    var wildcardIndex = path.lastIndexOf(".");
    var slashIndex = path.lastIndexOf("/");
    if (wildcardIndex < 0 || path.length - wildcardIndex > 5) {
        return path.slice(slashIndex + 1);
    }
    return path.slice(slashIndex + 1, wildcardIndex);
};

meta.getExtFromPath = function(path) {
    var wildcardIndex = path.lastIndexOf(".");
    if (wildcardIndex === -1) {
        return null;
    }
    return path.slice(wildcardIndex + 1);
};

meta.genUniqueId = function() {
    return meta.cache.uniqueId++ + "";
};

"use strict";

meta.engine = {
    init: function() {
        meta.emit("init");
        this.parseFlags();
        this.addMetaTags();
        this.createWebGL();
        this.print();
        this.flags |= this.Flag.INITIALIZED;
        this.setup();
    },
    setup: function() {
        meta.camera = new meta.Camera();
        meta.emit("setup");
        this.addListeners();
        var masterView = new meta.View("master");
        masterView.$activate();
        meta.views.master = masterView;
        meta.view = masterView;
        meta.renderer.setup();
        this.updateResolution();
        this.flags |= this.Flag.SETUPED;
        this.preload();
    },
    preload: function() {
        meta.emit("preload");
        this.flags |= this.Flag.PRELOADED;
        var self = this;
        this.$renderLoopFunc = function() {
            self.render();
        };
        this.$renderLoopFunc();
        this.load();
    },
    $renderLoopFunc: null,
    load: function() {
        meta.emit("load");
        this.flags |= this.Flag.LOADED;
    },
    ready: function() {
        meta.emit("ready");
        this.flags |= this.Flag.READY;
    },
    update: function(tDelta) {
        meta.emit("update", tDelta);
    },
    render: function() {
        this.time.frameIndex++;
        var tNow = Date.now();
        if (this.time.pause) {
            this.time.delta = 0;
            this.time.deltaF = 0;
        } else {
            this.time.delta = tNow - this.time.current;
            if (this.time.delta > this.time.maxDelta) {
                this.time.delta = this.time.maxDelta;
            }
            this.time.delta *= this.time.scale;
            this.time.deltaF = this.time.delta / 1e3;
            this.time.accumulator += this.time.delta;
        }
        if (tNow - this.time.fps >= 1e3) {
            this.time.fps = tNow;
            this.fps = this.$fpsCounter;
            this.$fpsCounter = 0;
            meta.emit("fps", this.fps);
        }
        this.update(this.time.deltaF);
        meta.emit("render");
        meta.renderer.render(this.time.deltaF);
        this.$fpsCounter++;
        this.time.current = tNow;
        requestAnimationFrame(this.$renderLoopFunc);
    },
    updateResolution: function() {
        var width = meta.cache.width;
        var height = meta.cache.height;
        if (this.container === document.body) {
            width = window.innerWidth;
            height = window.innerHeight;
        } else {
            width = this.container.clientWidth;
            height = this.container.clientHeight;
        }
        this.width = Math.ceil(width);
        this.height = Math.ceil(height);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = width * this.scaleX + "px";
        this.canvas.style.height = height * this.scaleY + "px";
        meta.renderer.onResize();
    },
    $updateOffset: function() {
        this.offsetLeft = 0;
        this.offsetTop = 0;
        var element = this.container;
        if (element.offsetParent) {
            do {
                this.offsetLeft += element.offsetLeft;
                this.offsetTop += element.offsetTop;
            } while (element = element.offsetParent);
        }
        var rect = this.container.getBoundingClientRect();
        this.offsetLeft += rect.left;
        this.offsetTop += rect.top;
        rect = this.canvas.getBoundingClientRect();
        this.offsetLeft += rect.left;
        this.offsetTop += rect.top;
    },
    addMetaTags: function() {
        if (this.flags & this.Flag.META_TAGS_ADDED) {
            return;
        }
        var contentType = document.createElement("meta");
        contentType.setAttribute("http-equiv", "Content-Type");
        contentType.setAttribute("content", "text/html; charset=utf-8");
        document.head.appendChild(contentType);
        var encoding = document.createElement("meta");
        encoding.setAttribute("http-equiv", "encoding");
        encoding.setAttribute("content", "utf-8");
        document.head.appendChild(encoding);
        var content = "user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height";
        var viewport = document.createElement("meta");
        viewport.setAttribute("name", "viewport");
        viewport.setAttribute("content", content);
        document.head.appendChild(viewport);
        var appleMobileCapable = document.createElement("meta");
        appleMobileCapable.setAttribute("name", "apple-mobile-web-app-capable");
        appleMobileCapable.setAttribute("content", "yes");
        document.head.appendChild(appleMobileCapable);
        var appleStatusBar = document.createElement("meta");
        appleStatusBar.setAttribute("name", "apple-mobile-web-app-status-bar-style");
        appleStatusBar.setAttribute("content", "black-translucent");
        document.head.appendChild(appleStatusBar);
        this.flags |= this.Flag.META_TAGS_ADDED;
    },
    parseFlags: function() {
        var flag, flagName, flagValue, flagSepIndex;
        var flags = window.location.hash.substr(1).split(",");
        var num = flags.length;
        for (var n = 0; n < num; n++) {
            flag = flags[n];
            flagSepIndex = flag.indexOf("=");
            if (flagSepIndex > 0) {
                flagName = flag.substr(0, flagSepIndex).replace(/ /g, "");
                flagValue = eval(flag.substr(flagSepIndex + 1).replace(/ /g, ""));
                meta.flags[flagName] = flagValue;
            }
        }
    },
    createWebGL: function() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "meta-webgl";
        this.canvas.style.cssText = this.canvasStyle;
        var params = {
            alpha: false,
            premultipliedAlpha: false
        };
        var context = this.canvas.getContext("webgl", params) || this.canvas.getContext("experimental-webgl", params);
        if (window.WebGLDebugUtils) {
            this.gl = WebGLDebugUtils.makeDebugContext(context);
        } else {
            this.gl = context;
        }
        if (!this.container) {
            this.container = document.body;
        }
        document.body.style.cssText = this.containerStyle;
        this.container.appendChild(this.canvas);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
    },
    addListeners: function() {
        var self = this;
        this.cb = {
            resize: function(event) {
                self.updateResolution();
            },
            focus: function(event) {
                self.handleFocus(true);
            },
            blur: function(event) {
                self.handleFocus(false);
            }
        };
        window.addEventListener("resize", this.cb.resize, false);
        window.addEventListener("orientationchange", this.cb.resize, false);
        if (meta.device.hidden) {
            this.cb.visibilityChange = function() {
                self.handleVisibilityChange();
            };
            document.addEventListener(meta.device.visibilityChange, this.cb.visibilityChange);
        }
        window.addEventListener("focus", this.cb.focus);
        window.addEventListener("blur", this.cb.blur);
        if (meta.device.support.fullScreen) {
            this.cb.fullscreen = function() {
                self.onFullScreenChangeCB();
            };
            document.addEventListener(meta.device.fullScreenOnChange, this.cb.fullscreen);
        }
        this.canvas.addEventListener("webglcontextlost", function() {
            self.onCtxLost();
        });
        this.canvas.addEventListener("webglcontextrestored", function() {
            self.onCtxRestored();
        });
    },
    handleFocus: function(value) {
        if (value) {
            this.flags |= this.Flag.FOCUS;
            meta.emit("focus");
        } else {
            this.flags &= ~(this.Flag.FOCUS | this.Flag.PAUSED);
            meta.emit("blur");
        }
    },
    handleVisibilityChange: function() {
        if (document[meta.device.hidden]) {
            this.handleFocus(false);
        } else {
            this.handleFocus(true);
        }
    },
    onFullScreenChangeCB: function() {
        var fullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        meta.device.fullscreen = !!fullscreen;
        this.onFullscreen.emit(meta.device.fullscreen, meta.Event.FULLSCREEN);
    },
    onCtxLost: function() {
        console.log("(Context lost)");
    },
    onCtxRestored: function() {
        console.log("(Context restored)");
    },
    print: function() {
        if (meta.device.support.consoleCSS) {
            console.log("%c META2D v" + meta.version + " ", "background: #000; color: white; font-size: 12px; padding: 2px 0 1px 0;", "http://meta2d.com");
            console.log("%cBrowser: %c" + meta.device.name + " " + meta.device.version + "	", "font-weight: bold; padding: 2px 0 1px 0;", "padding: 2px 0 1px 0;");
            console.log("%cRenderer: %cCanvas ", "font-weight: bold; padding: 2px 0 2px 0;", "padding: 2px 0 2px 0;");
        } else {
            console.log("META2D v" + meta.version + " http://meta2d.com ");
            console.log("Browser: " + meta.device.name + " " + meta.device.version + "	");
            console.log("Renderer: Canvas ");
        }
    },
    get focus() {
        return this.flags & this.Flag.FOCUS;
    },
    Flag: {
        INITIALIZED: 1 << 0,
        SETUPED: 1 << 1,
        PRELOADED: 1 << 2,
        LOADED: 1 << 3,
        READY: 1 << 4,
        META_TAGS_ADDED: 1 << 5,
        FOCUS: 1 << 6,
        FULLSCREEN: 1 << 7
    },
    container: null,
    canvas: null,
    gl: null,
    flags: null,
    cb: null,
    timers: [],
    timersRemove: [],
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    zoom: 1,
    ratio: 1,
    offsetLeft: 0,
    offsetTop: 0,
    time: meta.time,
    fps: 0,
    $fpsCounter: 0,
    containerStyle: "padding:0; margin:0;",
    canvasStyle: "position:absolute; width: 100%; height: 100%; overflow:hidden; translateZ(0); " + "-webkit-backface-visibility:hidden; -webkit-perspective: 1000; " + "-webkit-touch-callout: none; -webkit-user-select: none; zoom: 1;"
};

"use strict";

meta.cache.exts = {};

meta.cache.extParams = {};

meta.getExt = function(name) {
    var extension = this.cache.exts[name];
    if (extension) {
        return extension;
    }
    var gl = meta.engine.gl;
    switch (name) {
      case "WEBGL_depth_texture":
        extension = gl.getExtension("WEBGL_depth_texture") || gl.getExtension("WEBKIT_WEBGL_depth_texture") || gl.getExtension("MOZ_WEBGL_depth_texture");
        break;

      case "EXT_texture_filter_anisotropic":
        extension = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
        break;

      case "WEBGL_compressed_texture_s3tc":
        extension = gl.getExtension("WEBGL_compressed_texture_s3tc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
        break;

      case "WEBGL_compressed_texture_pvrtc":
        extension = gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;

      case "WEBGL_compressed_texture_etc1":
        extension = gl.getExtension("WEBGL_compressed_texture_etc1");
        break;

      default:
        extension = gl.getExtension(name);
        break;
    }
    if (extension === null) {
        console.warn("(meta.getExtension) Extension not supported: " + name);
        return;
    }
    this.cache.exts[name] = extension;
    return extension;
};

meta.getExtParam = function(type) {
    var param = this.cache.extParams[type];
    if (!param) {
        param = meta.engine.gl.getParameter(type);
        this.cache.extParams[type] = param;
    }
    return param;
};

"use strict";

meta.device = {
    load: function() {
        this.checkBrowser();
        this.mobile = this.isMobileAgent();
        this.checkConsoleCSS();
        this.checkFileAPI();
        this.support.onloadedmetadata = typeof window.onloadedmetadata === "object";
        this.support.onkeyup = typeof window.onkeyup === "object";
        this.support.onkeydown = typeof window.onkeydown === "object";
        this.support.canvas = this.isCanvasSupport();
        this.support.webgl = this.isWebGLSupport();
        this.modernize();
    },
    checkBrowser: function() {
        var regexps = {
            Chrome: [ /Chrome\/(\S+)/ ],
            Firefox: [ /Firefox\/(\S+)/ ],
            MSIE: [ /MSIE (\S+);/ ],
            Opera: [ /OPR\/(\S+)/, /Opera\/.*?Version\/(\S+)/, /Opera\/(\S+)/ ],
            Safari: [ /Version\/(\S+).*?Safari\// ]
        };
        var userAgent = navigator.userAgent;
        var name, currRegexp, match;
        var numElements = 2;
        for (name in regexps) {
            while (currRegexp = regexps[name].shift()) {
                if (match = userAgent.match(currRegexp)) {
                    this.version = match[1].match(new RegExp("[^.]+(?:.[^.]+){0," + --numElements + "}"))[0];
                    this.name = name;
                    this.versionBuffer = this.version.split(".");
                    var versionBufferLength = this.versionBuffer.length;
                    for (var i = 0; i < versionBufferLength; i++) {
                        this.versionBuffer[i] = parseInt(this.versionBuffer[i]);
                    }
                    break;
                }
            }
        }
        if (this.versionBuffer === null || this.name === "unknown") {
            console.warn("(meta.device.checkBrowser) Could not detect browser.");
        } else {
            if (this.name === "Chrome" || this.name === "Safari" || this.name === "Opera") {
                this.vendor = "webkit";
            } else if (this.name === "Firefox") {
                this.vendor = "moz";
            } else if (this.name === "MSIE") {
                this.vendor = "ms";
            }
        }
    },
    checkConsoleCSS: function() {
        if (!this.mobile && (this.name === "Chrome" || this.name === "Opera")) {
            this.support.consoleCSS = true;
        } else {
            this.support.consoleCSS = false;
        }
    },
    checkFileAPI: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.support.fileAPI = true;
        } else {
            this.support.fileAPI = false;
        }
    },
    modernize: function() {
        if (!Number.MAX_SAFE_INTEGER) {
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
    isMobileAgent: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    isCanvasSupport: function() {
        return !!window.CanvasRenderingContext2D;
    },
    isWebGLSupport: function() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!context;
    },
    supportConsole: function() {
        if (!window.console) {
            window.console = {};
            window.console.log = meta.emptyFuncParam;
            window.console.warn = meta.emptyFuncParam;
            window.console.error = meta.emptyFuncParam;
        }
    },
    supportPageVisibility: function() {
        if (document.hidden !== undefined) {
            this.hidden = "hidden";
            this.visibilityChange = "visibilitychange";
        } else if (document.hidden !== undefined) {
            this.hidden = "webkitHidden";
            this.visibilityChange = "webkitvisibilitychange";
        } else if (document.hidden !== undefined) {
            this.hidden = "mozhidden";
            this.visibilityChange = "mozvisibilitychange";
        } else if (document.hidden !== undefined) {
            this.hidden = "mshidden";
            this.visibilityChange = "msvisibilitychange";
        }
    },
    supportFullScreen: function() {
        this.$fullScreenRequest();
        this.$fullScreenExit();
        this.$fullScreenOnChange();
        this.support.fullScreen = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
    },
    $fullScreenRequest: function() {
        var element = document.documentElement;
        if (element.requestFullscreen !== undefined) {
            this.fullScreenRequest = "requestFullscreen";
        } else if (element.webkitRequestFullscreen !== undefined) {
            this.fullScreenRequest = "webkitRequestFullscreen";
        } else if (element.mozRequestFullScreen !== undefined) {
            this.fullScreenRequest = "mozRequestFullScreen";
        } else if (element.msRequestFullscreen !== undefined) {
            this.fullScreenRequest = "msRequestFullscreen";
        }
    },
    $fullScreenExit: function() {
        if (document.exitFullscreen !== undefined) {
            this.fullScreenExit = "exitFullscreen";
        } else if (document.webkitExitFullscreen !== undefined) {
            this.fullScreenExit = "webkitExitFullscreen";
        } else if (document.mozCancelFullScreen !== undefined) {
            this.fullScreenExit = "mozCancelFullScreen";
        } else if (document.msExitFullscreen !== undefined) {
            this.fullScreenExit = "msExitFullscreen";
        }
    },
    $fullScreenOnChange: function() {
        if (document.onfullscreenchange !== undefined) {
            this.fullScreenOnChange = "fullscreenchange";
        } else if (document.onwebkitfullscreenchange !== undefined) {
            this.fullScreenOnChange = "webkitfullscreenchange";
        } else if (document.onmozfullscreenchange !== undefined) {
            this.fullScreenOnChange = "mozfullscreenchange";
        } else if (document.onmsfullscreenchange !== undefined) {
            this.fullScreenOnChange = "msfullscreenchange";
        }
    },
    supportRequestAnimFrame: function() {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function() {
                return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
                    window.setTimeout(callback, 1e3 / 60);
                };
            }();
        }
    },
    supportPerformanceNow: function() {
        if (window.performance === undefined) {
            window.performance = {};
        }
        if (window.performance.now === undefined) {
            window.performance.now = Date.now;
        }
    },
    supportAudioFormats: function() {
        var audio = document.createElement("audio");
        if (audio.canPlayType("audio/mp4")) {
            this.audioFormats.push("m4a");
        }
        if (audio.canPlayType("audio/ogg")) {
            this.audioFormats.push("ogg");
        }
        if (audio.canPlayType("audio/mpeg")) {
            this.audioFormats.push("mp3");
        }
        if (audio.canPlayType("audio/wav")) {
            this.audioFormats.push("wav");
        }
    },
    supportAudioAPI: function() {
        if (!window.AudioContext) {
            window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
        }
        if (window.AudioContext) {
            this.audioAPI = true;
        }
    },
    supportFileSystemAPI: function() {
        if (!window.requestFileSystem) {
            window.requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.oRequestFileSystem || window.msRequestFileSystem;
        }
        if (window.requestFileSystem) {
            this.support.fileSystemAPI = true;
        }
    },
    name: "unknown",
    version: "0",
    versionBuffer: null,
    vendors: [ "", "webkit", "moz", "ms", "o" ],
    vendor: "",
    support: {},
    audioFormats: [],
    mobile: false,
    isPortrait: false,
    audioAPI: false,
    hidden: null,
    visibilityChange: null,
    fullScreenRequest: null,
    fullScreenExit: null,
    fullScreenOnChange: null,
    fullscreen: false
};

meta.device.load();

"use strict";

meta.input = {
    setup: function() {
        var numTotalKeys = this.$numKeys + this.$numInputs + 1;
        this.keys = new Array(numTotalKeys);
        this.keybinds = new Array(numTotalKeys);
        this.$eventDown = new this.Event();
        this.$event = new this.Event();
        meta.on("blur", this.resetInputs, this);
        meta.on("update", this.updatePicking, this);
        this.$loadIgnoreKeys();
        this.$addEventListeners();
    },
    updatePicking: function(tDelta) {},
    handleKeyDown: function(domEvent) {
        var keyCode = domEvent.keyCode;
        this.checkIgnoreKey(domEvent, keyCode);
        if (!this.enable) {
            return;
        }
        if (this.stickyKeys && this.keys[keyCode]) {
            return;
        }
        this.keys[keyCode] = 1;
        this.$eventDown.domEvent = domEvent;
        this.$eventDown.prevScreenX = 0;
        this.$eventDown.prevScreenY = 0;
        this.$eventDown.screenX = 0;
        this.$eventDown.screenY = 0;
        this.$eventDown.x = 0;
        this.$eventDown.y = 0;
        this.$eventDown.delta = 0;
        this.$eventDown.keyCode = keyCode;
        this.$eventDown.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-down", this.$eventDown);
        this.updateRepeatKey(keyCode);
    },
    handleKeyUp: function(domEvent) {
        var keyCode = event.keyCode;
        this.checkIgnoreKey(domEvent, keyCode);
        if (!this.enable) {
            return;
        }
        this.keys[keyCode] = 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = 0;
        this.$event.prevScreenY = 0;
        this.$event.screenX = 0;
        this.$event.screenY = 0;
        this.$event.x = 0;
        this.$event.y = 0;
        this.$event.delta = 0;
        this.$event.keyCode = keyCode;
        this.$event.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-up", this.$event);
        if (this.repeatKey && this.$repeatTimer) {
            this.$repeatTimer.stop();
        }
    },
    handleMouseDown: function(domEvent) {
        if (!this.enable) {
            return;
        }
        var keyCode = event.button + this.BUTTON_ENUM_OFFSET;
        this.keys[keyCode] = 1;
        var engine = meta.engine;
        var camera = meta.camera;
        this.prevScreenX = this.screenX;
        this.prevScreenY = this.screenX;
        this.screenX = (event.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
        this.screenY = (event.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
        this.x = this.screenX * camera.zoomRatio + camera.volume.x | 0;
        this.y = this.screenY * camera.zoomRatio + camera.volume.y | 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = 0;
        this.$event.keyCode = keyCode;
        this.$event.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-down", this.$event);
    },
    handleMouseUp: function(domEvent) {
        if (!this.enable) {
            return;
        }
        var keyCode = event.button + this.BUTTON_ENUM_OFFSET;
        this.keys[keyCode] = 0;
        var engine = meta.engine;
        var camera = meta.camera;
        this.prevScreenX = this.screenX;
        this.prevScreenY = this.screenY;
        this.screenX = (event.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
        this.screenY = (event.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
        this.x = this.screenX * camera.zoomRatio + camera.volume.x | 0;
        this.y = this.screenY * camera.zoomRatio + camera.volume.y | 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = 0;
        this.$event.keyCode = keyCode;
        this.$event.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-up", this.$event);
    },
    handleMouseMove: function(domEvent) {
        if (document.activeElement === document.body) {
            domEvent.preventDefault();
        }
        if (!this.enable) {
            return;
        }
        var engine = meta.engine;
        var camera = meta.camera;
        this.prevScreenX = this.screenX;
        this.prevScreenY = this.screenY;
        this.screenX = (event.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
        this.screenY = (event.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
        this.x = this.screenX * camera.zoomRatio + camera.volume.x | 0;
        this.y = this.screenY * camera.zoomRatio + camera.volume.y | 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = 0;
        this.$event.keyCode = -1;
        meta.emit("input-move", this.$event);
    },
    handleMouseDbClick: function(domEvent) {
        if (!this.enable) {
            return;
        }
        var engine = meta.engine;
        var camera = meta.camera;
        var keyCode = domEvent.button;
        this.prevScreenX = this.screenX;
        this.prevScreenY = this.screenY;
        this.screenX = (event.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
        this.screenY = (event.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
        this.x = this.screenX * camera.zoomRatio + camera.volume.x | 0;
        this.y = this.screenY * camera.zoomRatio + camera.volume.y | 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = 0;
        this.$event.keyCode = keyCode;
        this.$event.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-up", this.$event);
    },
    handleTouchDown: function(domEvent) {
        if (document.activeElement === document.body) {
            domEvent.preventDefault();
        }
        var engine = meta.engine;
        var camera = meta.camera;
        var changedTouches = domEvent.changedTouches;
        var numTouches = changedTouches.length;
        for (var i = 0; i < numTouches; i++) {
            var id = this.touches.length - 1;
            var touch = changedTouches[i];
            this.touches.push(touch.identifier);
            var screenX = (touch.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
            var screenY = (touch.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
            var x = screenX * camera.zoomRatio + camera.volume.x | 0;
            var y = screenY * camera.zoomRatio + camera.volume.y | 0;
            var keyCode = id + this.BUTTON_ENUM_OFFSET;
            this.keys[keyCode] = 1;
            this.$event.domEvent = domEvent;
            this.$event.prevScreenX = screenX;
            this.$event.prevScreenY = screenY;
            this.$event.screenX = screenX;
            this.$event.screenY = screenY;
            this.$event.x = x;
            this.$event.y = y;
            this.$event.delta = 0;
            this.$event.keyCode = keyCode;
            this.$event.keybind = this.keybinds[keyCode] || null;
            if (id === 0) {
                this.screenX = screenX;
                this.screenY = screenY;
                this.x = x;
                this.y = y;
            }
            meta.emit("input-down", this.$event);
        }
    },
    handleTouchUp: function(domEvent) {
        if (document.activeElement === document.body) {
            domEvent.preventDefault();
        }
        var engine = meta.engine;
        var camera = meta.camera;
        var changedTouches = domEvent.changedTouches;
        var numTouches = changedTouches.length;
        for (var i = 0; i < numTouches; i++) {
            var touch = changedTouches[i];
            var id = this.$getTouchID(touch.identifier);
            if (id === -1) {
                continue;
            }
            this.touches.splice(id, 1);
            var screenX = (touch.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
            var screenY = (touch.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
            var x = screenX * camera.zoomRatio + camera.volume.x | 0;
            var y = screenY * camera.zoomRatio + camera.volume.y | 0;
            var keyCode = id + this.BUTTON_ENUM_OFFSET;
            this.keys[keyCode] = 0;
            if (id === 0) {
                this.prevScreenX = this.screenX;
                this.prevScreenY = this.screenY;
                this.screenX = screenX;
                this.screenY = screenY;
                this.x = x;
                this.y = y;
                this.$event.prevScreenX = this.prevScreenX;
                this.$event.prevScreenY = this.prevScreenY;
            } else {
                this.$event.prevScreenX = 0;
                this.$event.prevScreenY = 0;
            }
            this.$event.domEvent = domEvent;
            this.$event.screenX = screenX;
            this.$event.screenY = screenY;
            this.$event.x = x;
            this.$event.y = y;
            this.$event.delta = 0;
            this.$event.keyCode = id;
            this.$event.keybind = this.keybinds[keyCode] || null;
            meta.emit("input-down", this.$event);
        }
    },
    handleTouchMove: function(domEvent) {
        if (document.activeElement === document.body) {
            domEvent.preventDefault();
        }
        var scope = meta;
        var camera = scope.camera;
        var changedTouches = domEvent.changedTouches;
        var numTouches = changedTouches.length;
        for (var i = 0; i < numTouches; i++) {
            var touch = changedTouches[i];
            var id = this.$getTouchID(touch.identifier);
            if (id === -1) {
                continue;
            }
            var screenX = (touch.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
            var screenY = (touch.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
            var x = screenX * camera.zoomRatio + camera.volume.x | 0;
            var y = screenY * camera.zoomRatio + camera.volume.y | 0;
            var keyCode = id + this.BUTTON_ENUM_OFFSET;
            if (id === 0) {
                this.prevScreenX = this.screenX;
                this.prevScreenY = this.screenY;
                this.screenX = screenX;
                this.screenY = screenY;
                this.x = x;
                this.y = y;
                this.$event.prevScreenX = this.prevScreenX;
                this.$event.prevScreenY = this.prevScreenY;
            } else {
                this.$event.prevScreenX = screenX;
                this.$event.prevScreenY = screenY;
            }
            this.$event.domEvent = domEvent;
            this.$event.screenX = 0;
            this.$event.screenY = 0;
            this.$event.x = x;
            this.$event.y = y;
            this.$event.delta = 0;
            this.$event.keyCode = keyCode;
            this.$event.keybind = this.keybinds[keyCode] || null;
            meta.emit("input-move", $event);
        }
    },
    handleMouseWheel: function(domEvent) {
        if (document.activeElement === document.body) {
            domEvent.preventDefault();
        }
        var delta = Math.max(-1, Math.min(1, domEvent.wheelDelta || -domEvent.detail));
        var engine = meta.engine;
        var camera = meta.camera;
        this.prevScreenX = this.screenX;
        this.prevScreenY = this.screenY;
        this.screenX = (event.pageX - engine.offsetLeft) * engine.scaleX * engine.ratio;
        this.screenY = (event.pageY - engine.offsetTop) * engine.scaleY * engine.ratio;
        this.x = this.screenX * camera.zoomRatio + camera.volume.x | 0;
        this.y = this.screenY * camera.zoomRatio + camera.volume.y | 0;
        this.$event.domEvent = domEvent;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = delta;
        this.$event.keyCode = 0;
        this.$event.keybind = null;
        meta.emit("input-scroll", this.$event);
    },
    $getTouchID: function(eventTouchID) {
        for (var n = 0; n < this.touches.length; n++) {
            if (this.touches[n] === eventTouchID) {
                return n;
            }
        }
        return -1;
    },
    resetInputs: function() {
        this.$event.domEvent = null;
        this.$event.prevScreenX = this.prevScreenX;
        this.$event.prevScreenY = this.prevScreenY;
        this.$event.screenX = this.screenX;
        this.$event.screenY = this.screenY;
        this.$event.x = this.x;
        this.$event.y = this.y;
        this.$event.delta = 0;
        for (var n = 0; n < this.keys.length; n++) {
            if (!this.keys[n]) {
                continue;
            }
            this.keys[n] = 0;
            this.$event.keyCode = n;
            this.$event.keybind = this.keybinds[n];
            meta.emit("input-up", this.$event);
        }
        for (var n = 0; n < this.touches.length; n++) {
            if (!this.touches[n]) {
                continue;
            }
            var keyCode = n + this.BUTTON_ENUM_OFFSET;
            this.$event.keyCode = keyCode;
            this.$event.keybind = this.keybinds[keyCode];
        }
        this.$eventDown = new this.Event();
        this.$event = new this.Event();
    },
    keybind: function(keybind, keys) {
        if (keys instanceof Array) {
            for (var n = 0; n < keys.length; n++) {
                var key = keys[n];
                this.keybinds[key] = keybind;
                this.keybindMap[keybind] = key;
            }
        } else {
            this.keybinds[keys] = keybind;
            this.keybindMap[keybind] = keys;
        }
    },
    isDown: function(key) {
        return this.keys[key];
    },
    isUp: function(key) {
        return !this.keys[key];
    },
    isKeybindDown: function(keybind) {
        return this.keys[this.keybindMap[keybind]];
    },
    isKeybindUp: function(keybind) {
        return !this.keys[this.keybindMap[keybind]];
    },
    checkIgnoreKey: function(domEvent, keyCode) {
        if (document.activeElement === document.body) {
            if (window.top && this.iframeKeys[keyCode]) {
                domEvent.preventDefault();
            }
            if (this.cmdKeys[keyCode] !== undefined) {
                this.numCmdKeysPressed++;
            }
            if (this.ignoreKeys[keyCode] !== undefined && this.numCmdKeysPressed <= 0) {
                domEvent.preventDefault();
            }
        }
    },
    updateRepeatKey: function(keyCode) {
        if (!this.repeatKey) {
            return;
        }
        if (!this.$repeatTimer) {
            this.$repeatTimer = meta.addTimer(this, this.repeatFunc, this.repeatDelay);
        }
        this.repeatKey = keyCode;
        this.$repeatTimer.reset();
    },
    repeatFunc: function() {
        this.$eventDown.domEvent = domEvent;
        this.$eventDown.prevScreenX = 0;
        this.$eventDown.prevScreenY = 0;
        this.$eventDown.screenX = 0;
        this.$eventDown.screenY = 0;
        this.$eventDown.x = 0;
        this.$eventDown.y = 0;
        this.$eventDown.delta = 0;
        this.$eventDown.keyCode = keyCode;
        this.$eventDown.keybind = this.keybinds[keyCode] || null;
        meta.emit("input-down", $this.eventDown);
    },
    $addEventListeners: function() {
        var self = this;
        window.addEventListener("mousedown", function(event) {
            self.handleMouseDown(event);
        });
        window.addEventListener("mouseup", function(event) {
            self.handleMouseUp(event);
        });
        window.addEventListener("mousemove", function(event) {
            self.handleMouseMove(event);
        });
        window.addEventListener("dblclick", function(event) {
            self.handleMouseDbClick(event);
        });
        window.addEventListener("touchstart", function(event) {
            self.handleTouchDown(event);
        });
        window.addEventListener("touchend", function(event) {
            self.handleTouchUp(event);
        });
        window.addEventListener("touchmove", function(event) {
            self.handleTouchMove(event);
        });
        window.addEventListener("touchcancel", function(event) {
            self.handleTouchUp(event);
        });
        window.addEventListener("touchleave", function(event) {
            self.handleTouchUp(event);
        });
        window.addEventListener("mousewheel", function(event) {
            self.handleMouseWheel(event);
        });
        if (meta.device.support.onkeydown) {
            window.addEventListener("keydown", function(event) {
                self.handleKeyDown(event);
            });
        }
        if (meta.device.support.onkeyup) {
            window.addEventListener("keyup", function(event) {
                self.handleKeyUp(event);
            });
        }
    },
    $loadIgnoreKeys: function() {
        this.ignoreKeys = {};
        this.ignoreKeys[8] = 1;
        this.ignoreKeys[9] = 1;
        this.ignoreKeys[13] = 1;
        this.ignoreKeys[17] = 1;
        this.ignoreKeys[91] = 1;
        this.ignoreKeys[38] = 1;
        this.ignoreKeys[39] = 1;
        this.ignoreKeys[40] = 1;
        this.ignoreKeys[37] = 1;
        this.ignoreKeys[124] = 1;
        this.ignoreKeys[125] = 1;
        this.ignoreKeys[126] = 1;
        this.cmdKeys[91] = 1;
        this.cmdKeys[17] = 1;
        this.iframeKeys[37] = 1;
        this.iframeKeys[38] = 1;
        this.iframeKeys[39] = 1;
        this.iframeKeys[40] = 1;
    },
    ignoreFKeys: function(value) {
        this.ignoreKeys[112] = value;
        this.ignoreKeys[113] = value;
        this.ignoreKeys[114] = value;
        this.ignoreKeys[115] = value;
        this.ignoreKeys[116] = value;
        this.ignoreKeys[117] = value;
        this.ignoreKeys[118] = value;
        this.ignoreKeys[119] = value;
        this.ignoreKeys[120] = value;
        this.ignoreKeys[121] = value;
        this.ignoreKeys[122] = value;
        this.ignoreKeys[123] = value;
    },
    set ignoreFKeys(flag) {
        if (flag) {
            this.$ignoreFKeys(1);
        } else {
            this.$ignoreFKeys(0);
        }
    },
    get ignoreFKeys() {
        return !!this.$ignoreKeys[112];
    },
    Event: function() {
        this.domEvent = null;
        this.x = 0;
        this.y = 0;
        this.delta = 0;
        this.prevScreenX = 0;
        this.prevScreenY = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.keyCode = 0;
        this.keybind = null;
        this.entity = null;
    },
    keys: null,
    keybinds: null,
    touches: [],
    keybindMap: {},
    ignoreKeys: {},
    cmdKeys: {},
    iframeKeys: {},
    enable: true,
    stickyKeys: false,
    numCmdKeysPressed: 0,
    $repeatTimer: null,
    repeatKey: false,
    repeatDelay: 200,
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0,
    prevScreenX: 0,
    prevScreenY: 0,
    $numKeys: 256,
    $numInputs: 10,
    BUTTON_ENUM_OFFSET: 2e3,
    entitiesPicking: [],
    entitiesPickingRemove: []
};

meta.key = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    NUM_0: 48,
    NUM_1: 49,
    NUM_2: 50,
    NUM_3: 51,
    NUM_4: 52,
    NUM_5: 53,
    NUM_6: 54,
    NUM_7: 55,
    NUM_8: 56,
    NUM_9: 57,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106,
    ADD: 107,
    SUBTRACT: 109,
    DECIMAL: 110,
    DIVIDE: 111,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    SQUARE_BRACKET_LEFT: 91,
    SQUARE_BRACKET_RIGHT: 91,
    PARENTHESES_LEFT: 91,
    PARENTHESES_RIGHT: 91,
    BRACES_LEFT: 91,
    BRACES_RIGHT: 92,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    PLUS: 187,
    MINUS: 189,
    TILDE: 192,
    APOSTROPHE: 222,
    BUTTON_LEFT: 0 + meta.input.BUTTON_ENUM_OFFSET,
    BUTTON_MIDDLE: 1 + meta.input.BUTTON_ENUM_OFFSET,
    BUTTON_RIGHT: 2 + meta.input.BUTTON_ENUM_OFFSET
};

meta.input.setup();

"use strict";

meta.pools = {};

meta.new = function(cls, a, b) {
    if (!cls) {
        console.warn("(meta.new) Invalid class passed");
        return;
    }
    var buffer = meta.pools[cls.prototype.__name__];
    if (!buffer) {
        buffer = [];
        meta.pools[cls.prototype.__name__] = buffer;
    }
    var obj = buffer.pop();
    if (!obj) {
        obj = new cls(a, b);
    } else {
        obj.create(a, b);
    }
    return obj;
};

meta.delete = function(obj) {
    if (!obj) {
        console.warn("(meta.delete) Invalid object passed");
        return;
    }
    var buffer = meta.pools[obj.__name__];
    if (!buffer) {
        console.warn("(meta.delete) Buffer not found for: " + obj.__name__);
        return;
    }
    obj.remove();
    buffer.push(obj);
};

"use strict";

meta.View = function(name) {
    this.name = name;
    this.flags = 0;
    this.entities = [];
    this.children = {};
    this.$position = new meta.Vector2(0, 0);
    this.$z = 0;
};

meta.View.prototype = {
    add: function(entity) {
        if (entity.$view) {
            if (entity.$view === this) {
                console.warn("(meta.View.add) Entity is already added to this view");
            } else {
                console.warn("(meta.View.add) Entity is already added to some other view");
            }
            return;
        }
        entity.flags |= entity.Flag.ROOT;
        entity.$view = this;
        if (this.$position.x !== 0 || this.$position.y !== 0) {
            entity.updatePosition();
        }
        if (this.$z !== 0) {
            entity.updateZ();
        }
        this.entities.push(entity);
        this.$addChildren(entity.children);
        if (this.flags & this.Flag.ACTIVE && !(this.flags & this.Flag.INSTANCE_HIDDEN)) {
            meta.renderer.addEntity(entity, false);
        }
    },
    $addChildren: function(children) {},
    remove: function(entity) {
        if (entity instanceof meta.Sprite) {
            if (entity.$view !== this) {
                console.warn("(meta.view.remove) Entity has different view: ", entity.$view.id);
                return;
            }
            var index = this.entities.indexOf(entity);
            if (index === -1) {
                console.warn("(meta.view.remove) Entity not found: ", entity.id);
                return;
            }
            this.entitiesRemove.push(entity);
        } else if (typeof entity === "string") {
            if (entity.$view !== this) {
                console.warn("(meta.view.remove) Entity has different view: ", entity.$view.id);
                return;
            }
        } else {
            console.warn("(meta.view.remove) Invalid entity or id passed");
            return;
        }
        meta.renderer.removeEntity(entity);
    },
    $activate: function() {
        this.flags |= this.Flag.ACTIVE;
        if (this.flags & this.Flag.INSTANCE_HIDDEN) {
            return;
        }
        meta.renderer.addEntities(this.entities);
        if (this.children) {
            var num = this.children.length;
            for (var n = 0; n < num; n++) {
                this.children[n].$activate();
            }
        }
    },
    $deactivate: function() {
        this.flags &= ~this.Flag.ACTIVE;
        if (this.flags & this.Flag.INSTANCE_HIDDEN) {
            return;
        }
        meta.renderer.removeEntities(this.entities);
        if (this.children) {
            var num = this.children.length;
            for (var n = 0; n < num; n++) {
                this.children[n].$deactivate();
            }
        }
    },
    get active() {
        return (this.flags & this.Flag.ACTIVE) === this.Flag.ACTIVE;
    },
    Flag: {
        HIDDEN: 1 << 0,
        INSTANCE_HIDDEN: 1 << 1,
        ACTIVE: 1 << 2,
        STATIC: 1 << 3,
        DEBUGGER: 1 << 4
    }
};

"use strict";

meta.Camera = function(x, y, width, height) {
    this.volume = new meta.AABB(x, y, width, height);
};

meta.Camera.prototype = {
    set: function(x, y, width, height) {
        this.volume.set(x, y, width, height);
    },
    remove: function() {},
    activate: function() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.updateDraggable();
    },
    deactivate: function() {
        if (!this.active) {
            return;
        }
        this.active = false;
        this.updateDraggable();
    },
    update: function() {},
    updateZoom: function() {},
    onResize: function() {
        this.volume.resize(meta.engine.width, meta.engine.height);
    },
    set x(x) {
        if (this.volume.x === x) {
            return;
        }
        this.volume.position(x, this.volume.y);
        meta.emit("camera-move", this);
    },
    set y(value) {
        if (this.volume.y === y) {
            return;
        }
        this.volume.position(this.volume.x, y);
        meta.emit("camera-move", this);
    },
    get x() {
        return this.volume.x;
    },
    get y() {
        return this.volume.y;
    },
    set zoom(zoom) {
        if (this.$zoom === zoom) {
            return;
        }
        this.$zoom = zoom;
    },
    get zoom() {
        return this.$zoom;
    },
    set draggable(value) {
        if (this.$draggable === value) {
            return;
        }
        this.$draggable = value;
        this.updateDraggable();
    },
    get draggable() {
        return this.$draggable;
    },
    updateDraggable: function() {
        if (this.$draggable && this.active) {
            if (!this.$listeningEvents) {
                this.$listeningEvents = true;
                meta.on("input-move", this.drag, this);
                meta.on("input-down", this.handleInputDown, this);
                meta.on("input-up", this.handleInputUp, this);
            }
        } else {
            if (this.$listeningEvents) {
                this.$listeningEvents = false;
                meta.off("input-move", this.drag, this);
                meta.off("input-down", this.handleInputDown, this);
                meta.off("input-up", this.handleInputUp, this);
            }
        }
    },
    drag: function(event) {
        if (!this.$dragging) {
            return;
        }
        var diffX = (event.screenX - event.prevScreenX) * this.zoomRatio;
        var diffY = (event.screenY - event.prevScreenY) * this.zoomRatio;
        this.volume.move(-diffX, -diffY);
        meta.emit("camera-move", this);
    },
    handleInputDown: function(event) {
        if (event.keyCode === meta.key.BUTTON_LEFT) {
            this.$dragging = true;
        }
    },
    handleInputUp: function(event) {
        if (event.keyCode === meta.key.BUTTON_LEFT) {
            this.$dragging = false;
        }
    },
    volume: null,
    $zoom: 1,
    zoomPrev: 1,
    zoomRatio: 1,
    $zoomAuto: false,
    $active: false,
    $draggable: false,
    $dragging: false,
    $listeningEvents: false
};

meta.epsilon = 1e-6;

meta.nearestPowerOfTwo = function(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
};

meta.upperPowerOfTwo = function(value) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
};

"use strict";

meta.Vector2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

meta.Vector2.prototype = {
    set: function(x, y) {
        this.x = x;
        this.y = y;
    },
    clone: function() {
        return new meta.Vector2(this.x, this.y);
    },
    copy: function(vec) {
        this.x = vec.x;
        this.y = vec.y;
    },
    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
    },
    sub: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    },
    mul: function(vec) {
        this.x *= vec.x;
        this.y *= vec.y;
    },
    div: function(vec) {
        this.x /= vec.x;
        this.y /= vec.y;
    },
    scale: function(x, y) {
        this.x *= x;
        this.Y *= y;
    },
    floor: function() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    },
    ceil: function() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
    },
    round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    },
    min: function(x, y) {
        this.x = Math.min(this.x, x);
        this.y = Math.min(this.y, y);
    },
    max: function(x, y) {
        this.x = Math.max(this.x, x);
        this.y = Math.max(this.y, y);
    },
    length: function(vec) {
        var diffX = this.x - vec.x;
        var diffY = this.y - vec.y;
        return diffX * diffX + diffY * diffY;
    },
    squaredLength: function(vec) {
        return this.x * this.x + this.y * this.y;
    },
    inverse: function() {
        this.x = 1 / this.x;
        this.y = 1 / this.y;
    },
    magnitude: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var length = this.x * this.x + this.y * this.y;
        if (length > 0) {
            this.x = 0;
            this.y = 0;
        } else {
            length = Math.sqrt(length);
            this.x /= length;
            this.y /= length;
        }
    },
    dot: function(vec) {
        return this.x * vec.x + this.y * vec.y;
    },
    lerp: function(a, b, t) {
        this.x = a.x + t * (b.x - a.x);
        this.y = a.y + t * (b.y - a.y);
    },
    rand: function(min, max) {
        this.x = meta.random.number(min, max);
        this.y = meta.random.number(min, max);
    },
    exactEquals: function(vec) {
        if (this.x === vec.x && this.y === vec.y) {
            return true;
        }
        return false;
    },
    equals: function(vec) {
        return Math.abs(this.x - vec.x) <= meta.epsilon * Math.max(1, Math.abs(this.x), Math.abs(vec.x)) && Math.abs(this.y - vec.y) <= meta.epsilon * Math.max(1, Math.abs(this.y), Math.abs(vec.y));
    },
    getNormalized: function() {
        var mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag === 0) {
            return new meta.vector2(0, 0);
        }
        return new meta.vector2(this.x / mag, this.y / mag);
    },
    getAngle: function() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;
    },
    toString: function() {
        return "x:" + this.x + " y:" + this.y;
    }
};

"use strict";

meta.AABB = function(x, y, width, height) {
    this.set(x, y, width, height);
};

meta.AABB.prototype = {
    set: function(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    },
    resize: function(width, height) {
        this.width = width;
        this.height = height;
    },
    move: function(diffX, diffY) {
        this.x += diffX;
        this.y += diffY;
    },
    position: function(x, y) {
        this.x = x;
        this.y = y;
    }
};

"use strict";

meta.Matrix4 = function(src) {
    if (src) {
        if (src instanceof Float32Array) {
            this.m = new Float32Array(src);
        } else if (src instanceof meta.Matrix4) {
            this.m = new Float32Array(src.m);
        }
    } else {
        this.create();
    }
};

meta.Matrix4.prototype = {
    create: function() {
        this.m = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
    },
    clone: function() {
        return new meta.Matrix4(this.m);
    },
    copy: function(matrix) {
        this.m.set(matrix.m);
    },
    set: function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        this.m[0] = m00;
        this.m[1] = m01;
        this.m[2] = m02;
        this.m[3] = m03;
        this.m[4] = m10;
        this.m[5] = m11;
        this.m[6] = m12;
        this.m[7] = m13;
        this.m[8] = m20;
        this.m[9] = m21;
        this.m[10] = m22;
        this.m[11] = m23;
        this.m[12] = m30;
        this.m[13] = m31;
        this.m[14] = m32;
        this.m[15] = m33;
    },
    identity: function() {
        this.m[0] = 1;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = 1;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = 0;
        this.m[9] = 0;
        this.m[10] = 1;
        this.m[11] = 0;
        this.m[12] = 0;
        this.m[13] = 0;
        this.m[14] = 0;
        this.m[15] = 1;
    },
    transpose: function() {
        var a01 = this.m[1];
        var a02 = this.m[2];
        var a03 = this.m[3];
        var a12 = this.m[6];
        var a13 = this.m[7];
        var a23 = this.m[11];
        this.m[1] = this.m[4];
        this.m[2] = this.m[8];
        this.m[3] = this.m[12];
        this.m[4] = a01;
        this.m[6] = this.m[9];
        this.m[7] = this.m[13];
        this.m[8] = a02;
        this.m[9] = a12;
        this.m[11] = this.m[14];
        this.m[12] = a03;
        this.m[13] = a13;
        this.m[14] = a23;
    },
    translate: function(x, y, z) {
        this.m[12] += this.m[0] * x + this.m[4] * y + this.m[8] * z;
        this.m[13] += this.m[1] * x + this.m[5] * y + this.m[9] * z;
        this.m[14] += this.m[2] * x + this.m[6] * y + this.m[10] * z;
        this.m[15] += this.m[3] * x + this.m[7] * y + this.m[11] * z;
    },
    scale: function(x, y, z) {
        this.m[0] *= x;
        this.m[1] *= x;
        this.m[2] *= x;
        this.m[3] *= x;
        this.m[4] *= y;
        this.m[5] *= y;
        this.m[6] *= y;
        this.m[7] *= y;
        this.m[8] *= z;
        this.m[9] *= z;
        this.m[10] *= z;
        this.m[11] *= z;
    },
    ortho: function(left, right, bottom, top, near, far) {
        var leftRight = 1 / (left - right);
        var bottomTop = 1 / (bottom - top);
        var nearFar = 1 / (near - far);
        this.m[0] = -2 * leftRight;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = -2 * bottomTop;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = 0;
        this.m[9] = 0;
        this.m[10] = 2 * nearFar;
        this.m[11] = 0;
        this.m[12] = (left + right) * leftRight;
        this.m[13] = (top + bottom) * bottomTop;
        this.m[14] = (far + near) * nearFar;
        this.m[15] = 1;
    },
    perspective: function(fovy, aspect, near, far) {
        var fov = 1 / Math.tan(fovy / 2);
        var nearFar = 1 / (near - far);
        this.m[0] = fov / aspect;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = fov;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = 0;
        this.m[9] = 0;
        this.m[10] = (far + near) * nearFar;
        this.m[11] = -1;
        this.m[12] = 0;
        this.m[13] = 0;
        this.m[14] = 2 * far * near * nearFar;
        this.m[15] = 0;
    },
    frustum: function(left, right, bottom, top, near, far) {
        var rightLeft = 1 / (right - left);
        var topBottom = 1 / (top - bottom);
        var nearFar = 1 / (near - far);
        this.m[0] = near * 2 * rightLeft;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = near * 2 * topBottom;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = (right + left) * rightLeft;
        this.m[9] = (top + bottom) * topBottom;
        this.m[10] = (far + near) * nearFar;
        this.m[11] = -1;
        this.m[12] = 0;
        this.m[13] = 0;
        this.m[14] = far * near * 2 * nearFar;
        this.m[15] = 0;
    },
    fromTransformation: function(x, y, z) {
        this.m[0] = 1;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = 1;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = 0;
        this.m[9] = 0;
        this.m[10] = 1;
        this.m[11] = 0;
        this.m[12] = x;
        this.m[13] = y;
        this.m[14] = z;
        this.m[15] = 1;
    },
    toString: function() {
        return "[" + this.m[0] + ", " + this.m[1] + ", " + this.m[2] + ", " + this.m[3] + this.m[4] + ", " + this.m[5] + ", " + this.m[6] + ", " + this.m[7] + this.m[8] + ", " + this.m[9] + ", " + this.m[10] + ", " + this.m[11] + this.m[12] + ", " + this.m[13] + ", " + this.m[14] + ", " + this.m[15] + "]";
    }
};

"use strict";

meta.Random = function() {
    this.seed = 0;
    this.a = 0;
    this.m = 0;
    this.q = 0;
    this.r = 0;
    this.oneOverM = 0;
    this.init();
};

meta.Random.prototype = {
    init: function() {
        this.setSeed(Date.now(), true);
    },
    generate: function() {
        var hi = Math.floor(this.seed / this.q);
        var lo = this.seed % this.q;
        var test = this.a * lo - this.r * hi;
        if (test > 0) {
            this.seed = test;
        } else {
            this.seed = test + this.m;
        }
        return this.seed * this.oneOverM;
    },
    number: function(min, max) {
        var number = this.generate();
        return Math.round((max - min) * number + min);
    },
    numberF: function(min, max) {
        var number = this.generate();
        return (max - min) * number + min;
    },
    setSeed: function(seed, useTime) {
        if (useTime !== void 0) {
            useTime = true;
        }
        if (useTime === true) {
            var date = new Date();
            this.seed = seed + date.getSeconds() * 16777215 + date.getMinutes() * 65535;
        } else {
            this.seed = seed;
        }
        this.a = 48271;
        this.m = 2147483647;
        this.q = Math.floor(this.m / this.a);
        this.r = this.m % this.a;
        this.oneOverM = 1 / this.m;
    }
};

meta.random = new meta.Random();

"use strict";

meta.Color = function(r, g, b) {
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
};

meta.Color.prototype = {
    setHex: function(hex) {
        var hex = Math.floor(hex);
        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;
    },
    getHex: function() {
        return this.r * 255 << 16 ^ this.g * 255 << 8 ^ this.b * 255 << 0;
    }
};

"use strict";

meta.renderer = {
    setup: function() {
        var gl = meta.engine.gl;
        this.gl = gl;
        this.bgColor = 14540253;
        this.prepareVBO();
        gl.activeTexture(gl.TEXTURE0);
        gl.enable(gl.BLEND);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        var spriteShader = meta.new(meta.Shader, {
            id: "sprite",
            vertexShader: [ "#define PI 3.1415926535897932384626433832795", "attribute vec3 vertexPos;", "attribute vec2 uvCoords;", "uniform mat4 modelViewMatrix;", "uniform mat4 projMatrix;", "uniform float angle;", "varying highp vec2 var_uvCoords;", "void main(void) {", "	float angleX = sin(angle);", "	float angleY = cos(angle);", "	vec2 rotatedPos = vec2(vertexPos.x * angleY + vertexPos.y * angleX, vertexPos.y * angleY - vertexPos.x * angleX);", "	gl_Position = projMatrix * modelViewMatrix * vec4(rotatedPos, vertexPos.z, 1.0);", "	var_uvCoords = uvCoords;", "}" ],
            fragmentShader: [ "varying highp vec2 var_uvCoords;", "uniform sampler2D texture;", "void main(void) {", "	gl_FragColor = texture2D(texture, vec2(var_uvCoords.s, var_uvCoords.t));", "}" ]
        });
        spriteShader.use();
        this.entities.length = 16;
        this.entitiesRemove.length = 8;
        meta.on("update", this.update, this);
    },
    prepareVBO: function() {
        var gl = meta.engine.gl;
        var indices = [ 0, 1, 2, 0, 2, 3 ];
        var uvCoords = [ 0, 0, 1, 0, 1, 1, 0, 1 ];
        this.vertices = new Float32Array(8);
        this.vbo = gl.createBuffer();
        this.uv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvCoords), gl.STATIC_DRAW);
        this.indiceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    },
    update: function(tDelta) {
        if (this.numEntitiesRemove > 0) {
            for (var n = 0; n < this.numEntitiesRemove; n++) {
                var entity = this.entitiesRemove[n];
                var index = this.entities.indexOf(entity);
                if (index === -1) {
                    console.warn("(meta.renderer.update) Trying to remove entity that is not part of visible entities");
                    continue;
                }
                this.numEntities--;
                this.entities[index] = this.entities[this.numEntities];
            }
            this.numEntitiesRemove = 0;
        }
        if (this.needSort) {
            this.entities.sort(this.sortFunc);
            this.needSort = false;
            this.needRender = true;
        }
    },
    render: function() {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        var projMatrix = new meta.Matrix4();
        projMatrix.ortho(0, meta.engine.width, meta.engine.height, 0, 0, 1);
        projMatrix.translate(-meta.camera.x, -meta.camera.y, 0);
        gl.uniformMatrix4fv(this.currShader.uniform.projMatrix, false, projMatrix.m);
        gl.uniform1i(this.currShader.uniform.texture, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.vertexAttribPointer(this.currShader.attrib.vertexPos, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv);
        gl.vertexAttribPointer(this.currShader.attrib.uvCoords, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        for (var n = 0; n < this.numEntities; n++) {
            var entity = this.entities[n];
            var texture = entity.texture;
            if (!texture) {
                return;
            }
            if (!texture.loaded) {
                return;
            }
            var width = texture.width * entity.$scaleX;
            var height = texture.height * entity.$scaleY;
            var minX = -width * entity.$pivotX;
            var minY = -height * entity.$pivotY;
            var maxX = minX + width;
            var maxY = minY + height;
            this.vertices[0] = minX;
            this.vertices[1] = minY;
            this.vertices[2] = maxX;
            this.vertices[3] = minY;
            this.vertices[4] = maxX;
            this.vertices[5] = maxY;
            this.vertices[6] = minX;
            this.vertices[7] = maxY;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
            gl.bindTexture(gl.TEXTURE_2D, entity.texture.instance);
            var modelViewMatrix = new meta.Matrix4();
            modelViewMatrix.translate(entity.$x, entity.$y, 0);
            gl.uniformMatrix4fv(this.currShader.uniform.modelViewMatrix, false, modelViewMatrix.m);
            gl.uniform1f(this.currShader.uniform.angle, entity.$angle);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        this.needRender = false;
    },
    sortFunc: function(a, b) {
        return a.totalZ - b.totalZ;
    },
    onResize: function() {
        this.gl.viewport(0, 0, meta.engine.width, meta.engine.height);
    },
    addEntities: function(entities) {
        for (var n = 0; n < entities.length; n++) {
            this.addEntity(entities[n]);
        }
    },
    removeEntities: function(entities) {
        for (var n = 0; n < entities.length; n++) {
            this.removeEntity(entities[n]);
        }
    },
    addEntity: function(entity) {
        if (entity.flags & entity.Flag.RENDERING) {
            return;
        }
        entity.flags |= entity.Flag.RENDERING;
        if (this.numEntities === this.entities.length) {
            this.entities.length += 8;
        }
        this.entities[this.numEntities++] = entity;
    },
    removeEntity: function(entity) {
        if ((entity.flags & entity.Flag.RENDERING) === 0) {
            return;
        }
        entity.flags &= ~entity.Flag.RENDERING;
        if (this.numEntitiesRemove === this.entitiesRemove.length) {
            this.entitiesRemove.length += 8;
        }
        this.entitiesRemove[this.numEntitiesRemove++] = entity;
    },
    set bgColor(hex) {
        if (this.$bgColor.getHex() === hex) {
            return;
        }
        this.$bgColor.setHex(hex);
        this.gl.clearColor(this.$bgColor.r, this.$bgColor.g, this.$bgColor.b, 1);
    },
    get color() {
        this.$bgColor;
    },
    entities: [],
    numEntities: 0,
    entitiesRemove: [],
    numEntitiesRemove: 0,
    vbo: null,
    uv: null,
    indiceBuffer: null,
    $bgColor: new meta.Color(0, 0, 0),
    currShader: null
};

"use strict";

meta.renderer.SpriteBatch = function() {};

meta.renderer.SpriteBatch.prototype = {
    create: function() {},
    capacity: 100
};

"use strict";

meta.resources = {
    add: function(resource) {
        if (!resource) {
            return console.warn("(meta.resources.add) Invalid resource passed");
        }
        if (!resource.type) {
            return console.warn("(meta.resources.add) Invalid resource type");
        }
        if (resource.flags & resource.Flag.ADDED) {
            return console.warn("(meta.resources.add) Resource is already added to manager: " + resource.id);
        }
        var buffer = this.table[resource.type];
        if (!buffer) {
            buffer = {};
            this.table[type] = buffer;
        }
        if (buffer[resource.id]) {
            return console.warn("(meta.resources.load) There is already resource with id: " + resource.id + ", and type: " + resource.type);
        }
        resource.flags |= resource.Flag.ADDED;
        buffer[resource.id] = resource;
    },
    remove: function(resource) {
        if (!resource) {
            return console.warn("(meta.resources.remove) Invalid resource passed");
        }
        if ((resource.flags & resource.Flag.ADDED) === 0) {
            return console.warn("(meta.resources.remove) Resource has not been added to the manager: " + resource.id);
        }
        var buffer = this.table[resource.type];
        if (!buffer) {
            return console.warn("(meta.resources.remove) No resources with such type added: " + resource.type);
        }
        if (resource instanceof meta.Resource) {
            if (!buffer[resource.id]) {
                return console.warn("(meta.resources.remove) No resources with such type added: " + resource.type);
            }
            delete buffer[resource.id];
        } else if (typeof resource === "string") {
            var ref = buffer[resource];
            if (!ref) {
                return console.warn("(meta.resources.remove) No resources with such type added: " + resource.type);
            }
            delete buffer[resource];
            resource = ref;
        } else {
            return console.warn("(meta.resources.remove) Invalid resource or id passed");
        }
        resource.$remove();
    },
    load: function(type, cls, params) {
        var buffer = this.table[type];
        if (!buffer) {
            buffer = {};
            this.table[type] = buffer;
        }
        var resource = meta.new(cls, params);
        if (!resource.id) {
            meta.delete(resource);
            console.warn("(meta.resources.load) Created resource with invalid ID from params: `" + params + "`");
            return null;
        }
        if (buffer[resource.id]) {
            meta.delete(resource);
            console.warn("(meta.resources.load) There is already resource with id: `" + resource.id + "` that has type: `" + resource.type + "`");
            return null;
        }
        buffer[resource.id] = resource;
        return resource;
    },
    get: function(type, id) {
        var buffer = this.table[type];
        if (!buffer) {
            console.warn("(meta.resources.get) No resources found for type: " + type);
            return;
        }
        var resource = buffer[id];
        if (!resource) {
            console.warn("(meta.resources.get) There is no resource with id: " + id + ", and type: " + type);
            return;
        }
        return resource;
    },
    loadShader: function(id, params) {
        return this.load("shader", meta.Shader, id, params);
    },
    getShader: function(id) {
        return this.get("shader", id);
    },
    loadTexture: function(id, params) {
        return this.load("texture", meta.Texture, id, params);
    },
    getTexture: function(id) {
        return this.get("texture", id);
    },
    loadVideo: function(id, params) {
        return this.load("video", meta.Video, id, params);
    },
    getVideo: function(id) {
        return this.get("video", id);
    },
    rootPath: "",
    table: {
        texture: {},
        shader: {},
        audio: {},
        atlas: {},
        video: {}
    }
};

"use strict";

meta.class("meta.Resource", {
    init: function(params, id) {
        this.create(params, id);
    },
    create: function(params, id) {
        if (this.flags & this.Flag.ADDED) {
            return;
        }
        if (!id) {
            if (typeof params === "string") {
                this.id = meta.getNameFromPath(params);
            } else if (params instanceof Object && params.id) {
                this.id = params.id;
            } else {
                this.id = meta.genUniqueId();
            }
        }
        if (this.setup) {
            this.setup(params);
        }
        if (params) {
            this.loadParams(params);
        }
        meta.resources.add(this);
    },
    remove: function() {
        if (this.flags & this.Flag.ADDED) {
            meta.resources.remove(this.type, this.id);
        } else {
            this.$remove();
        }
    },
    $remove: function() {
        this.emit("removed");
        if (this.cleanup) {
            this.cleanup();
        }
    },
    loadParams: function(params) {
        if (typeof params === "object") {
            for (var key in params) {
                this[key] = params[key];
            }
        }
    },
    watch: function(func, owner) {
        var watcher = new meta.Watcher(func, owner);
        if (this.watchers) {
            this.watchers.push(watcher);
        } else {
            this.watchers = [ watcher ];
        }
    },
    unwatch: function(owner) {
        var num = this.watchers.length;
        for (var n = 0; n < num; n++) {
            if (this.watchers[n].owner === owner) {
                this.watchers[n] = this.watchers[num - 1];
                this.watchers.pop();
                break;
            }
        }
    },
    emit: function(event) {
        if (!this.watchers) {
            return;
        }
        for (var n = 0; n < this.watchers.length; n++) {
            var watcher = this.watchers[n];
            watcher.func.call(watcher.owner, event);
        }
    },
    get loaded() {
        return (this.flags & this.Flag.LOADED) === this.Flag.LOADED;
    },
    set loading(value) {
        if (value) {
            if (this.flags & this.Flag.LOADING) {
                return;
            }
            this.flags |= this.Flag.LOADING;
        } else {
            if ((this.flags & this.Flag.LOADING) === 0) {
                return;
            }
            this.flags &= ~this.Flag.LOADING;
            this.flags |= this.Flag.LOADED;
            this.emit("loaded");
        }
    },
    get loading() {
        return (this.flags & this.Flag.LOADING) === this.Flag.LOADING;
    },
    set data(data) {
        if (this.$data === data) {
            return;
        }
        if (this.$data) {
            this.$data.unwatch(this.handleData, this);
        }
        this.$data = data;
        if (this.$data) {
            var table = meta.resources.table[this.type];
            delete table[this.id];
            var raw = data.raw;
            for (var key in raw) {
                var value = this[key];
                var newValue = raw[key];
                if (value === undefined || value === newValue) {
                    continue;
                }
                this[key] = raw[key];
            }
            this.id = this.$data.id;
            table[this.id] = this;
            this.$data.watch(this.handleData, this);
        }
    },
    get data() {
        return this.$data;
    },
    handleData: function(event) {
        console.log("data_changed");
    },
    Flag: {
        ADDED: 1 << 0,
        LOADED: 1 << 1,
        LOADING: 1 << 2
    },
    id: null,
    type: null,
    $data: null,
    watchers: null,
    flags: 0
});

"use strict";

meta.class("meta.Texture", "meta.Resource", {
    setup: function(params) {
        var self = this;
        this.instance = meta.engine.gl.createTexture();
        this.image = new Image();
        this.image.onload = function() {
            self.$load();
        };
        if (typeof params === "string") {
            this.path = params;
        }
    },
    cleanup: function() {
        meta.engine.gl.deleteTexture(this.instance);
        this.instance = null;
        this.image = null;
        this.width = 0;
        this.height = 0;
    },
    load: function(path) {
        if (!params) {
            console.warn("(meta.Texture.load) Invalid path passed");
            return;
        }
        this.$path = path;
        this.ext = meta.getExtFromPath(params);
        this.image.src = meta.resources.rootPath + path;
        var path;
        if (params) {
            if (typeof params === "string") {
                path = params;
                this.id = meta.getNameFromPath(params);
            } else {
                if (!params.path) {
                    return;
                }
                path = params.path;
                this.id = params.id || meta.getNameFromPath(path);
            }
            this.ext = meta.getExtFromPath(params);
            if (this.ext) {
                this.path = params;
            } else {
                this.ext = "png";
                this.path = params + ".png";
            }
            this.image.src = meta.resources.rootPath + path;
        }
    },
    load: function(path) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        if (!path) {
            this.image.src = "";
            this.$load();
        } else {
            this.image.src = meta.resources.rootPath + path;
        }
    },
    $load: function() {
        this.width = this.image.width;
        this.height = this.image.height;
        var gl = meta.engine.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.instance);
        if (this.isPowTwo()) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            if (meta.flags.autoPowTwo) {
                this.resizePowTwo();
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
        }
        this.image.src = null;
        var ext = meta.getExt("EXT_texture_filter_anisotropic");
        if (ext) {
            gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, meta.getExtParam(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.loading = false;
    },
    resizePowTwo: function() {
        var canvas = document.createElement("canvas");
        canvas.imageSmoothingEnabled = false;
        canvas.width = meta.upperPowerOfTwo(this.width);
        canvas.height = meta.upperPowerOfTwo(this.height);
        var context = canvas.getContext("2d");
        context.drawImage(this.image, 0, 0, canvas.width, canvas.height);
        console.warn("(meta.Texture.resizePowTwo) Resized image `" + this.id + "` from (" + this.width + "x" + this.height + ") to (" + canvas.width + "x" + canvas.height + ")");
        this.fullWidth = canvas.width;
        this.fullHeight = canvas.height;
        this.image = canvas;
    },
    isPowTwo: function() {
        var isWidth = this.width != 0 && (this.width & ~this.width + 1) === this.width;
        if (!isWidth) {
            return false;
        }
        var isHeight = this.height != 0 && (this.height & ~this.height + 1) === this.height;
        if (!isHeight) {
            return false;
        }
        return true;
    },
    set path(path) {
        if (this.$path === path) {
            return;
        }
        this.$path = path;
        if (path) {
            this.load(path);
        }
    },
    get path() {
        return this.$path;
    },
    type: "texture",
    instance: null,
    image: null,
    width: 0,
    height: 0,
    fullWidth: 0,
    fullHeight: 0,
    ext: null,
    $path: null
});

"use strict";

meta.class("meta.Video", "meta.Resource", {
    onCanPlay: function() {},
    onEnd: function() {},
    set path(path) {
        if (this.$path === path) {
            return;
        }
        this.$path = path;
        if (!this.videoElement) {
            var self = this;
            this.videoElement = document.createElement("video");
            this.videoElement.preload = "auto";
            this.videoElement.oncanplaythrough = function() {
                self.onCanPlay();
            };
            this.videoElement.onended = function() {
                self.onEnd();
            };
        }
        this.videoElement.src = path;
    },
    get path() {
        return this.$path;
    },
    type: "video",
    $path: null,
    videoElement: null
});

"use strict";

meta.class("meta.Shader", "meta.Resource", {
    cleanup: function() {
        var gl = meta.engine.gl;
        gl.deleteProgram(this.program);
        gl.deleteShader(this.$vertexShader);
        gl.deleteShader(this.$fragmentShader);
        this.program = null;
        this.$vertexShader = null;
        this.$fragmentShader = null;
    },
    compile: function() {
        if (!this.$vertexShader) {
            return;
        }
        if (!this.$fragmentShader) {
            return;
        }
        var gl = meta.engine.gl;
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.$vertexShader);
        gl.attachShader(this.program, this.$fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.warn("(meta.Shader.compile) Shader program failed to link: " + gl.getShaderInfoLog(this.program));
            gl.deleteProgram(this.program);
            gl.deleteShader(this.$vertexShader);
            gl.deleteShader(this.$fragmentShader);
            this.program = null;
            this.$vertexShader = null;
            this.$fragmentShader = null;
            return;
        }
        this.loadAttribs();
        this.loadUniforms();
    },
    use: function() {
        meta.engine.gl.useProgram(this.program);
        meta.renderer.currShader = this;
    },
    loadAttribs: function() {
        this.attrib = {};
        var gl = meta.engine.gl;
        var num = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (var n = 0; n < num; n++) {
            var attrib = gl.getActiveAttrib(this.program, n);
            var attribLoc = gl.getAttribLocation(this.program, attrib.name);
            gl.enableVertexAttribArray(attribLoc);
            this.attrib[attrib.name] = attribLoc;
        }
    },
    loadUniforms: function() {
        this.uniform = {};
        var gl = meta.engine.gl;
        var num = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (var n = 0; n < num; n++) {
            var uniform = gl.getActiveUniform(this.program, n);
            var name = uniform.name.replace("[0]", "");
            this.uniform[name] = gl.getUniformLocation(this.program, name);
        }
    },
    set vertexShader(src) {
        var gl = meta.engine.gl;
        if (!this.$vertexShader) {
            this.$vertexShader = gl.createShader(gl.VERTEX_SHADER);
        }
        if (src instanceof Array) {
            src = src.join("\n");
        }
        gl.shaderSource(this.$vertexShader, src);
        gl.compileShader(this.$vertexShader);
        if (!gl.getShaderParameter(this.$vertexShader, gl.COMPILE_STATUS)) {
            console.warn("(meta.Shader.vertexShader) [" + this.id + "]: " + gl.getShaderInfoLog(this.$vertexShader));
            gl.deleteShader(this.$vertexShader);
            this.$vertexShader = null;
            return;
        }
        if (this.$fragmentShader) {
            this.compile();
        }
    },
    get vertexShader() {
        return this.$vertexShader;
    },
    set fragmentShader(src) {
        var gl = meta.engine.gl;
        if (!this.$fragmentShader) {
            this.$fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        if (src instanceof Array) {
            src = src.join("\n");
        }
        gl.shaderSource(this.$fragmentShader, src);
        gl.compileShader(this.$fragmentShader);
        if (!gl.getShaderParameter(this.$fragmentShader, gl.COMPILE_STATUS)) {
            console.warn("(meta.Shader.fragmentShader) [" + this.id + "]: " + gl.getShaderInfoLog(this.$fragmentShader));
            gl.deleteShader(this.$fragmentShader);
            this.$fragmentShader = null;
            return;
        }
        if (this.$vertexShader) {
            this.compile();
        }
    },
    get fragmentShader() {
        return this.$fragmentShader;
    },
    type: "shader",
    attributre: null,
    uniform: null,
    $vertexShader: null,
    $fragmentShader: null
});

"use strict";

meta.class("meta.Sprite", {
    init: function(params) {
        this.$volume = new meta.AABB(0, 0, 0, 0);
        this.create(params);
    },
    create: function(params) {
        this.flags = 0;
        this.loadParams(params);
    },
    cleanup: function() {
        if (this.flags & this.Flag.REMOVED) {
            return;
        }
        this.flags |= this.Flag.REMOVED;
        this.$x = this.$y = this.$z = 0;
    },
    remove: function() {
        if (this.$view) {
            this.$view.remove(this);
        } else {
            this.cleanup();
        }
    },
    loadParams: function(params) {
        if (!params) {
            return;
        }
        if (typeof params === "string") {
            this.texture = params;
        } else if (params instanceof meta.Texture) {
            this.texture = params;
        } else {
            for (var key in params) {
                this[key] = params[key];
            }
        }
    },
    position: function(x, y) {
        this.$x = 0;
        this.$y = 0;
        this.updatePosition();
    },
    move: function(deltaX, deltaY) {
        this.$x += deltaX;
        this.$y += deltaY;
        this.updatePosition();
    },
    updatePosition: function() {},
    updateZ: function() {
        this.totalZ = this.$z;
        meta.renderer.needSort = true;
    },
    set x(value) {
        this.$x = value;
        this.updatePosition();
    },
    set y(value) {
        this.$y = value;
        this.updatePosition();
    },
    get x() {
        return this.$x;
    },
    get y() {
        return this.$y;
    },
    set z(value) {
        this.$z = value;
        this.updateZ();
    },
    get z() {
        return this.$z;
    },
    set angle(degree) {
        var newAngle = degree * Math.PI / 180;
        if (this.$angle === newAngle) {
            return;
        }
        this.$angle = newAngle;
    },
    set angleRad(angle) {
        if (this.$angle === angle) {
            return;
        }
        this.$angle = angle;
    },
    get angle() {
        return this.$angle * 180 / Math.PI;
    },
    get angleRad() {
        return this.$angle;
    },
    anchor: function(x, y) {},
    pivot: function(x, y) {
        if (this.$pivotX === x && this.$pivotY === y) {
            return;
        }
        this.$pivotX = x;
        this.$pivotY = y;
    },
    set pivotX(x) {
        if (this.$pivotX === x) {
            return;
        }
        this.$pivotX = x;
    },
    set pivotY(y) {
        if (this.$pivotY === y) {
            return;
        }
        this.$pivotY = y;
    },
    get pivotX() {
        return this.$pivotX;
    },
    get pivotY() {
        return this.$pivotY;
    },
    scale: function(x, y) {
        if (this.$scaleX === x && this.$scaleY === y) {
            return;
        }
        this.$scaleX = x;
        this.$scaleY = y;
    },
    set scaleX(x) {
        if (this.$scaleX === x) {
            return;
        }
        this.$scaleX = x;
    },
    set scaleY(y) {
        if (this.$scaleY === y) {
            return;
        }
        this.$scaleY = y;
    },
    get scaleX() {
        return this.$scaleX;
    },
    get scaleY() {
        return this.$scaleY;
    },
    onClick: null,
    onPress: null,
    set texture(texture) {
        if (typeof texture === "string") {
            if (texture === "") {
                texture = null;
            } else {
                texture = meta.resources.getTexture(texture);
            }
        }
        if (this.$texture) {
            if (texture && this.$texture.id === texture.id) {
                return;
            }
            this.$texture.unwatch(this);
        }
        this.$texture = texture;
        if (this.$texture) {
            this.$texture.watch(this.handleTexture, this);
        }
    },
    get texture() {
        return this.$texture;
    },
    handleTexture: function(event) {
        if (event === "loaded" || event === "updated") {
            this.$volume.resize(this.$texture.width, this.$texture.height);
        }
    },
    set shader(id) {
        if (typeof shader === "string") {
            shader = meta.resources.getShader(shader);
        }
        if (this.$shader) {
            if (this.$shader.id === shader.id) {
                return;
            }
            this.$shader.unwatch(this);
        }
        this.$shader = shader;
        if (this.$shader) {
            this.$shader.watch(this.handleShader, this);
        }
    },
    get shader() {
        return this.$shader;
    },
    handleShader: function(event, data) {},
    set data(data) {
        if (this.$data === data) {
            return;
        }
        if (this.$data) {
            this.$data.unwatch(this.handleData, this);
        }
        this.$data = data;
        if (this.$data) {
            var raw = data.raw;
            for (var key in raw) {
                var value = this[key];
                var newValue = raw[key];
                if (value === undefined || value === newValue) {
                    continue;
                }
                this[key] = raw[key];
            }
            this.$data.watch(this.handleData, this);
        }
    },
    get data() {
        return this.$data;
    },
    handleData: function(action, key, value, index, data) {
        switch (action) {
          case "set":
            {
                if (this[key] === undefined) {
                    return;
                }
                this[key] = value;
            }
            break;
        }
    },
    Flag: {
        REMOVE: 1 << 0,
        REMOVED: 1 << 1,
        INSTANCE_ENABLED: 1 << 2,
        INSTANCE_VISIBLE: 1 << 3,
        ROOT: 1 << 4,
        RENDERING: 1 << 5
    },
    $view: null,
    parent: null,
    $volume: null,
    flags: 0,
    $x: 0,
    $y: 0,
    $z: 0,
    totalZ: 0,
    $angle: null,
    $texture: null,
    $shader: null,
    $scaleX: 1,
    $scaleY: 1,
    $anchorX: 0,
    $anchorY: 0,
    $pivotX: 0,
    $pivotY: 0,
    $data: null
});

"use strict";

meta.class("meta.Text", "meta.Sprite", {});

"use strict";

meta.class("meta.Particle", {});

"use strict";

meta.on("domload", function() {
    meta.engine.init();
});

function DomLoad() {
    if (document.readyState === "interactive" || document.readyState === "complete") {
        meta.emit("domload");
        return;
    }
    var cbFunc = function(event) {
        meta.emit("domload");
        window.removeEventListener("DOMContentLoaded", cbFunc);
    };
    window.addEventListener("DOMContentLoaded", cbFunc);
}

DomLoad();