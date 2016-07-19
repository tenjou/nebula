"use strict";

editor.config = {
	version: "0.1",
	titlePrefix: "MetaEditor",
	wsUrl: ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + ":8080",
	httpUrl: window.location.protocol + '//' + window.location.host
};
