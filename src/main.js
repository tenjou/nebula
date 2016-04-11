"use strict";

var editor = null;

meta.onDomLoad(function() {
	meta.classLoaded();
	editor = new Editor();
	editor.prepare();
});