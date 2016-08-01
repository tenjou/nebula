"use strict";

wabi.element("item",
{
	elements: {
		word: {
			type: "word",
			bind: "value"
		},
		tag: {
			type: "tag",
			bind: "ext"
		}
	}
})


meta.onDomLoad(function() {
	editor.prepare();
});
