#!/bin/bash
cd ../src/
cat wabi/src/wabi.js \
	wabi/src/event.js \
	wabi/src/data.js \
	wabi/src/elements/basic.js \
	wabi/src/elements/button.js \
	wabi/src/elements/canvas.js \
	wabi/src/elements/caret.js \
	wabi/src/elements/checkbox.js \
	wabi/src/elements/content.js \
	wabi/src/elements/div.js \
	wabi/src/elements/dropdown.js \
	wabi/src/elements/desc.js \
	wabi/src/elements/error.js \
	wabi/src/elements/header.js \
	wabi/src/elements/headerEx.js \
	wabi/src/elements/html.js \
	wabi/src/elements/icon.js \
	wabi/src/elements/span.js \
	wabi/src/elements/iframe.js \
	wabi/src/elements/input.js \
	wabi/src/elements/label.js \
	wabi/src/elements/loader.js \
	wabi/src/elements/menubar.js \
	wabi/src/elements/number.js \
	wabi/src/elements/list.js \
	wabi/src/elements/panel.js \
	wabi/src/elements/row.js \
	wabi/src/elements/tag.js \
	wabi/src/elements/text.js \
	wabi/src/elements/word.js \
	wabi/src/elements/upload.js \
	wabi/src/elements/wrapped.js \
	| uglifyjs --output ../build/wabi.dev.js -b
