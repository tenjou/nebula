"use strict";

editor.config = {
	titlePrefix: "Store Editor",
	wsUrl: ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host,
	httpUrl: window.location.protocol + '//' + window.location.host
};
